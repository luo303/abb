import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import ImageViewing from 'react-native-image-viewing'
import { v4 as uuidv4 } from 'uuid'
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated'

import { uploadFile } from '@/api/upload'
import ChatDetailInput from '@/components/chat/ChatDetailInput'
import ChatMessageBubble from '@/components/chat/ChatMessageBubble'
import useChatAutoScroll from '@/components/common/useChatAutoScroll'
import { useMessage } from '@/components/Message'
import {
  Animated,
  useKeyboardTranslateStyle
} from '@/components/common/useKeyboardTranslateStyle'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { NavigationProps, RootStackParamList } from '@/types/navigation'
import {
  ChatGroupMember,
  clearPartnerUnreadCount,
  markGroupConversationSeen,
  MessengerMessage,
  refreshGroupMembers,
  refreshGroupMessages,
  sendGroupConversationMessage,
  sendPartnerConversationMessage,
  setActiveConversation
} from '@/store/modules/MessengerStore'

const MESSAGE_GAP = 12
const LIST_BOTTOM_GAP = 18
const CHAT_DETAIL_INPUT_NATIVE_ID = 'chat-detail-input'
const EMPTY_GROUP_MESSAGES: MessengerMessage[] = []
const EMPTY_GROUP_MEMBERS: ChatGroupMember[] = []

type ChatDetailRoute = RouteProp<RootStackParamList, 'ChatDetail'>

const resolveUploadUrl = (response: any) => {
  if (typeof response?.data === 'string') {
    return response.data
  }

  if (response?.data && typeof response.data.url === 'string') {
    return response.data.url
  }

  return ''
}

