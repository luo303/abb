import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import { useHeaderHeight } from '@react-navigation/elements'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { RootState } from '../../store'
import { setPartner, addMessage } from '../../store/modules/PartnerStore'

export default function PartnerChat() {
  const dispatch = useDispatch()
  const { partnerId, messages } = useSelector(
    (state: RootState) => state.partner
  )
  const headerHeight = useHeaderHeight()
  const insets = useSafeAreaInsets()
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0)

  // 绑定信息
  const [inputPartnerAccount, setInputPartnerAccount] = useState('')
  const [inputPartnerPassword, setInputPartnerPassword] = useState('')

  // 聊天输入
  const [inputText, setInputText] = useState('')
  const flatListRef = useRef<FlatList>(null)

  const scrollToBottom = useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated })
    })
  }, [])

  // 消息变化时滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false)
    }
  }, [messages, scrollToBottom])

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

  const handleAddPartner = () => {
    if (!inputPartnerAccount.trim() || !inputPartnerPassword.trim()) {
      Alert.alert('提示', '请完整填写账号和密码')
      return
    }
    // 模拟绑定另一半
    dispatch(
      setPartner({
        id: inputPartnerAccount,
        name: `伴侣 ${inputPartnerAccount}` // 名称占位
      })
    )
    Alert.alert('成功', '已成功添加另一半')
  }

  const handleSendMessage = () => {
    if (!inputText.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me' as const,
      timestamp: Date.now()
    }

    dispatch(addMessage(newMessage))
    setInputText('')

    // 模拟自动回复
    setTimeout(() => {
      const replyMessage = {
        id: (Date.now() + 1).toString(),
        text: `收到: ${inputText}`,
        sender: 'partner' as const,
        timestamp: Date.now()
      }
      dispatch(addMessage(replyMessage))
    }, 1000)
  }

  const renderNoPartner = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        style={styles.container}
      >
        <View style={styles.addPartnerContainer}>
          <View style={styles.addPartnerHeader}>
            <View style={styles.heroCircle}>
              <Ionicons name="heart" size={28} color="#fff" />
            </View>
            <Text style={styles.addPartnerTitle}>绑定另一半</Text>
            <Text style={styles.addPartnerSubtitle}>输入账号密码即可绑定</Text>
          </View>

          <View style={styles.addPartnerCard}>
            <Text style={styles.addPartnerHint}>账号</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color="#9AA0A6" />
              <TextInput
                style={styles.addPartnerInput}
                placeholder="请输入对方账号"
                value={inputPartnerAccount}
                onChangeText={setInputPartnerAccount}
                keyboardType="default"
                placeholderTextColor="#B0B0B0"
              />
            </View>

            <Text style={styles.addPartnerHint}>密码</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#9AA0A6" />
              <TextInput
                style={styles.addPartnerInput}
                placeholder="请输入对方密码"
                value={inputPartnerPassword}
                onChangeText={setInputPartnerPassword}
                secureTextEntry={true}
                placeholderTextColor="#B0B0B0"
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPartner}
            >
              <Text style={styles.addButtonText}>立即绑定</Text>
            </TouchableOpacity>
            <Text style={styles.addPartnerFootnote}>
              绑定后可随时在设置中解除
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )

  const renderMessageItem = ({ item }: { item: any }) => {
    const isMe = item.sender === 'me'
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft
        ]}
      >
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>TA</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.messageBubbleRight : styles.messageBubbleLeft
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.messageTextRight : styles.messageTextLeft
            ]}
          >
            {item.text}
          </Text>
        </View>
        {isMe && (
          <View style={[styles.avatar, styles.myAvatar]}>
            <Text style={[styles.avatarText, { color: '#fff' }]}>我</Text>
          </View>
        )}
      </View>
    )
  }

  const renderChat = () => (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          style={{ flex: 1 }}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          inverted={true}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              scrollToBottom(false)
            }
          }}
        />

        <View
          style={[
            styles.inputContainer,
            Platform.OS === 'ios' && { paddingBottom: insets.bottom }
          ]}
        >
          <TextInput
            style={styles.chatInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="发消息..."
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        styles.safeArea,
        Platform.OS === 'android' && {
          paddingBottom: androidKeyboardHeight + insets.bottom
        }
      ]}
    >
      {partnerId ? renderChat() : renderNoPartner()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  container: {
    flex: 1
  },
  // 绑定样式
  addPartnerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32
  },
  addPartnerHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  heroCircle: {
    marginBottom: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6
  },
  addPartnerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4
  },
  addPartnerSubtitle: {
    fontSize: 13,
    color: '#6B7280'
  },
  addPartnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F1F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4
  },
  addPartnerHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F6F7FB',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    marginBottom: 14
  },
  addPartnerInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: '#111827'
  },
  addButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#FF6B6B',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  addPartnerFootnote: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF'
  },

  // 聊天样式
  listContent: {
    padding: 15,
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start'
  },
  messageRowLeft: {
    justifyContent: 'flex-start'
  },
  messageRowRight: {
    justifyContent: 'flex-end'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  myAvatar: {
    backgroundColor: '#FF6B6B',
    marginRight: 0,
    marginLeft: 10
  },
  avatarText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 15,
    minHeight: 40
  },
  messageBubbleLeft: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4
  },
  messageBubbleRight: {
    backgroundColor: '#FF6B6B',
    borderTopRightRadius: 4
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  messageTextLeft: {
    color: '#333'
  },
  messageTextRight: {
    color: '#fff'
  },

  // 输入区域
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#FFCACA'
  }
})
