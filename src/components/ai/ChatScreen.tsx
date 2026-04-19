import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useDispatch, useSelector } from 'react-redux'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import * as Speech from 'expo-speech'
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated'

import ChatEmptyState from './ChatEmptyState'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import useChatAutoScroll from '../common/useChatAutoScroll'
import {
  Animated,
  useKeyboardTranslateStyle
} from '../common/useKeyboardTranslateStyle'
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
const AI_CHAT_INPUT_NATIVE_ID = 'ai-chat-input'

export default function ChatScreen() {
  const insets = useSafeAreaInsets()
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [isListScrollEnabled, setIsListScrollEnabled] = useState(true)
  const keyboardDismissLock = useSharedValue(0)
  const {
    animatedStyle: keyboardAnimatedStyle,
    keyboardHeight,
    keyboardProgress,
    keyboardTransitionState
  } = useKeyboardTranslateStyle({
    bottomInset: insets.bottom
  })

  const displayMessages = useMemo(() => {
    if (!streamingMessage) return messages
    return [...messages, streamingMessage]
  }, [messages, streamingMessage])
  const hasDisplayMessages = displayMessages.length > 0

  const {
    scrollRef,
    showScrollBottom,
    scrollToBottom,
    handleScroll,
    handleContentSizeChange,
    handleListLoad,
    syncScrollState,
    stopCurrentScroll
  } = useChatAutoScroll({
    conversationKey: currentConversationId,
    showButtonThreshold: 140
  })

  const listRef =
    scrollRef as React.MutableRefObject<FlashListRef<Message> | null>

  const listContentStyle = useMemo(
    () => ({
      flexGrow: 1,
      justifyContent: 'flex-end' as const,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: LIST_BOTTOM_GAP
    }),
    []
  )

  const maintainVisibleContentPosition = useMemo(
    () => ({
      autoscrollToBottomThreshold: 0.2,
      animateAutoScrollToBottom: false,
      startRenderingFromBottom: true
    }),
    []
  )

  const listExtraData = useMemo(
    () => ({
      isStreaming,
      speakingTimestamp,
      streamingTimestamp: streamingMessage?.timestamp ?? 0
    }),
    [isStreaming, speakingTimestamp, streamingMessage?.timestamp]
  )

  const getMessageKey = useCallback((item: Message) => {
    return `${item.timestamp}-${item.role}`
  }, [])

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

  const unlockListScroll = useCallback(() => {
    setIsListScrollEnabled(true)
  }, [])

  useAnimatedReaction(
    () =>
      keyboardTransitionState.value === 1 ||
      keyboardHeight.value > 0.5 ||
      keyboardProgress.value > 0.01,
    (visible, previous) => {
      if (visible === previous) return
      runOnJS(setIsKeyboardVisible)(visible)
    },
    []
  )

  useAnimatedReaction(
    () => ({
      locked: keyboardDismissLock.value,
      height: keyboardHeight.value,
      progress: keyboardProgress.value,
      moving: keyboardTransitionState.value
    }),
    current => {
      if (current.locked !== 1) return

      const keyboardClosed =
        current.height <= 0.5 &&
        current.progress <= 0.01 &&
        current.moving === 0

      if (!keyboardClosed) return

      keyboardDismissLock.value = 0
      runOnJS(unlockListScroll)()
    },
    [unlockListScroll]
  )

  const handleListTouchStart = useCallback(() => {
    if (!isKeyboardVisible || !isListScrollEnabled) return

    keyboardDismissLock.value = 1
    setIsListScrollEnabled(false)
    stopCurrentScroll()
    Keyboard.dismiss()
  }, [
    isKeyboardVisible,
    isListScrollEnabled,
    keyboardDismissLock,
    stopCurrentScroll
  ])

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
          const finalAssistantMessage: Message = {
            content: fullContentRef.current,
            role: 'assistant',
            timestamp: Date.now()
          }
          // @ts-ignore
          dispatch(addMessage(finalAssistantMessage))
        }
      } catch (error: any) {
        const isAbortError =
          error?.name === 'AbortError' || error?.message === 'Aborted'
        if (!isAbortError) {
          console.error('Failed to send chat message:', error)
          showMessage('Message send failed. Please try again.')
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

  const keyExtractor = useCallback(
    (item: Message) => {
      return getMessageKey(item)
    },
    [getMessageKey]
  )

  const getItemType = useCallback(
    (item: Message) => {
      const isStreamingItem =
        !!streamingMessage &&
        item.timestamp === streamingMessage.timestamp &&
        item.role === 'assistant' &&
        isStreaming

      if (isStreamingItem) {
        return 'assistant-streaming'
      }

      if (item.role === 'user' && item.images && item.images.length > 0) {
        return 'user-images'
      }

      return item.role
    },
    [isStreaming, streamingMessage]
  )

  const handleListReady = useCallback(() => {
    handleListLoad()
  }, [handleListLoad])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <Animated.View style={[styles.layout, keyboardAnimatedStyle]}>
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
              getItemType={getItemType}
              renderItem={renderMessageItem}
              ItemSeparatorComponent={renderMessageSeparator}
              contentContainerStyle={listContentStyle}
              maintainVisibleContentPosition={maintainVisibleContentPosition}
              keyboardDismissMode="none"
              scrollEnabled={isListScrollEnabled}
              onTouchStart={handleListTouchStart}
              onScroll={handleScroll}
              onContentSizeChange={handleContentSizeChange}
              onLoad={handleListReady}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              drawDistance={360}
              extraData={listExtraData}
              style={styles.chatScroll}
            />
          )}

          {hasDisplayMessages && showScrollBottom && (
            <View pointerEvents="box-none" style={styles.scrollToBottomOverlay}>
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

        <View style={styles.inputBarWrap}>
          <View style={styles.inputBar}>
            <ChatInput
              inputNativeID={AI_CHAT_INPUT_NATIVE_ID}
              onSend={sendMessage}
              disabled={isLoading}
              privateKbEnabled={searchPrivate}
              onTogglePrivateKb={handleTogglePrivateKb}
            />
          </View>
        </View>
      </Animated.View>
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
  inputBarWrap: {
    backgroundColor: '#FAFAFA'
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
