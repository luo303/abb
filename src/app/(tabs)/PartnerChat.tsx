import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Alert,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
import { useDispatch, useSelector } from 'react-redux'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import { useHeaderHeight } from '@react-navigation/elements'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { v4 as uuidv4 } from 'uuid'

import AppKeyboardAvoidingView from '../../components/common/AppKeyboardAvoidingView'
import KeyboardStickyFooter from '../../components/common/KeyboardStickyFooter'
import TextSendComposer from '../../components/common/TextSendComposer'
import useChatAutoScroll from '../../components/common/useChatAutoScroll'
import {
  useChatComposerMetrics,
  useKeyboardChatScrollRenderer
} from '../../components/common/useKeyboardChatList'
import {
  composerFooterShadow,
  composerTheme
} from '../../components/common/composerTheme'
import { RootState } from '../../store'
import {
  addMessage,
  setConnectionStatus,
  setPartner
} from '../../store/modules/PartnerStore'
import {
  PARTNER_WS_BASE_URL,
  bindPartner,
  closePartnerSocket,
  connectPartnerSocket,
  fetchPartner,
  sendPartnerSocket
} from '@/api/ws'

const PARTNER_BASE_INPUT_HEIGHT = Platform.OS === 'ios' ? 88 : 74
const LIST_BOTTOM_GAP = 12

type PartnerMessage = {
  id: string
  text: string
  sender: 'me' | 'partner'
  timestamp: number
}

type PartnerMessageItemProps = {
  item: PartnerMessage
  partnerAvatar: string | null
  myAvatar: string | null | undefined
}

const PartnerMessageItem = memo(function PartnerMessageItem({
  item,
  partnerAvatar,
  myAvatar
}: PartnerMessageItemProps) {
  const isMe = item.sender === 'me'
  const partnerAvatarSource = partnerAvatar ? { uri: partnerAvatar } : null
  const myAvatarSource = myAvatar ? { uri: myAvatar } : null

  return (
    <View
      style={[
        styles.messageRow,
        isMe ? styles.messageRowRight : styles.messageRowLeft
      ]}
    >
      {!isMe &&
        (partnerAvatarSource ? (
          <Image source={partnerAvatarSource} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>TA</Text>
          </View>
        ))}

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

      {isMe &&
        (myAvatarSource ? (
          <Image source={myAvatarSource} style={styles.myAvatarImage} />
        ) : (
          <View style={[styles.avatar, styles.myAvatar]}>
            <Text style={[styles.avatarText, styles.myAvatarText]}>我</Text>
          </View>
        ))}
    </View>
  )
})

