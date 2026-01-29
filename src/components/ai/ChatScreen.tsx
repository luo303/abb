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
import { useSelector, useDispatch } from 'react-redux'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import ChatEmptyState from './ChatEmptyState'
import * as Speech from 'expo-speech'
import { RootState } from '../../store'
import { addMessage, createNewSession } from '../../store/modules/ChatStore'
import { Message } from '../../types/AIchat'

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
  const dispatch = useDispatch()
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

  // 监听会话ID变化，停止语音播放
  useEffect(() => {
    Speech.stop()
    updateSpeakingId(null)
  }, [currentConversationId])

  // 尝试获取头部高度，如果不可用则回退到安全默认值
  // 在抽屉导航中，useHeaderHeight 有时返回 0 或需要调整
  const headerHeight = useHeaderHeight() || 0

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 9)
  }

  const sendMessage = () => {
    if (!inputText.trim()) return

    Keyboard.dismiss()

    // 如果当前没有会话ID，说明是新会话，需要先创建会话
    if (!currentConversationId || messages.length === 0) {
      const newId = generateId()
      // @ts-ignore - Thunk action type issue
      dispatch(createNewSession(newId))
    }

    const userMsg: Message = {
      message_id: generateId(),
      content: inputText.trim(),
      isUser: true
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    dispatch(addMessage(userMsg))
    setInputText('')

    // 模拟 AI 回复
    setTimeout(() => {
      const aiMsg: Message = {
        title: '测试标题',
        message_id: generateId(),
        content:
          '我收到你的消息了。作为一个AI助手，我可以帮你解答育儿方面的问题，比如宝宝辅食、疫苗接种提醒等。',
        isUser: false,
        wonder: ['宝宝不睡觉怎么办', '如何给宝宝喂奶']
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      dispatch(addMessage(aiMsg))
    }, 1000)
  }

  // 当消息变化时，如果是AI回复，则平滑滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      // 只有当最新消息不是用户发送的（即AI回复），或者是用户刚发送时，才触发滚动
      // 初始化或切换会话时，由于 inverted 属性，自然就在底部，不需要额外滚动
      if (!lastMessage.isUser || messages.length === 1) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
        }, 100)
      }
    }
  }, [messages])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent
    // 在 inverted 模式下，offsetY 为 0 表示在底部（列表顶部）
    // 如果 offset > 200，说明向上滚动查看历史记录了
    setShowScrollBottom(contentOffset.y > 200)
  }

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <View style={styles.contentContainer}>
          {messages.length === 0 ? (
            <ChatEmptyState />
          ) : (
            <FlatList
              ref={flatListRef}
              data={[...messages].reverse()} // 反转数据源以适配 inverted
              keyExtractor={item => item.message_id}
              inverted={true} // 启用倒序模式，默认从底部开始
              renderItem={({ item, index }) => (
                <ChatMessage
                  message={item}
                  isSpeaking={item.message_id === speakingId}
                  onSpeak={() => handleSpeak(item.message_id, item.content)}
                  // inverted 后索引也反转了，所以判断最新消息逻辑要变
                  // 原数组：[msg1, msg2, msg3] (最新的是 msg3，index=2)
                  // 反转后：[msg3, msg2, msg1] (最新的是 msg3，index=0)
                  isLatest={index === 0}
                />
              )}
              contentContainerStyle={styles.listContent}
              ListHeaderComponent={<View style={{ height: 80 }} />} // 倒序后 Footer 变成了 Header
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
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end'
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
