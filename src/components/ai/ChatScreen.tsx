import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  InteractionManager,
  Keyboard,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import { Ionicons } from '@expo/vector-icons'
import { useSelector, useDispatch } from 'react-redux'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import ChatMessage from './ChatMessage'
import ChatInput, { ImageItem } from './ChatInput'
import ChatEmptyState from './ChatEmptyState'
import * as Speech from 'expo-speech'
import { RootState } from '../../store'
import {
  createNewSession,
  addMessage,
  loadInitialData,
  updateLastMessageContent,
  togglePrivateEnabled
} from '../../store/modules/ChatStore'
import { Message } from '../../types/AIchat'
import { SendMessageStream } from '@/api/ai'
import { uploadFile } from '../../api/upload'

// 在 Android 上启用布局动画
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export default function ChatScreen() {
  const messages = useSelector((state: RootState) => state.chat.messages)
  const currentConversationId = useSelector(
    (state: RootState) => state.chat.currentConversationId
  )
  const isLoading = useSelector((state: RootState) => state.chat.isLoading)
  const search_private = useSelector(
    (state: RootState) => state.chat.search_private
  )
  const dispatch = useDispatch()
  const [inputText, setInputText] = useState('')
  const flatListRef = useRef<FlatList>(null)
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [pendingImages, setPendingImages] = useState<ImageItem[]>([])
  const messagesRef = useRef(messages)
  const lastMessagesLengthRef = useRef(0)
  const scrollInteractionRef = useRef<{ cancel: () => void } | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const reversedMessages = useMemo(() => {
    const data = [...messages]
    data.reverse()
    return data
  }, [messages])

  const typingMessageKey = useMemo(() => {
    if (!isStreaming || messages.length === 0) return null
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') return null
    return `${last.timestamp}-${last.role}`
  }, [isStreaming, messages])

  // 处理图片添加和自动上传
  const handleAddImages = useCallback((uris: string[]) => {
    const newImages: ImageItem[] = uris.map(uri => ({
      uri,
      status: 'uploading'
    }))
    setPendingImages(prev => [...prev, ...newImages])

    // 对每个新图片进行上传
    newImages.forEach(async img => {
      try {
        const response = await uploadFile(img.uri)
        console.log('Upload response:', response)

        let url = ''
        if (typeof response.data === 'string') {
          url = response.data
        } else if (response.data && typeof response.data.url === 'string') {
          url = response.data.url
        } else {
          console.warn('Unknown upload response format:', response)
          url = typeof response.data === 'string' ? response.data : ''
        }

        if (url) {
          setPendingImages(prev =>
            prev.map(p =>
              p.uri === img.uri ? { ...p, status: 'done', url } : p
            )
          )
        } else {
          throw new Error('Invalid upload response')
        }
      } catch (error) {
        console.warn('Image upload failed:', error)
        setPendingImages(prev =>
          prev.map(p => (p.uri === img.uri ? { ...p, status: 'error' } : p))
        )
      }
    })
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  // 加载初始数据
  useEffect(() => {
    // @ts-ignore
    dispatch(loadInitialData())
  }, [dispatch])

  // 语音播放状态管理
  const [speakingTimestamp, setSpeakingTimestamp] = useState<number | null>(
    null
  )
  const speakingTimestampRef = useRef<number | null>(null)

  const updateSpeakingTimestamp = useCallback((timestamp: number | null) => {
    speakingTimestampRef.current = timestamp
    setSpeakingTimestamp(timestamp)
  }, [])

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

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      Speech.stop()
    }
  }, [])

  // 监听会话ID变化，停止语音播放，并中断可能的进行中的请求
  useEffect(() => {
    Speech.stop()
    updateSpeakingTimestamp(null)
  }, [currentConversationId])

  // 尝试获取头部高度，如果不可用则回退到安全默认值
  // 在抽屉导航中，useHeaderHeight 有时返回 0 或需要调整
  const headerHeight = useHeaderHeight() || 0

  const handleTogglePrivateKb = useCallback(() => {
    // @ts-ignore
    dispatch(togglePrivateEnabled())
  }, [dispatch])

  const sendMessage = useCallback(async () => {
    // 检查是否有正在上传的图片
    if (pendingImages.some(img => img.status === 'uploading')) {
      alert('图片正在上传中，请稍候')
      return
    }

    const contentToSend = inputText.trim()
    const imagesToSend = pendingImages
      .filter(img => img.status === 'done' && img.url)
      .map(img => img.url!)

    if (!contentToSend) return

    // 如果有正在进行的请求，先中断它
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    // 创建新的控制器
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // 如果当前没有会话ID，说明是新会话，需要先创建会话
    let sessionId = currentConversationId
    if (!sessionId) {
      sessionId = uuidv4()
      // @ts-ignore - Thunk action type issue
      await dispatch(createNewSession(sessionId))
      // 必须等待一下以确保 Redux 状态更新，或者直接使用我们刚生成的 sessionId
      // createNewSession 是异步的，它会更新 currentConversationId
    }

    // 如果是新会话，sessionId 已经更新，但 Redux 中的 currentConversationId 可能还没更新完（异步）
    // 不过我们这里直接用局部变量 sessionId 发请求，所以没问题
    // 关键是 createNewSession 会清空 messages，所以我们要确保 addMessage 在 createNewSession 之后执行
    // 并且要等待 dispatch 完成（如果是异步 action）

    const userMsg: Message = {
      content: contentToSend,
      role: 'user',
      timestamp: Date.now(),
      images: imagesToSend
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    // @ts-ignore
    dispatch(addMessage(userMsg))
    setInputText('')
    setPendingImages([])

    // 添加一个空的 AI 消息占位
    const aiPlaceholderMsg: Message = {
      content: '',
      role: 'assistant',
      timestamp: Date.now()
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    // @ts-ignore
    dispatch(addMessage(aiPlaceholderMsg))
    setIsStreaming(true)

    try {
      let buffer = ''
      let contentBuffer = ''
      let lastDispatchTime = 0
      const DISPATCH_INTERVAL = Platform.OS === 'android' ? 50 : 50
      const MIN_CHARS = Platform.OS === 'android' ? 80 : 50
      let flushScheduled = false

      const flushContentBuffer = () => {
        if (contentBuffer) {
          dispatch(updateLastMessageContent(contentBuffer))
          contentBuffer = ''
          lastDispatchTime = Date.now()
        }
      }

      const scheduleFlush = () => {
        if (flushScheduled) return
        flushScheduled = true
        requestAnimationFrame(() => {
          flushScheduled = false
          flushContentBuffer()
        })
      }

      const processLine = (line: string) => {
        if (line.startsWith('data:')) {
          const jsonStr = line.slice(5).trim()
          if (!jsonStr) return
          try {
            const data = JSON.parse(jsonStr)
            if (data.type === 'content' && data.content) {
              contentBuffer += data.content
              const now = Date.now()
              if (
                contentBuffer.length >= MIN_CHARS ||
                now - lastDispatchTime >= DISPATCH_INTERVAL
              ) {
                scheduleFlush()
              }
            } else if (data.type === 'done') {
              flushContentBuffer()
              console.log('Chat session done:', data.session_id)
            }
          } catch (e) {
            console.error('SSE parse error:', e)
          }
        }
      }

      await SendMessageStream(
        {
          session_id: sessionId,
          message: contentToSend,
          images: imagesToSend,
          kb_config: {
            enable: search_private,
            search_private,
            search_public: false
          }
        },
        chunk => {
          buffer += chunk
          // SSE 消息以双换行符分隔
          const blocks = buffer.split('\n\n')
          // 保留最后一个可能不完整的块
          buffer = blocks.pop() || ''

          for (const block of blocks) {
            const lines = block.split('\n')
            lines.forEach(processLine)
          }
        },
        abortController.signal
      )

      // 处理剩余的 buffer
      if (buffer) {
        const lines = buffer.split('\n')
        lines.forEach(processLine)
      }
      // 确保所有内容都被更新
      flushContentBuffer()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
        return
      }
      console.error('消息发送失败:', error)
      alert('消息发送失败，请稍后重试')
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
        setIsStreaming(false)
      }
    }
    // 模拟 AI 回复
    // setTimeout(() => {
    //   const aiMsg: Message = {
    //     content:
    //       '作为一个**AI助手**，我可以帮你解答育儿方面的问题，比如：\n\n- 宝宝辅食\n- 疫苗接种提醒\n- 生长发育评估\n\n> 随时欢迎向我提问哦！',
    //     role: 'assistant',
    //     timestamp: Date.now()
    //   }
    //   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    //   // @ts-ignore
    //   dispatch(addMessage(aiMsg))
    // }, 1000)
    // 像后端发送消息
  }, [
    currentConversationId,
    dispatch,
    inputText,
    pendingImages,
    search_private
  ])

  // 当新增消息时，如果用户在底部，则平滑滚动到底部（避免流式更新时反复触发滚动）
  useEffect(() => {
    const currLen = messages.length
    const prevLen = lastMessagesLengthRef.current
    lastMessagesLengthRef.current = currLen

    if (currLen === 0 || currLen === prevLen) return
    if (showScrollBottom) return

    const currentMessages = messagesRef.current
    const lastMessage = currentMessages[currentMessages.length - 1]
    if (!lastMessage) return

    if (lastMessage.role !== 'assistant' && currLen !== 1) return

    scrollInteractionRef.current?.cancel()
    scrollInteractionRef.current = InteractionManager.runAfterInteractions(
      () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
      }
    )
  }, [messages.length, showScrollBottom])

  useEffect(() => {
    return () => {
      scrollInteractionRef.current?.cancel()
    }
  }, [])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent
    // 在 inverted 模式下，offsetY 为 0 表示在底部（列表顶部）
    // 如果 offset > 200，说明向上滚动查看历史记录了
    setShowScrollBottom(contentOffset.y > 200)
  }

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  const renderMessageItem = useCallback(
    ({ item }: { item: Message }) => {
      const isTyping = typingMessageKey === `${item.timestamp}-${item.role}`
      return (
        <ChatMessage
          message={item}
          isSpeaking={item.timestamp === speakingTimestamp}
          onSpeak={handleSpeak}
          isTyping={isTyping}
        />
      )
    },
    [handleSpeak, speakingTimestamp, typingMessageKey]
  )

  // 由于全面屏模式问题，手动处理 Android 键盘
  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSubscription = Keyboard.addListener('keyboardDidShow', e => {
        setAndroidKeyboardHeight(e.endCoordinates.height)
      })
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setAndroidKeyboardHeight(0)
      })
      return () => {
        showSubscription.remove()
        hideSubscription.remove()
      }
    }
  }, [])

  return (
    <SafeAreaView
      style={[
        styles.container,
        Platform.OS === 'android' && { paddingBottom: androidKeyboardHeight }
      ]}
      edges={['left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.layout}>
          <View style={styles.messagesContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1f99b0" />
              </View>
            ) : messages.length === 0 ? (
              <ChatEmptyState />
            ) : (
              <FlatList
                ref={flatListRef}
                data={reversedMessages}
                keyExtractor={item => `${item.timestamp}-${item.role}`}
                inverted={true}
                renderItem={renderMessageItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                removeClippedSubviews={Platform.OS === 'android'}
                initialNumToRender={12}
                maxToRenderPerBatch={8}
                updateCellsBatchingPeriod={50}
                windowSize={7}
                style={styles.flatList}
              />
            )}

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

          <View style={styles.inputBar}>
            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={sendMessage}
              disabled={
                isLoading ||
                pendingImages.some(img => img.status === 'uploading')
              }
              images={pendingImages}
              onAddImages={handleAddImages}
              onRemoveImage={handleRemoveImage}
              privateKbEnabled={search_private}
              onTogglePrivateKb={handleTogglePrivateKb}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA' // 略微灰白色的背景
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  keyboardView: {
    flex: 1
  },
  layout: {
    flex: 1
  },
  messagesContainer: {
    flex: 1,
    position: 'relative'
  },
  flatList: {
    flex: 1
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 12
  },
  inputBar: {
    flexShrink: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E6EB',
    borderBottomWidth: 0,
    overflow: 'hidden'
  },
  scrollToBottomButton: {
    position: 'absolute',
    alignSelf: 'center', // 水平居中
    bottom: 16,
    width: 44, // 稍微大一点
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