export default function PartnerChat() {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { partnerId, partnerName, partnerAvatar, messages } = useSelector(
    (state: RootState) => state.partner
  )
  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const token = useSelector((state: RootState) => state.user.token)
  const headerHeight = useHeaderHeight()
  const insets = useSafeAreaInsets()
  const hasFetchedPartnerRef = useRef(false)
  const clientIdRef = useRef(
    `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
  )

  const [inputPartnerAccount, setInputPartnerAccount] = useState('')
  const [inputPartnerPassword, setInputPartnerPassword] = useState('')
  const [isBinding, setIsBinding] = useState(false)
  const [isPartnerLoading, setIsPartnerLoading] = useState(!partnerId)
  const [inputText, setInputText] = useState('')

  const {
    baseHeight: baseInputBarHeight,
    extraContentPadding,
    handleComposerLayout
  } = useChatComposerMetrics({
    initialHeight: PARTNER_BASE_INPUT_HEIGHT
  })

  const { scrollRef, handleScroll, handleContentSizeChange, handleListLoad } =
    useChatAutoScroll({
      conversationKey: partnerId
    })
  const listRef =
    scrollRef as React.MutableRefObject<FlashListRef<PartnerMessage> | null>

  const renderChatScrollComponent = useKeyboardChatScrollRenderer({
    extraContentPadding,
    keyboardLiftBehavior: 'whenAtEnd'
  })

  const maintainVisibleContentPosition = useMemo(
    () => ({
      autoscrollToBottomThreshold: 0.2,
      animateAutoScrollToBottom: false,
      startRenderingFromBottom: true
    }),
    []
  )

  const listContentStyle = useMemo(
    () => ({
      paddingHorizontal: 15,
      paddingTop: 12,
      paddingBottom: baseInputBarHeight + LIST_BOTTOM_GAP
    }),
    [baseInputBarHeight]
  )

  const listExtraData = useMemo(
    () => ({
      partnerAvatar,
      myAvatar: userInfo?.avatar ?? null
    }),
    [partnerAvatar, userInfo?.avatar]
  )

  useEffect(() => {
    let isActive = true

    const loadPartner = async () => {
      if (hasFetchedPartnerRef.current) return
      hasFetchedPartnerRef.current = true
      if (partnerId) return

      try {
        setIsPartnerLoading(true)
        const res = await fetchPartner()
        if (!isActive) return

        const serverPartnerId = res?.data?.partner_id
        const serverPartnerUsername = res?.data?.partner_username
        const serverPartnerAvatar = res?.data?.partner_avatar

        if (res?.code === 0 && serverPartnerId) {
          dispatch(
            setPartner({
              id: serverPartnerId,
              name: serverPartnerUsername || '另一半',
              avatar: serverPartnerAvatar || null
            })
          )
        }
      } catch {
        if (!isActive) return
      } finally {
        if (isActive) {
          setIsPartnerLoading(false)
        }
      }
    }

    loadPartner()

    return () => {
      isActive = false
    }
  }, [dispatch, partnerId])

  const handleIncomingMessage = useCallback(
    (rawText: string) => {
      let payload: any = null
      try {
        payload = JSON.parse(rawText)
      } catch {
        payload = null
      }

      const typeValue = payload?.type ?? null
      if (
        rawText === 'pong' ||
        rawText === 'ping' ||
        typeValue === 'pong' ||
        typeValue === 'ping' ||
        typeValue === 'heartbeat'
      ) {
        return
      }

      if (typeValue !== 'chat') {
        return
      }

      const textValue = payload?.text
      if (!textValue || typeof textValue !== 'string') return

      const incomingClientId = payload?.clientId ?? null
      if (incomingClientId && incomingClientId === clientIdRef.current) {
        return
      }

      dispatch(
        addMessage({
          id: uuidv4(),
          text: textValue,
          sender: 'partner',
          timestamp: Date.now()
        })
      )
    },
    [dispatch]
  )

  const closeSocket = useCallback(() => {
    closePartnerSocket()
    dispatch(setConnectionStatus(false))
  }, [dispatch])

  const connectSocket = useCallback(() => {
    if (!partnerId || !token) {
      console.warn('[PartnerChat] 跳过 connectSocket，缺少必要参数', {
        hasPartnerId: !!partnerId,
        hasToken: !!token
      })
      return
    }

    const wsUrl = `${PARTNER_WS_BASE_URL}?token=${encodeURIComponent(
      token
    )}&user_id=${encodeURIComponent(partnerId)}`

    connectPartnerSocket(wsUrl, {
      onOpen: () => {
        dispatch(setConnectionStatus(true))
      },
      onClose: () => {
        dispatch(setConnectionStatus(false))
      },
      onError: () => {
        dispatch(setConnectionStatus(false))
      },
      onMessage: handleIncomingMessage
    })
  }, [dispatch, handleIncomingMessage, partnerId, token])

  useEffect(() => {
    if (partnerId) {
      connectSocket()
      return
    }

    closeSocket()
  }, [closeSocket, connectSocket, partnerId])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: partnerName || '另一半'
    })
  }, [navigation, partnerName])

  const handleAddPartner = async () => {
    if (!inputPartnerAccount.trim() || !inputPartnerPassword.trim()) {
      Alert.alert('提示', '请完整填写账号和密码')
      return
    }

    try {
      setIsBinding(true)
      const res = await bindPartner({
        account: inputPartnerAccount.trim(),
        password: inputPartnerPassword
      })

      const serverPartnerId = res?.data?.partner_id
      const serverPartnerUsername = res?.data?.partner_username
      const serverPartnerAvatar = res?.data?.partner_avatar

      if (res?.code === 0 && serverPartnerId) {
        dispatch(
          setPartner({
            id: serverPartnerId,
            name: serverPartnerUsername || '另一半',
            avatar: serverPartnerAvatar || null
          })
        )
        setInputPartnerAccount('')
        setInputPartnerPassword('')
        Alert.alert('成功', '已成功绑定另一半')
        return
      }

      Alert.alert('提示', res?.message || '绑定失败')
    } catch (error: any) {
      Alert.alert('提示', error?.message || '绑定失败，请稍后重试')
    } finally {
      setIsBinding(false)
    }
  }

  const handleSendMessage = useCallback(() => {
    const content = inputText.trim()
    if (!content) return

    const newMessage: PartnerMessage = {
      id: uuidv4(),
      text: content,
      sender: 'me',
      timestamp: Date.now()
    }

    dispatch(addMessage(newMessage))
    setInputText('')

    const payload = {
      type: 'chat',
      text: content,
      clientId: clientIdRef.current,
      partnerId,
      timestamp: Date.now()
    }
    const ok = sendPartnerSocket(payload)

    if (!ok) {
      console.warn('[PartnerChat] 发送失败，准备重连', {
        partnerId,
        hasToken: !!token
      })
      connectSocket()
      Alert.alert('提示', '连接已断开，正在尝试重新连接')
    }
  }, [connectSocket, dispatch, inputText, partnerId, token])

  const renderMessageItem = useCallback(
    ({ item }: { item: PartnerMessage }) => {
      return (
        <PartnerMessageItem
          item={item}
          partnerAvatar={partnerAvatar}
          myAvatar={userInfo?.avatar}
        />
      )
    },
    [partnerAvatar, userInfo?.avatar]
  )

  const getItemType = useCallback((item: PartnerMessage) => {
    return item.sender === 'me' ? 'outgoing' : 'incoming'
  }, [])

  const renderNoPartner = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <AppKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
        style={styles.container}
      >
        <View style={styles.bindBackground}>
          <View style={styles.bindBlobTop} />
          <View style={styles.bindBlobBottom} />
        </View>

        <View style={styles.addPartnerContainer}>
          <View style={styles.addPartnerHeader}>
            <View style={styles.heroCircle}>
              <AntDesign name="message" size={28} color="#fff" />
            </View>
            <Text style={styles.addPartnerTitle}>绑定另一半</Text>
            <Text style={styles.addPartnerSubtitle}>
              共享宝宝数据，实现实时聊天
            </Text>
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
                secureTextEntry
                placeholderTextColor="#B0B0B0"
              />
            </View>

            <TouchableOpacity
              style={[styles.addButton, isBinding && styles.addButtonDisabled]}
              onPress={handleAddPartner}
              disabled={isBinding}
            >
              <Text style={styles.addButtonText}>
                {isBinding ? '绑定中...' : '立即绑定'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppKeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )

  const renderChat = () => (
    <View style={styles.container}>
      <FlashList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        getItemType={getItemType}
        renderItem={renderMessageItem}
        renderScrollComponent={renderChatScrollComponent}
        contentContainerStyle={listContentStyle}
        maintainVisibleContentPosition={maintainVisibleContentPosition}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLoad={handleListLoad}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        drawDistance={320}
        extraData={listExtraData}
        style={styles.chatScroll}
      />

      <KeyboardStickyFooter style={styles.chatInputSticky}>
        <View
          onLayout={handleComposerLayout}
          style={[
            styles.inputContainer,
            Platform.OS === 'ios' && {
              paddingBottom: Math.max(insets.bottom, 10)
            }
          ]}
        >
          <TextSendComposer
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSendMessage}
            placeholder="发消息..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </KeyboardStickyFooter>
    </View>
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      {partnerId ? (
        renderChat()
      ) : isPartnerLoading ? (
        <View style={styles.container} />
      ) : (
        renderNoPartner()
      )}
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
  bindBackground: {
    ...StyleSheet.absoluteFillObject
  },
  bindBlobTop: {
    position: 'absolute',
    top: -90,
    right: -40,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#FFE6EB'
  },
  bindBlobBottom: {
    position: 'absolute',
    bottom: -120,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FCEFF1'
  },
  addPartnerContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 16
  },
  addPartnerHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  heroCircle: {
    marginBottom: 14,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 7
  },
  addPartnerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937'
  },
  addPartnerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6
  },
  addPartnerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 5
  },
  addPartnerHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: '#F7F8FC',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E9ECF3',
    marginBottom: 16
  },
  addPartnerInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: '#111827'
  },
  addButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 6
  },
  addButtonDisabled: {
    backgroundColor: '#FFCACA'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  chatScroll: {
    flex: 1
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
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E0E0E0'
  },
  myAvatar: {
    backgroundColor: '#FF6B6B',
    marginRight: 0,
    marginLeft: 10
  },
  myAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 0,
    marginLeft: 10,
    backgroundColor: '#FF6B6B'
  },
  myAvatarText: {
    color: '#fff'
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
  chatInputSticky: {
    zIndex: 20
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: composerTheme.footerBackground,
    borderTopWidth: 1,
    borderTopColor: composerTheme.footerBorder,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    ...composerFooterShadow
  }
})
