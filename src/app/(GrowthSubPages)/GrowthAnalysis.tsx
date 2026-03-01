import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator
} from 'react-native'
import type { FlatList as RNFlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import ChatMessage from '../../components/ai/ChatMessage'
import { Message } from '../../types/AIchat'
import { GrowthAnalysisPayload, SendGrowthAnalysisStream } from '../../api/ai'
import * as Speech from 'expo-speech'

type GrowthAnalysisRouteParams = {
  growthAnalysis?: GrowthAnalysisPayload
}

export default function GrowthAnalysis() {
  const route = useRoute<any>()
  const payload: GrowthAnalysisPayload | undefined = (
    route?.params as GrowthAnalysisRouteParams | undefined
  )?.growthAnalysis
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)
  const flatListRef = useRef<RNFlatList<any>>(null)
  const startedRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  const speakingIndexRef = useRef<number | null>(null)

  const updateSpeakingIndex = (index: number | null) => {
    speakingIndexRef.current = index
    setSpeakingIndex(index)
  }

  const handleSpeak = (index: number, text: string) => {
    if (speakingIndexRef.current === index) {
      Speech.stop()
      updateSpeakingIndex(null)
    } else {
      Speech.stop()
      updateSpeakingIndex(index)
      Speech.speak(text, {
        onDone: () => {
          if (speakingIndexRef.current === index) {
            updateSpeakingIndex(null)
          }
        },
        onStopped: () => {
          if (speakingIndexRef.current === index) {
            updateSpeakingIndex(null)
          }
        },
        onError: () => {
          if (speakingIndexRef.current === index) {
            updateSpeakingIndex(null)
          }
        }
      })
    }
  }

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

    const userMsg: Message = {
      content: `成长曲线智能分析：${payload.metric}（${payload.items.length}条）`,
      role: 'user',
      timestamp: Date.now()
    }
    const aiPlaceholderMsg: Message = {
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
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant' || messages.length === 1) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
        }, 100)
      }
    }
  }, [messages])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent
    setShowScrollBottom(contentOffset.y > 200)
  }

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  useEffect(() => {
    return () => {
      Speech.stop()
    }
  }, [])

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
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
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()}
            keyExtractor={(_, index) => index.toString()}
            inverted={true}
            renderItem={({ item, index }) => {
              const originalIndex = messages.length - 1 - index
              return (
                <ChatMessage
                  message={item}
                  isSpeaking={originalIndex === speakingIndex}
                  onSpeak={() => handleSpeak(originalIndex, item.content)}
                  isTyping={
                    isStreaming && originalIndex === messages.length - 1
                  }
                />
              )
            }}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={<View style={{ height: 40 }} />}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.flatList}
          />

          {messages.length > 0 && showScrollBottom && (
            <TouchableOpacity
              style={styles.scrollToBottomButton}
              onPress={scrollToBottom}
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
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  scrollToBottomButton: {
    position: 'absolute',
    alignSelf: 'center',
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