export default function ChatDetail() {
  const insets = useSafeAreaInsets()
  const route = useRoute<ChatDetailRoute>()
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { showMessage } = useMessage()
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

  const { conversationType, groupId } = route.params
  const currentUserId = useAppSelector(state => state.user.userInfo?.user_id)
  const currentUserAvatar = useAppSelector(state => state.user.userInfo?.avatar)
  const currentUserName = useAppSelector(
    state =>
      state.user.userInfo?.username || state.user.userInfo?.account || '我'
  )
  const partner = useAppSelector(state => state.messenger.partner)
  const group = useAppSelector(state =>
    state.messenger.groups.items.find(item => item.groupId === groupId)
  )
  const groupMembers = useAppSelector(state =>
    groupId
      ? state.messenger.groups.membersByGroupId[groupId] || EMPTY_GROUP_MEMBERS
      : EMPTY_GROUP_MEMBERS
  )
  const groupMessages = useAppSelector(state =>
    groupId
      ? state.messenger.groups.messagesByGroupId[groupId] ||
        EMPTY_GROUP_MESSAGES
      : EMPTY_GROUP_MESSAGES
  )

  const messages = useMemo(() => {
    return conversationType === 'partner' ? partner.messages : groupMessages
  }, [conversationType, groupMessages, partner.messages])

  const [pendingMessages, setPendingMessages] = useState<MessengerMessage[]>([])
  const displayMessages = useMemo(() => {
    const messageMap = new Map<string, MessengerMessage>()

    pendingMessages.forEach(item => {
      messageMap.set(item.messageId, item)
    })

    messages.forEach(item => {
      messageMap.set(item.messageId, item)
    })

    return [...messageMap.values()].sort((a, b) => {
      if (a.ctime === b.ctime) {
        return a.messageId.localeCompare(b.messageId)
      }
      return a.ctime - b.ctime
    })
  }, [messages, pendingMessages])
  const listMessages = useMemo(() => {
    return [...displayMessages].reverse()
  }, [displayMessages])

  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewUri, setPreviewUri] = useState('')
  const skipAutoScrollRef = useRef(false)
  const currentScrollOffsetRef = useRef(0)
  const previewLockedOffsetRef = useRef<number | null>(null)
  const previewRestoreTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const pendingInitialScrollRef = useRef(true)

  const {
    scrollRef,
    handleScroll,
    handleContentSizeChange,
    handleListLoad,
    syncScrollState,
    stopCurrentScroll
  } = useChatAutoScroll({
    conversationKey:
      conversationType === 'partner' ? partner.partnerId : groupId || null,
    showButtonThreshold: 140,
    inverted: true
  })
  const listRef =
    scrollRef as React.MutableRefObject<FlashListRef<MessengerMessage> | null>

  const title = useMemo(() => {
    if (conversationType === 'partner') {
      return partner.name || '另一半'
    }

    return group?.name || '群聊'
  }, [conversationType, group?.name, partner.name])

  const listContentStyle = useMemo(
    () => ({
      flexGrow: 1,
      justifyContent: 'flex-end' as const,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: LIST_BOTTOM_GAP
    }),
    []
  )
  const initialScrollIndex = listMessages.length > 0 ? 0 : undefined

  const memberMap = useMemo(() => {
    return Object.fromEntries(
      groupMembers.map(item => [item.userId, item])
    ) as Record<string, (typeof groupMembers)[number]>
  }, [groupMembers])

  const clearPreviewRestoreTimers = useCallback(() => {
    previewRestoreTimersRef.current.forEach(timer => clearTimeout(timer))
    previewRestoreTimersRef.current = []
  }, [])

  const unlockListScroll = useCallback(() => {
    setIsListScrollEnabled(true)
  }, [])

  const alignInitialScrollPosition = useCallback(() => {
    if (!pendingInitialScrollRef.current || listMessages.length === 0) return

    pendingInitialScrollRef.current = false
    const latestIndex = 0

    const scrollToLatest = () => {
      const currentList = listRef.current
      if (!currentList) return

      currentList
        .scrollToIndex({
          index: latestIndex,
          animated: false
        })
        .catch(() => {
          currentList.scrollToOffset({
            offset: 0,
            animated: false
          })
        })
    }

    scrollToLatest()
    requestAnimationFrame(scrollToLatest)
  }, [listMessages.length, listRef])

  const restorePreviewScrollOffset = useCallback(() => {
    const lockedOffset = previewLockedOffsetRef.current
    if (lockedOffset === null) return
    ;(scrollRef.current as any)?.scrollToOffset?.({
      animated: false,
      offset: lockedOffset
    })

    requestAnimationFrame(() => {
      ;(scrollRef.current as any)?.scrollToOffset?.({
        animated: false,
        offset: lockedOffset
      })
    })
  }, [scrollRef])

  const handleListContentSizeChange = useCallback(() => {
    if (skipAutoScrollRef.current || previewVisible) {
      return
    }
    handleContentSizeChange()
  }, [handleContentSizeChange, previewVisible])

  const handleListScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      currentScrollOffsetRef.current = event.nativeEvent.contentOffset.y
      handleScroll(event)
    },
    [handleScroll]
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

  const handleListReady = useCallback(() => {
    if (skipAutoScrollRef.current || previewVisible) return
    handleListLoad()
    alignInitialScrollPosition()
  }, [alignInitialScrollPosition, handleListLoad, previewVisible])

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#fff'
      },
      headerTintColor: '#111',
      headerRight:
        conversationType === 'group' && groupId
          ? () => (
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => {
                  navigation.navigate('GroupInfo', { groupId })
                }}
                style={styles.headerAction}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#111" />
              </TouchableOpacity>
            )
          : undefined
    })
  }, [conversationType, groupId, navigation, title])

  useEffect(() => {
    setPendingMessages([])
    pendingInitialScrollRef.current = true
    dispatch(
      setActiveConversation({
        type: conversationType,
        id: conversationType === 'partner' ? partner.partnerId : groupId || null
      })
    )

    if (conversationType === 'partner') {
      dispatch(clearPartnerUnreadCount())
    }

    if (conversationType === 'group' && groupId) {
      dispatch(refreshGroupMessages(groupId))
      dispatch(refreshGroupMembers(groupId))
      dispatch(markGroupConversationSeen(groupId))
    }

    return () => {
      dispatch(
        setActiveConversation({
          type: null,
          id: null
        })
      )
    }
  }, [conversationType, dispatch, groupId, partner.partnerId])

  useEffect(() => {
    setPendingMessages(prev => {
      const next = prev.filter(
        pending => !messages.some(item => item.messageId === pending.messageId)
      )

      return next.length === prev.length ? prev : next
    })
  }, [messages])

  useEffect(() => {
    if (listMessages.length === 0) {
      pendingInitialScrollRef.current = true
      return
    }

    alignInitialScrollPosition()
  }, [alignInitialScrollPosition, listMessages.length])

  const openImagePreview = useCallback(
    (uri: string) => {
      clearPreviewRestoreTimers()
      previewLockedOffsetRef.current = currentScrollOffsetRef.current
      skipAutoScrollRef.current = true
      setPreviewUri(uri)
      setPreviewVisible(true)

      const timer = setTimeout(() => {
        restorePreviewScrollOffset()
      }, 40)
      previewRestoreTimersRef.current.push(timer)
    },
    [clearPreviewRestoreTimers, restorePreviewScrollOffset]
  )

  const closeImagePreview = useCallback(() => {
    clearPreviewRestoreTimers()
    setPreviewVisible(false)
    restorePreviewScrollOffset()
    ;[80, 180].forEach(delay => {
      const timer = setTimeout(() => {
        restorePreviewScrollOffset()
      }, delay)
      previewRestoreTimersRef.current.push(timer)
    })

    const releaseTimer = setTimeout(() => {
      skipAutoScrollRef.current = false
      previewLockedOffsetRef.current = null
    }, 220)
    previewRestoreTimersRef.current.push(releaseTimer)
  }, [clearPreviewRestoreTimers, restorePreviewScrollOffset])

  useEffect(() => {
    return () => {
      clearPreviewRestoreTimers()
    }
  }, [clearPreviewRestoreTimers])

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

  const handleSend = useCallback(
    async (payload: { text: string; images: string[] }) => {
      try {
        if (payload.text && payload.images.length > 0) {
          throw new Error('文字和图片不能同时发送')
        }

        if (!payload.text && payload.images.length === 0) {
          return
        }

        syncScrollState(true)

        if (payload.text) {
          if (conversationType === 'partner') {
            await dispatch(
              sendPartnerConversationMessage({
                type: 'text',
                content: payload.text
              })
            )
          } else if (groupId) {
            await dispatch(
              sendGroupConversationMessage({
                groupId,
                type: 'text',
                content: payload.text
              })
            )
          }
          return
        }

        const optimisticMessages = payload.images.map((uri, index) => ({
          messageId: uuidv4(),
          conversationId:
            conversationType === 'partner'
              ? partner.partnerId || 'partner'
              : groupId || '',
          type: 'image' as const,
          content: uri,
          ctime: Date.now() + index,
          fromUserId: currentUserId || '',
          senderName: currentUserName,
          senderAvatar: currentUserAvatar || '',
          localStatus: 'uploading' as const
        }))

        setPendingMessages(prev => [...prev, ...optimisticMessages])

        const results = await Promise.allSettled(
          optimisticMessages.map(async item => {
            const response = await uploadFile(item.content)
            const remoteUrl = resolveUploadUrl(response)

            if (!remoteUrl) {
              throw new Error('图片上传失败')
            }

            if (conversationType === 'partner') {
              await dispatch(
                sendPartnerConversationMessage({
                  type: 'image',
                  content: remoteUrl,
                  messageId: item.messageId,
                  ctime: item.ctime
                })
              )
            } else if (groupId) {
              await dispatch(
                sendGroupConversationMessage({
                  groupId,
                  type: 'image',
                  content: remoteUrl,
                  messageId: item.messageId,
                  ctime: item.ctime
                })
              )
            }

            return item.messageId
          })
        )

        const successIds = results
          .filter(
            (result): result is PromiseFulfilledResult<string> =>
              result.status === 'fulfilled'
          )
          .map(result => result.value)

        const failedIds = optimisticMessages
          .map(item => item.messageId)
          .filter(id => !successIds.includes(id))

        setPendingMessages(prev =>
          prev.filter(item => !successIds.includes(item.messageId))
        )

        if (failedIds.length > 0) {
          setPendingMessages(prev =>
            prev.filter(item => !failedIds.includes(item.messageId))
          )
          showMessage(
            failedIds.length === optimisticMessages.length
              ? '图片发送失败，请稍后重试'
              : '部分图片发送失败'
          )
        }
      } catch (error: any) {
        showMessage(error?.message || '发送失败，请稍后重试')
        throw error
      }
    },
    [
      conversationType,
      currentUserAvatar,
      currentUserId,
      currentUserName,
      dispatch,
      groupId,
      partner.partnerId,
      showMessage,
      syncScrollState
    ]
  )

  const renderMessageItem = useCallback(
    ({ item }: { item: MessengerMessage }) => {
      const isMine = !!currentUserId && item.fromUserId === currentUserId
      const member =
        conversationType === 'group' ? memberMap[item.fromUserId] : null
      const senderLabel = isMine
        ? currentUserName
        : conversationType === 'partner'
          ? partner.name || '另一半'
          : member?.username || item.senderName || '群成员'
      const senderAvatar = isMine
        ? currentUserAvatar
        : conversationType === 'partner'
          ? partner.avatar
          : member?.avatar || item.senderAvatar || ''

      return (
        <View style={styles.messageItem}>
          <ChatMessageBubble
            avatar={senderAvatar}
            isMine={isMine}
            message={item}
            onPressImage={uri => {
              if (item.localStatus === 'uploading') return
              openImagePreview(uri)
            }}
            senderLabel={senderLabel}
            showSenderName={conversationType === 'group'}
          />
        </View>
      )
    },
    [
      conversationType,
      currentUserAvatar,
      currentUserId,
      currentUserName,
      memberMap,
      openImagePreview,
      partner.avatar,
      partner.name
    ]
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <Animated.View style={[styles.container, keyboardAnimatedStyle]}>
        <View style={styles.messagesContainer}>
          <FlashList
            ref={listRef as any}
            data={listMessages}
            inverted
            initialScrollIndex={initialScrollIndex}
            keyExtractor={item => item.messageId}
            renderItem={renderMessageItem}
            contentContainerStyle={listContentStyle}
            keyboardDismissMode="none"
            scrollEnabled={isListScrollEnabled}
            onTouchStart={handleListTouchStart}
            onScroll={handleListScroll}
            onContentSizeChange={handleListContentSizeChange}
            onLoad={handleListReady}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={32}
                  color="#C9C9C9"
                />
                <Text style={styles.emptyText}>
                  {conversationType === 'partner'
                    ? '开始你们的第一句聊天'
                    : '还没有聊天记录'}
                </Text>
              </View>
            }
            style={styles.messageList}
          />
        </View>

        <View style={styles.composerWrap}>
          <View style={styles.composerCard}>
            <ChatDetailInput
              inputNativeID={CHAT_DETAIL_INPUT_NATIVE_ID}
              onSend={handleSend}
            />
          </View>
        </View>
      </Animated.View>

      <ImageViewing
        images={previewUri ? [{ uri: previewUri }] : []}
        imageIndex={0}
        visible={previewVisible}
        onRequestClose={closeImagePreview}
        swipeToCloseEnabled
        animationType="fade"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  messagesContainer: {
    flex: 1,
    position: 'relative'
  },
  messageItem: {
    paddingVertical: MESSAGE_GAP / 2
  },
  messageList: {
    flex: 1
  },
  emptyWrap: {
    paddingTop: 120,
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#9A9A9A'
  },
  headerAction: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  composerWrap: {
    backgroundColor: '#FFFFFF'
  },
  composerCard: {
    width: '100%',
    backgroundColor: '#fff'
  }
})
