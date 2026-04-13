import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useSharedValue } from 'react-native-reanimated'

import ChatMessage from '../../components/ai/ChatMessage'
import useChatAutoScroll from '../../components/common/useChatAutoScroll'
import { useKeyboardChatScrollRenderer } from '../../components/common/useKeyboardChatList'
import { Message } from '../../types/AIchat'
import { GrowthAnalysisPayload, SendGrowthAnalysisStream } from '../../api/ai'
import * as Speech from 'expo-speech'

type GrowthAnalysisRouteParams = {
  growthAnalysis?: GrowthAnalysisPayload
}

const MESSAGE_ITEM_SPACING = 10

type AnalysisMessage = Message & {
  id: string
}

export default function GrowthAnalysis() {
  const route = useRoute<any>()
  const payload: GrowthAnalysisPayload | undefined = (
    route?.params as GrowthAnalysisRouteParams | undefined
  )?.growthAnalysis
  const [messages, setMessages] = useState<AnalysisMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const startedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const extraContentPadding = useSharedValue(0)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null
  )
  const speakingMessageIdRef = useRef<string | null>(null)
  const conversationKey = useMemo(() => {
    if (!payload) return 'growth-analysis'

    return `growth-analysis-${payload.metric}-${payload.items.length}`
  }, [payload])

  const {
    scrollRef,
    showScrollBottom,
    scrollToBottom,
    handleScroll,
    handleContentSizeChange,
    handleListLoad
  } = useChatAutoScroll({
    conversationKey,
    showButtonThreshold: 120
  })

  const listRef =
    scrollRef as React.MutableRefObject<FlashListRef<AnalysisMessage> | null>

  const renderChatScrollComponent = useKeyboardChatScrollRenderer({
    extraContentPadding,
    keyboardLiftBehavior: 'whenAtEnd'
  })

  const updateSpeakingMessageId = useCallback((id: string | null) => {
    speakingMessageIdRef.current = id
    setSpeakingMessageId(id)
  }, [])

  const handleSpeak = useCallback(
    (id: string, text: string) => {
      if (speakingMessageIdRef.current === id) {
        Speech.stop()
        updateSpeakingMessageId(null)
      } else {
        Speech.stop()
        updateSpeakingMessageId(id)
        Speech.speak(text, {
          onDone: () => {
            if (speakingMessageIdRef.current === id) {
              updateSpeakingMessageId(null)
            }
          },
          onStopped: () => {
            if (speakingMessageIdRef.current === id) {
              updateSpeakingMessageId(null)
            }
          },
          onError: () => {
            if (speakingMessageIdRef.current === id) {
              updateSpeakingMessageId(null)
            }
          }
        })
      }
    },
    [updateSpeakingMessageId]
  )

  useEffect(() => {
    if (!payload || startedRef.current) {
      if (!payload && !startedRef.current) {
        setErrorText('未获取到分析数据')
      }
      return
    }
    startedRef.current = true

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const userMsg: AnalysisMessage = {
      id: 'growth-analysis-user',
      content: `成长曲线智能分析：${payload.metric}（${payload.items.length}条）`,
      role: 'user',
      timestamp: Date.now()
    }
    const aiPlaceholderMsg: AnalysisMessage = {
      id: 'growth-analysis-assistant',
      content: '',
      role: 'assistant',
      timestamp: Date.now()
    }
    setMessages([userMsg, aiPlaceholderMsg])
    setIsStreaming(true)

    const appendToAssistant = (text: string) => {
      setMessages(prev => {
        if (prev.length === 0) return prev
        const next = [...prev]
        const last = next[next.length - 1]
        if (last.role === 'assistant') {
          next[next.length - 1] = {
            ...last,
            content: last.content + text
          }
        }
        return next
      })
    }

    const processBlock = (block: string) => {
      const lines = block.split('\n')
      let handled = false
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const jsonStr = line.slice(5).trim()
          if (!jsonStr) continue
          try {
            const data = JSON.parse(jsonStr)
            if (data.type === 'content' && data.content) {
              appendToAssistant(data.content)
            }
            handled = true
          } catch {
            // ignore parse errors and fall through
          }
        }
      }
      if (!handled) {
        appendToAssistant(block)
      }
    }

    const run = async () => {
      try {
        let buffer = ''
        await SendGrowthAnalysisStream(
          payload,
          chunk => {
            if (chunk.includes('data:')) {
              buffer += chunk
              const blocks = buffer.split('\n\n')
              buffer = blocks.pop() || ''
              blocks.forEach(processBlock)
            } else {
              appendToAssistant(chunk)
            }
          },
          abortController.signal
        )
        if (buffer) {
          processBlock(buffer)
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setErrorText('成长曲线分析失败，请稍后重试')
        }
      } finally {
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null
          setIsStreaming(false)
        }
      }
    }

    run()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [payload])

  useEffect(() => {
    return () => {
      Speech.stop()
    }
  }, [])

  const renderMessageSeparator = useCallback(() => {
    return <View style={styles.messageSeparator} />
  }, [])

  const keyExtractor = useCallback((item: AnalysisMessage) => item.id, [])

  const renderMessageItem = useCallback(
    ({ item, index }: { item: AnalysisMessage; index: number }) => {
      return (
        <ChatMessage
          message={item}
          isSpeaking={item.id === speakingMessageId}
          onSpeak={() => handleSpeak(item.id, item.content)}
          isTyping={isStreaming && index === messages.length - 1}
        />
      )
    },
    [handleSpeak, isStreaming, messages.length, speakingMessageId]
  )

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {messages.length === 0 ? (
        <View style={styles.placeholderContainer}>
          {isStreaming ? (
            <ActivityIndicator size="large" color="#1f99b0" />
          ) : (
            <Text style={styles.placeholderText}>
              {errorText || '正在准备智能分析...'}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlashList
            key={conversationKey}
            ref={listRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderMessageItem}
            ItemSeparatorComponent={renderMessageSeparator}
            renderScrollComponent={renderChatScrollComponent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onContentSizeChange={handleContentSizeChange}
            onLoad={handleListLoad}
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{
              autoscrollToBottomThreshold: 0.2,
              animateAutoScrollToBottom: false
            }}
            style={styles.flatList}
          />

          {messages.length > 0 && showScrollBottom && (
            <TouchableOpacity
              style={styles.scrollToBottomButton}
              onPress={() => scrollToBottom(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-down" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  contentContainer: {
    flex: 1,
    position: 'relative'
  },
  flatList: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16
  },
  messageSeparator: {
    height: MESSAGE_ITEM_SPACING
  },
  scrollToBottomButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
})
