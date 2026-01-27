import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Keyboard,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useHeaderHeight } from '@react-navigation/elements'
import { Ionicons } from '@expo/vector-icons'
import ChatMessage, { Message } from './ChatMessage'
import ChatInput from './ChatInput'
import ChatEmptyState from './ChatEmptyState'
import * as Speech from 'expo-speech'
// 在 Android 上启用布局动画
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const INITIAL_MESSAGES: Message[] = []

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputText, setInputText] = useState('')
  const flatListRef = useRef<FlatList>(null)
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0)
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  // 语音播放状态管理
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const speakingIdRef = useRef<string | null>(null)

  const updateSpeakingId = (id: string | null) => {
    speakingIdRef.current = id
    setSpeakingId(id)
  }

  const handleSpeak = (id: string, text: string) => {
    if (speakingIdRef.current === id) {
      // 如果点击的是当前正在播放的，则停止
      Speech.stop()
      updateSpeakingId(null)
    } else {
      // 停止之前的播放（如果有）
      Speech.stop()
      // 立即更新为新的播放ID
      updateSpeakingId(id)

      Speech.speak(text, {
        onDone: () => {
          // 只有当当前播放ID仍然是这个ID时才清除（防止被新的播放打断后错误清除）
          if (speakingIdRef.current === id) {
            updateSpeakingId(null)
          }
        },
        onStopped: () => {
          if (speakingIdRef.current === id) {
            updateSpeakingId(null)
          }
        },
        onError: () => {
          if (speakingIdRef.current === id) {
            updateSpeakingId(null)
          }
        }
      })
    }
  }

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      Speech.stop()
    }
  }, [])

  // 尝试获取头部高度，如果不可用则回退到安全默认值
  // 在抽屉导航中，useHeaderHeight 有时返回 0 或需要调整
  const headerHeight = useHeaderHeight() || 0

  const sendMessage = () => {
    if (!inputText.trim()) return

    Keyboard.dismiss()

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: Date.now()
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setMessages(prev => [...prev, userMsg])
    setInputText('')

    // 模拟 AI 回复
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: '我收到你的消息了。作为一个AI助手，我可以帮你解答育儿方面的问题，比如宝宝辅食、疫苗接种提醒等。',
        isUser: false,
        timestamp: Date.now()
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setMessages(prev => [...prev, aiMsg])
    }, 1000)
  }

  // 当消息变化时滚动到底部
  useEffect(() => {
    // 小延迟确保在滚动前布局已完成
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)

    // AI 回复或渲染缓慢的双重保险
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 300)
  }, [messages])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    // 检查是否远离底部
    // 如果距离底部超过 200，显示按钮
    const distanceToBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y
    setShowScrollBottom(distanceToBottom > 200)
  }

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true })
  }

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
      >
        <View style={styles.contentContainer}>
          {messages.length === 0 ? (
            <ChatEmptyState />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <ChatMessage
                  message={item}
                  isSpeaking={item.id === speakingId}
                  onSpeak={() => handleSpeak(item.id, item.text)}
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListFooterComponent={<View style={{ height: 100 }} />}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
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

          <View style={styles.inputContainer}>
            <ChatInput
              value={inputText}
              onChangeText={setInputText}
              onSend={sendMessage}
              disabled={!inputText.trim()}
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
  keyboardView: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    position: 'relative'
  },
  flatList: {
    flex: 1
  },
  listContent: {
    padding: 16
    // paddingBottom 移至 ListFooterComponent 以确保正确滚动
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  scrollToBottomButton: {
    position: 'absolute',
    alignSelf: 'center', // 水平居中
    bottom: 100, // 在输入区域上方
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
