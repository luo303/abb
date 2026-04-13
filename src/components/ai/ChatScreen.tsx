import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import * as Speech from 'expo-speech'

import ChatEmptyState from './ChatEmptyState'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import KeyboardStickyFooter from '../common/KeyboardStickyFooter'
import useChatAutoScroll from '../common/useChatAutoScroll'
import {
  useChatComposerMetrics,
  useKeyboardChatScrollRenderer
} from '../common/useKeyboardChatList'
import { useMessage } from '../Message'
import { SendMessageStream } from '@/api/ai'
import { RootState } from '../../store'
import {
  addMessage,
  createNewSession,
  loadInitialData,
  saveSessionMessagesToStorage,
  togglePrivateEnabled
} from '../../store/modules/ChatStore'
import { Message } from '../../types/AIchat'

const MESSAGE_ITEM_SPACING = 10
const LIST_BOTTOM_GAP = 12
const AI_CHAT_BASE_INPUT_HEIGHT = 136
const AI_CHAT_INPUT_NATIVE_ID = 'ai-chat-input'

export default function ChatScreen() {
  const messages = useSelector((state: RootState) => state.chat.messages)
  const currentConversationId = useSelector(
    (state: RootState) => state.chat.currentConversationId
  )
  const isLoading = useSelector((state: RootState) => state.chat.isLoading)
  const hasHydrated = useSelector((state: RootState) => state.chat.hasHydrated)
  const searchPrivate = useSelector(
    (state: RootState) => state.chat.search_private
  )

  const dispatch = useDispatch()
  const { showMessage } = useMessage()
  const abortControllerRef = useRef<AbortController | null>(null)
  const streamingFrameRef = useRef<number | null>(null)
  const streamingContentRef = useRef('')
  const speakingTimestampRef = useRef<number | null>(null)

  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)
  const [speakingTimestamp, setSpeakingTimestamp] = useState<number | null>(
    null
  )

  const {
    baseHeight: baseInputBarHeight,
    extraContentPadding,
    handleComposerLayout
  } = useChatComposerMetrics({
    initialHeight: AI_CHAT_BASE_INPUT_HEIGHT
  })

  const {
    scrollRef,
    showScrollBottom,
    scrollToBottom,
    handleScroll,
    handleContentSizeChange,
    handleListLoad,
    syncScrollState
  } = useChatAutoScroll({
    conversationKey: currentConversationId,
    showButtonThreshold: 140
  })

  const renderChatScrollComponent = useKeyboardChatScrollRenderer({
    extraContentPadding,
    keyboardLiftBehavior: 'whenAtEnd'
  })

  const displayMessages = useMemo(() => {
    if (!streamingMessage) return messages
    return [...messages, streamingMessage]
  }, [messages, streamingMessage])
  const hasDisplayMessages = displayMessages.length > 0

  const listRef =
    scrollRef as React.MutableRefObject<FlashListRef<Message> | null>

  const listContentStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: baseInputBarHeight + LIST_BOTTOM_GAP
    }),
    [baseInputBarHeight]
  )

  const scrollToBottomOverlayStyle = useMemo(
    () => [styles.scrollToBottomOverlay, { bottom: baseInputBarHeight + 16 }],
    [baseInputBarHeight]
  )

  const listExtraData = useMemo(
    () => ({
      isStreaming,
      speakingTimestamp,
      streamingTimestamp: streamingMessage?.timestamp ?? 0
    }),
    [isStreaming, speakingTimestamp, streamingMessage?.timestamp]
  )

  const updateSpeakingTimestamp = useCallback((timestamp: number | null) => {
    speakingTimestampRef.current = timestamp
    setSpeakingTimestamp(timestamp)
  }, [])

  const clearStreamingFrame = useCallback(() => {
    if (streamingFrameRef.current !== null) {
      cancelAnimationFrame(streamingFrameRef.current)
      streamingFrameRef.current = null
    }
  }, [])

  const flushStreamingMessage = useCallback(() => {
    clearStreamingFrame()
    const nextContent = streamingContentRef.current
    setStreamingMessage(prev => {
      if (!prev || prev.content === nextContent) return prev
      return { ...prev, content: nextContent }
    })
  }, [clearStreamingFrame])

  const scheduleStreamingMessage = useCallback(() => {
    if (streamingFrameRef.current !== null) return

    streamingFrameRef.current = requestAnimationFrame(() => {
      streamingFrameRef.current = null
      flushStreamingMessage()
    })
  }, [flushStreamingMessage])

  const resetStreamingState = useCallback(() => {
    clearStreamingFrame()
    streamingContentRef.current = ''
    setIsStreaming(false)
    setStreamingMessage(null)
  }, [clearStreamingFrame])

  useEffect(() => {
    if (!hasHydrated) {
      // @ts-ignore
      dispatch(loadInitialData())
    }
  }, [dispatch, hasHydrated])

  useEffect(() => {
    return () => {
      Speech.stop()
      clearStreamingFrame()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [clearStreamingFrame])

  useEffect(() => {
    Speech.stop()
    updateSpeakingTimestamp(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    resetStreamingState()
  }, [currentConversationId, resetStreamingState, updateSpeakingTimestamp])

  useEffect(() => {
    if (!currentConversationId) return
    saveSessionMessagesToStorage(currentConversationId, messages)
  }, [currentConversationId, messages])

  const handleSpeak = useCallback(
    (timestamp: number, text: string) => {
      if (speakingTimestampRef.current === timestamp) {
        Speech.stop()
        updateSpeakingTimestamp(null)
        return
      }

      Speech.stop()
      updateSpeakingTimestamp(timestamp)

      Speech.speak(text, {
        onDone: () => {
          if (speakingTimestampRef.current === timestamp) {
            updateSpeakingTimestamp(null)
          }
        },
        onStopped: () => {
          if (speakingTimestampRef.current === timestamp) {
            updateSpeakingTimestamp(null)
          }
        },
        onError: () => {
          if (speakingTimestampRef.current === timestamp) {
            updateSpeakingTimestamp(null)
          }
        }
      })
    },
    [updateSpeakingTimestamp]
  )

  const handleTogglePrivateKb = useCallback(() => {
    // @ts-ignore
    dispatch(togglePrivateEnabled())
  }, [dispatch])

  const sendMessage = useCallback(
    async (contentToSend: string, imagesToSend: string[]) => {
      if (!contentToSend) return

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      let sessionId = currentConversationId
      if (!sessionId) {
        sessionId = uuidv4()
        // @ts-ignore
        await dispatch(createNewSession(sessionId))
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      const userMsg: Message = {
        content: contentToSend,
        role: 'user',
        timestamp: Date.now(),
        images: imagesToSend
      }

      // @ts-ignore
      dispatch(addMessage(userMsg))

      const nextStreamingMessage: Message = {
        content: '',
        role: 'assistant',
        timestamp: Date.now()
      }

      syncScrollState(true)
      streamingContentRef.current = ''
      setStreamingMessage(nextStreamingMessage)
      setIsStreaming(true)

      try {
        let buffer = ''
        const fullContentRef = { current: '' }

        const processLine = (line: string) => {
          if (!line.startsWith('data:')) return

          const jsonStr = line.slice(5).trim()
          if (!jsonStr) return

          try {
            const data = JSON.parse(jsonStr)

            if (data.type === 'content' && data.content) {
              fullContentRef.current += data.content
              streamingContentRef.current = fullContentRef.current
              scheduleStreamingMessage()
              return
            }

            if (data.type === 'done') {
              flushStreamingMessage()
            }
          } catch (error) {
            console.error('SSE parse error:', error)
          }
        }

        await SendMessageStream(
          {
            session_id: sessionId,
            message: contentToSend,
            images: imagesToSend,
            kb_config: {
              enable: true,
              search_private: searchPrivate,
              search_public: true
            }
          },
          chunk => {
            buffer += chunk
            const blocks = buffer.split('\n\n')
            buffer = blocks.pop() || ''

            for (const block of blocks) {
              const lines = block.split('\n')
              lines.forEach(processLine)
            }
          },
          abortController.signal
        )

        if (buffer) {
          const lines = buffer.split('\n')
          lines.forEach(processLine)
        }

        const finalContent = fullContentRef.current.trim()
        if (finalContent.length > 0) {
          flushStreamingMessage()
          // @ts-ignore
          dispatch(
            addMessage({
              content: fullContentRef.current,
              role: 'assistant',
              timestamp: Date.now()
            })
          )
        }
      } catch (error: any) {
        const isAbortError =
          error?.name === 'AbortError' || error?.message === 'Aborted'
        if (!isAbortError) {
          console.error('消息发送失败:', error)
          showMessage('消息发送失败，请稍后重试')
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null
          resetStreamingState()
        }
      }
    },
    [
      currentConversationId,
      dispatch,
      flushStreamingMessage,
      resetStreamingState,
      scheduleStreamingMessage,
      searchPrivate,
      showMessage,
      syncScrollState
    ]
  )

  const renderMessageItem = useCallback(
    ({ item }: { item: Message }) => {
      const isStreamingItem =
        !!streamingMessage &&
        item.timestamp === streamingMessage.timestamp &&
        item.role === 'assistant' &&
        isStreaming

      return (
        <ChatMessage
          message={item}
          isSpeaking={!isStreamingItem && item.timestamp === speakingTimestamp}
          onSpeak={handleSpeak}
          isTyping={isStreamingItem}
        />
      )
    },
    [handleSpeak, isStreaming, speakingTimestamp, streamingMessage]
  )

  const renderMessageSeparator = useCallback(() => {
    return <View style={styles.messageSeparator} />
  }, [])

  const keyExtractor = useCallback((item: Message) => {
    return `${item.timestamp}-${item.role}`
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.layout}>
        <View style={styles.messagesContainer}>
          {isLoading && !hasDisplayMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1f99b0" />
            </View>
          ) : !hasDisplayMessages ? (
            <ChatEmptyState />
          ) : (
            <FlashList
              ref={listRef}
              data={displayMessages}
              keyExtractor={keyExtractor}
              renderItem={renderMessageItem}
              ItemSeparatorComponent={renderMessageSeparator}
              renderScrollComponent={renderChatScrollComponent}
              contentContainerStyle={listContentStyle}
              onScroll={handleScroll}
              onContentSizeChange={handleContentSizeChange}
              onLoad={handleListLoad}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
              drawDistance={360}
              extraData={listExtraData}
              style={styles.chatScroll}
            />
          )}

          {hasDisplayMessages && showScrollBottom && (
            <View pointerEvents="box-none" style={scrollToBottomOverlayStyle}>
              <TouchableOpacity
                style={styles.scrollToBottomButton}
                onPress={() => scrollToBottom(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <KeyboardStickyFooter style={styles.inputBarSticky}>
          <View style={styles.inputBar} onLayout={handleComposerLayout}>
            <ChatInput
              inputNativeID={AI_CHAT_INPUT_NATIVE_ID}
              onSend={sendMessage}
              disabled={isLoading}
              privateKbEnabled={searchPrivate}
              onTogglePrivateKb={handleTogglePrivateKb}
            />
          </View>
        </KeyboardStickyFooter>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  layout: {
    flex: 1
  },
  messagesContainer: {
    flex: 1,
    position: 'relative'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageSeparator: {
    height: MESSAGE_ITEM_SPACING
  },
  chatScroll: {
    flex: 1
  },
  inputBarSticky: {
    zIndex: 30
  },
  inputBar: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E6EB',
    borderBottomWidth: 0,
    overflow: 'hidden'
  },
  scrollToBottomOverlay: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    zIndex: 25
  },
  scrollToBottomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  }
})
