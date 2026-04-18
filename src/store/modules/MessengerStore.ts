import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'

import {
  bindPartner,
  ChatGroupSummaryDto,
  createChatGroup,
  CreateGroupPayload,
  dissolveChatGroup,
  fetchGroupMembers,
  fetchGroupMessages,
  fetchMyGroups,
  fetchPartner,
  GroupMemberDto,
  GroupMessageDto,
  joinChatGroup,
  leaveChatGroup,
  markGroupSeen
} from '@/api/messenger'
import {
  closeGroupSocket,
  connectGroupSocket,
  sendGroupSocket,
  updateGroupSubscriptions
} from '@/api/groupSocket'
import {
  closePartnerSocket,
  connectPartnerSocket,
  sendPartnerSocket
} from '@/api/partnerSocket'

const STORAGE_KEY = 'messenger_cache_v1'

export type MessengerConversationType = 'partner' | 'group'
export type MessengerMessageType = 'text' | 'image'

export interface MessengerMessage {
  messageId: string
  conversationId: string
  type: MessengerMessageType
  content: string
  ctime: number
  fromUserId: string
  senderName?: string
  senderAvatar?: string
  localStatus?: 'uploading' | 'failed'
}

export interface ChatGroupSummary {
  groupId: string
  name: string
  avatar: string
  description: string
  memberLimit: number
  memberCount: number
  role: string
  unreadCount: number
  ctime: number
  utime: number
  lastMessageFromUserId?: string
  lastMessageFromName?: string
  lastMessageType?: MessengerMessageType
  lastMessageContent?: string
  lastMessageTime?: number
}

export interface ChatGroupMember {
  userId: string
  username: string
  avatar: string
  role: string
  joinTime: number
}

type MessengerCache = {
  partnerMessages: MessengerMessage[]
  partnerUnreadCount: number
  groupMessagesByGroupId: Record<string, MessengerMessage[]>
}

interface MessengerState {
  hydrated: boolean
  bootstrapping: boolean
  activeConversation: {
    type: MessengerConversationType | null
    id: string | null
  }
  partner: {
    partnerId: string | null
    name: string | null
    avatar: string | null
    unreadCount: number
    messages: MessengerMessage[]
    isConnected: boolean
  }
  groups: {
    items: ChatGroupSummary[]
    messagesByGroupId: Record<string, MessengerMessage[]>
    membersByGroupId: Record<string, ChatGroupMember[]>
    isConnected: boolean
  }
}

const initialState: MessengerState = {
  hydrated: false,
  bootstrapping: false,
  activeConversation: {
    type: null,
    id: null
  },
  partner: {
    partnerId: null,
    name: null,
    avatar: null,
    unreadCount: 0,
    messages: [],
    isConnected: false
  },
  groups: {
    items: [],
    messagesByGroupId: {},
    membersByGroupId: {},
    isConnected: false
  }
}

const upsertMessageList = (
  messages: MessengerMessage[],
  nextMessage: MessengerMessage
) => {
  const existingIndex = messages.findIndex(
    item => item.messageId === nextMessage.messageId
  )
  const nextMessages = [...messages]

  if (existingIndex >= 0) {
    nextMessages[existingIndex] = {
      ...nextMessages[existingIndex],
      ...nextMessage
    }
  } else {
    nextMessages.push(nextMessage)
  }

  nextMessages.sort((a, b) => {
    if (a.ctime === b.ctime) {
      return a.messageId.localeCompare(b.messageId)
    }
    return a.ctime - b.ctime
  })

  return nextMessages
}

const mergeEchoMessageList = (
  messages: MessengerMessage[],
  nextMessage: MessengerMessage
) => {
  const existingById = messages.findIndex(
    item => item.messageId === nextMessage.messageId
  )
  if (existingById >= 0) {
    return upsertMessageList(messages, nextMessage)
  }

  const optimisticIndex = messages.findIndex(item => {
    return (
      item.fromUserId === nextMessage.fromUserId &&
      item.type === nextMessage.type &&
      item.content === nextMessage.content &&
      Math.abs(item.ctime - nextMessage.ctime) <= 8000
    )
  })

  if (optimisticIndex < 0) {
    return upsertMessageList(messages, nextMessage)
  }

  const nextMessages = [...messages]
  nextMessages[optimisticIndex] = {
    ...nextMessages[optimisticIndex],
    ...nextMessage
  }

  nextMessages.sort((a, b) => {
    if (a.ctime === b.ctime) {
      return a.messageId.localeCompare(b.messageId)
    }
    return a.ctime - b.ctime
  })

  return nextMessages
}

const sortGroupsByActivity = (items: ChatGroupSummary[]) => {
  return [...items].sort((a, b) => {
    const aTime = a.lastMessageTime || a.utime || a.ctime || 0
    const bTime = b.lastMessageTime || b.utime || b.ctime || 0
    return bTime - aTime
  })
}

const isMockGroupId = (groupId: string) => groupId.startsWith('mock-group-')

const mapGroupSummary = (item: ChatGroupSummaryDto): ChatGroupSummary => ({
  groupId: item.group_id,
  name: item.name,
  avatar: item.avatar,
  description: item.description,
  memberLimit: item.member_limit,
  memberCount: item.member_count,
  role: item.role,
  unreadCount: item.unread_count,
  ctime: item.ctime,
  utime: item.utime,
  lastMessageFromUserId: item.last_message_from_user_id,
  lastMessageFromName: item.last_message_from_name,
  lastMessageType:
    item.last_message_type === 'image'
      ? 'image'
      : item.last_message_type === 'text'
        ? 'text'
        : undefined,
  lastMessageContent: item.last_message_content,
  lastMessageTime: item.last_message_time
})

const mapGroupMessage = (item: GroupMessageDto): MessengerMessage => ({
  messageId: item.message_id,
  conversationId: item.group_id,
  type: item.type === 'image' ? 'image' : 'text',
  content: item.content,
  ctime: item.ctime,
  fromUserId: item.from_user_id
})

const mapGroupMember = (item: GroupMemberDto): ChatGroupMember => ({
  userId: item.user_id,
  username: item.username,
  avatar: item.avatar,
  role: item.role,
  joinTime: item.join_time
})

const saveMessengerCache = async (state: MessengerState) => {
  const cache: MessengerCache = {
    partnerMessages: state.partner.messages,
    partnerUnreadCount: state.partner.unreadCount,
    groupMessagesByGroupId: state.groups.messagesByGroupId
  }

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to save messenger cache:', error)
  }
}

const messengerSlice = createSlice({
  name: 'messenger',
  initialState,
  reducers: {
    resetMessengerState: () => initialState,
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload
    },
    setBootstrapping: (state, action: PayloadAction<boolean>) => {
      state.bootstrapping = action.payload
    },
    hydrateCache: (state, action: PayloadAction<MessengerCache>) => {
      state.partner.messages = action.payload.partnerMessages || []
      state.partner.unreadCount = action.payload.partnerUnreadCount || 0
      state.groups.messagesByGroupId =
        action.payload.groupMessagesByGroupId || {}
    },
    setActiveConversation: (
      state,
      action: PayloadAction<{
        type: MessengerConversationType | null
        id: string | null
      }>
    ) => {
      state.activeConversation = action.payload
    },
    setPartnerInfo: (
      state,
      action: PayloadAction<{
        partnerId: string
        name: string
        avatar: string | null
      } | null>
    ) => {
      if (action.payload === null) {
        state.partner.partnerId = null
        state.partner.name = null
        state.partner.avatar = null
        return
      }

      const hasPartnerChanged =
        state.partner.partnerId &&
        state.partner.partnerId !== action.payload.partnerId

      state.partner.partnerId = action.payload.partnerId
      state.partner.name = action.payload.name
      state.partner.avatar = action.payload.avatar

      if (hasPartnerChanged) {
        state.partner.messages = []
        state.partner.unreadCount = 0
      }
    },
    setPartnerMessages: (state, action: PayloadAction<MessengerMessage[]>) => {
      state.partner.messages = [...action.payload].sort(
        (a, b) => a.ctime - b.ctime
      )
    },
    upsertPartnerMessage: (state, action: PayloadAction<MessengerMessage>) => {
      state.partner.messages = upsertMessageList(
        state.partner.messages,
        action.payload
      )
    },
    incrementPartnerUnread: state => {
      state.partner.unreadCount += 1
    },
    clearPartnerUnread: state => {
      state.partner.unreadCount = 0
    },
    setPartnerConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.partner.isConnected = action.payload
    },
    setGroups: (state, action: PayloadAction<ChatGroupSummary[]>) => {
      state.groups.items = sortGroupsByActivity(action.payload)
    },
    upsertGroupSummary: (state, action: PayloadAction<ChatGroupSummary>) => {
      const index = state.groups.items.findIndex(
        item => item.groupId === action.payload.groupId
      )

      if (index >= 0) {
        state.groups.items[index] = {
          ...state.groups.items[index],
          ...action.payload
        }
      } else {
        state.groups.items.push(action.payload)
      }

      state.groups.items = sortGroupsByActivity(state.groups.items)
    },
    updateGroupSummaryFromMessage: (
      state,
      action: PayloadAction<{
        groupId: string
        message: MessengerMessage
        senderName?: string
        incrementUnread?: boolean
      }>
    ) => {
      const group = state.groups.items.find(
        item => item.groupId === action.payload.groupId
      )
      if (!group) return

      group.lastMessageType = action.payload.message.type
      group.lastMessageContent = action.payload.message.content
      group.lastMessageTime = action.payload.message.ctime
      group.lastMessageFromUserId = action.payload.message.fromUserId
      group.lastMessageFromName =
        action.payload.senderName || group.lastMessageFromName
      group.utime = action.payload.message.ctime

      if (action.payload.incrementUnread) {
        group.unreadCount += 1
      }

      state.groups.items = sortGroupsByActivity(state.groups.items)
    },
    clearGroupUnread: (state, action: PayloadAction<string>) => {
      const group = state.groups.items.find(
        item => item.groupId === action.payload
      )
      if (group) {
        group.unreadCount = 0
      }
    },
    setGroupMessages: (
      state,
      action: PayloadAction<{
        groupId: string
        messages: MessengerMessage[]
      }>
    ) => {
      state.groups.messagesByGroupId[action.payload.groupId] = [
        ...action.payload.messages
      ].sort((a, b) => a.ctime - b.ctime)
    },
    upsertGroupMessage: (
      state,
      action: PayloadAction<{
        groupId: string
        message: MessengerMessage
      }>
    ) => {
      const current =
        state.groups.messagesByGroupId[action.payload.groupId] || []
      state.groups.messagesByGroupId[action.payload.groupId] =
        upsertMessageList(current, action.payload.message)
    },
    mergeGroupSocketMessage: (
      state,
      action: PayloadAction<{
        groupId: string
        message: MessengerMessage
      }>
    ) => {
      const current =
        state.groups.messagesByGroupId[action.payload.groupId] || []
      state.groups.messagesByGroupId[action.payload.groupId] =
        mergeEchoMessageList(current, action.payload.message)
    },
    setGroupMembers: (
      state,
      action: PayloadAction<{
        groupId: string
        members: ChatGroupMember[]
      }>
    ) => {
      state.groups.membersByGroupId[action.payload.groupId] =
        action.payload.members
    },
    removeGroupConversation: (state, action: PayloadAction<string>) => {
      state.groups.items = state.groups.items.filter(
        item => item.groupId !== action.payload
      )
      delete state.groups.messagesByGroupId[action.payload]
      delete state.groups.membersByGroupId[action.payload]

      if (
        state.activeConversation.type === 'group' &&
        state.activeConversation.id === action.payload
      ) {
        state.activeConversation = {
          type: null,
          id: null
        }
      }
    },
    setGroupConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.groups.isConnected = action.payload
    }
  }
})

export const {
  clearGroupUnread,
  clearPartnerUnread,
  hydrateCache,
  incrementPartnerUnread,
  resetMessengerState,
  removeGroupConversation,
  setActiveConversation,
  setBootstrapping,
  setGroupConnectionStatus,
  setGroupMembers,
  setGroupMessages,
  setGroups,
  setHydrated,
  mergeGroupSocketMessage,
  setPartnerConnectionStatus,
  setPartnerInfo,
  setPartnerMessages,
  upsertGroupSummary,
  upsertGroupMessage,
  upsertPartnerMessage,
  updateGroupSummaryFromMessage
} = messengerSlice.actions

const persistState = async (getState: any) => {
  await saveMessengerCache(getState().messenger as MessengerState)
}

export const loadMessengerCache =
  () => async (dispatch: any, getState: any) => {
    if (getState().messenger.hydrated) return

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const cache = JSON.parse(raw) as MessengerCache
        dispatch(
          hydrateCache({
            partnerMessages: cache.partnerMessages || [],
            partnerUnreadCount: cache.partnerUnreadCount || 0,
            groupMessagesByGroupId: cache.groupMessagesByGroupId || {}
          })
        )
      }
    } catch (error) {
      console.error('Failed to load messenger cache:', error)
    } finally {
      dispatch(setHydrated(true))
    }
  }

export const connectPartnerRealtime =
  () => async (dispatch: any, getState: any) => {
    const state = getState()
    const token = state.user.token as string
    const partnerId = state.messenger.partner.partnerId as string | null

    if (!token || !partnerId) {
      console.log(
        `[聊天初始化] 跳过伴侣连接：token=${!!token} partnerId=${partnerId || '空'}`
      )
      closePartnerSocket()
      dispatch(setPartnerConnectionStatus(false))
      return
    }

    console.log(`[聊天初始化] 开始连接伴侣 WS，partnerId=${partnerId}`)
    connectPartnerSocket(token, partnerId, {
      onOpen: () => {
        console.log('[聊天初始化] 伴侣 WS 已连接')
        dispatch(setPartnerConnectionStatus(true))
      },
      onClose: () => {
        console.log('[聊天初始化] 伴侣 WS 已断开')
        dispatch(setPartnerConnectionStatus(false))
      },
      onError: () => {
        console.log('[聊天初始化] 伴侣 WS 触发错误')
        dispatch(setPartnerConnectionStatus(false))
      },
      onMessage: (raw: string) => {
        dispatch(processPartnerSocketMessage(raw))
      }
    })
  }

export const connectGroupRealtime =
  () => async (dispatch: any, getState: any) => {
    const state = getState()
    const token = state.user.token as string

    if (!token) {
      console.log('[聊天初始化] 跳过群聊连接：token 为空')
      closeGroupSocket()
      dispatch(setGroupConnectionStatus(false))
      return
    }

    console.log('[聊天初始化] 开始连接群聊 WS')
    connectGroupSocket(token, {
      onOpen: () => {
        console.log('[聊天初始化] 群聊 WS 已连接')
        dispatch(setGroupConnectionStatus(true))
        const groupIds = (
          getState().messenger.groups.items as ChatGroupSummary[]
        )
          .map(item => item.groupId)
          .filter(groupId => !isMockGroupId(groupId))
        updateGroupSubscriptions(groupIds)
      },
      onClose: () => {
        console.log('[聊天初始化] 群聊 WS 已断开')
        dispatch(setGroupConnectionStatus(false))
      },
      onError: () => {
        console.log('[聊天初始化] 群聊 WS 触发错误')
        dispatch(setGroupConnectionStatus(false))
      },
      onMessage: (raw: string) => {
        dispatch(processGroupSocketMessage(raw))
      }
    })

    const groupIds = (state.messenger.groups.items as ChatGroupSummary[]).map(
      item => item.groupId
    )
    updateGroupSubscriptions(
      groupIds.filter(groupId => !isMockGroupId(groupId))
    )
  }

export const refreshPartnerInfo =
  () => async (dispatch: any, getState: any) => {
    try {
      console.log('[聊天初始化] 开始拉取另一半信息')
      const previousPartnerId = getState().messenger.partner.partnerId as
        | string
        | null
      const res = await fetchPartner()
      const nextPartnerId = res?.data?.partner_id?.trim()

      if (!nextPartnerId) {
        console.log('[聊天初始化] 当前没有绑定另一半')
        dispatch(setPartnerInfo(null))
        closePartnerSocket()
        dispatch(setPartnerConnectionStatus(false))
        return
      }

      console.log(`[聊天初始化] 拉取另一半成功，partnerId=${nextPartnerId}`)

      dispatch(
        setPartnerInfo({
          partnerId: nextPartnerId,
          name: res?.data?.partner_username || '另一半',
          avatar: res?.data?.partner_avatar || null
        })
      )

      if (previousPartnerId && previousPartnerId !== nextPartnerId) {
        dispatch(setPartnerMessages([]))
        await persistState(getState)
      }

      dispatch(connectPartnerRealtime())
    } catch (error) {
      console.error('Failed to refresh partner info:', error)
    }
  }

export const bindPartnerAccount =
  (payload: { account: string; password: string }) =>
  async (dispatch: any, getState: any) => {
    const res = await bindPartner(payload)
    const partnerId = res?.data?.partner_id?.trim()

    if (!partnerId) {
      throw new Error(res?.message || '绑定另一半失败')
    }

    dispatch(
      setPartnerInfo({
        partnerId,
        name: res?.data?.partner_username || '另一半',
        avatar: res?.data?.partner_avatar || null
      })
    )
    dispatch(connectPartnerRealtime())
    await persistState(getState)
    return res
  }

export const refreshGroupList = () => async (dispatch: any, getState: any) => {
  try {
    console.log('[聊天初始化] 开始拉取我的群列表')
    const res = await fetchMyGroups()
    const remoteItems = (res?.data?.items || []).map(mapGroupSummary)
    const mockItems = (
      getState().messenger.groups.items as ChatGroupSummary[]
    ).filter(item => isMockGroupId(item.groupId))
    const items = [...remoteItems, ...mockItems]
    console.log(`[聊天初始化] 拉取群列表成功，count=${items.length}`)
    dispatch(setGroups(items))
    updateGroupSubscriptions(
      items.map(item => item.groupId).filter(groupId => !isMockGroupId(groupId))
    )
    dispatch(connectGroupRealtime())
  } catch (error) {
    console.error('Failed to refresh group list:', error)
  }
}

export const syncMessengerHomeEntry =
  () => async (dispatch: any, getState: any) => {
    if (!getState().user.token) {
      console.log('[聊天初始化] 跳过首页聊天初始化：token 为空')
      return
    }

    console.log('[聊天初始化] 首页触发聊天初始化')
    await Promise.all([
      dispatch(refreshPartnerInfo()),
      dispatch(refreshGroupList())
    ])
    console.log('[聊天初始化] 首页聊天初始化完成')
  }

export const refreshGroupMessages =
  (groupId: string, limit = 50) =>
  async (dispatch: any, getState: any) => {
    const res = await fetchGroupMessages(groupId, limit)
    const messages = [...(res?.data?.items || [])]
      .reverse()
      .map(mapGroupMessage)
    dispatch(setGroupMessages({ groupId, messages }))
    await persistState(getState)
    return res
  }

export const refreshGroupMembers =
  (groupId: string) => async (dispatch: any) => {
    const members: ChatGroupMember[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await fetchGroupMembers(groupId, page, 100)
      members.push(...(res?.data?.items || []).map(mapGroupMember))
      hasMore = Boolean(res?.data?.has_more)
      page += 1
    }

    dispatch(setGroupMembers({ groupId, members }))
    return members
  }

export const clearPartnerUnreadCount =
  () => async (dispatch: any, getState: any) => {
    dispatch(clearPartnerUnread())
    await persistState(getState)
  }

export const markGroupConversationSeen =
  (groupId: string) => async (dispatch: any, getState: any) => {
    dispatch(clearGroupUnread(groupId))
    await persistState(getState)

    try {
      await markGroupSeen(groupId)
    } catch (error) {
      console.error('Failed to mark group seen:', error)
    }
  }

export const processPartnerSocketMessage =
  (raw: string) => async (dispatch: any, getState: any) => {
    let payload: any = null
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }

    if (!payload || (payload.type !== 'text' && payload.type !== 'image')) {
      return
    }

    const partnerId = getState().messenger.partner.partnerId as string | null
    if (!partnerId) return

    const currentUserId = getState().user.userInfo?.user_id as
      | string
      | undefined
    const message: MessengerMessage = {
      messageId: payload.message_id || uuidv4(),
      conversationId: partnerId,
      type: payload.type,
      content: String(payload.content || ''),
      ctime: Number(payload.ctime || Date.now()),
      fromUserId: payload.from_user_id || '',
      senderName: payload.sender_name,
      senderAvatar: payload.sender_avatar
    }

    if (!message.content) return
    dispatch(upsertPartnerMessage(message))

    const isMine = !!currentUserId && message.fromUserId === currentUserId
    const isPartnerConversationActive =
      getState().messenger.activeConversation.type === 'partner'

    if (!isMine && !isPartnerConversationActive) {
      dispatch(incrementPartnerUnread())
    }

    await persistState(getState)
  }

export const processGroupSocketMessage =
  (raw: string) => async (dispatch: any, getState: any) => {
    let payload: any = null
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }

    if (!payload || payload.op === 'ack') {
      return
    }

    if (payload.op !== 'new_message' || !payload.group_id || !payload.message) {
      return
    }

    const currentUserId = getState().user.userInfo?.user_id as
      | string
      | undefined
    const messagePayload = payload.message
    const message: MessengerMessage = {
      messageId: messagePayload.message_id || uuidv4(),
      conversationId: payload.group_id,
      type: messagePayload.type === 'image' ? 'image' : 'text',
      content: String(messagePayload.content || ''),
      ctime: Number(messagePayload.ctime || Date.now()),
      fromUserId: messagePayload.from_user_id || ''
    }

    if (!message.content) return

    dispatch(
      mergeGroupSocketMessage({
        groupId: payload.group_id,
        message
      })
    )

    const members =
      (getState().messenger.groups.membersByGroupId[payload.group_id] as
        | ChatGroupMember[]
        | undefined) || []
    const sender = members.find(item => item.userId === message.fromUserId)
    const isMine = !!currentUserId && message.fromUserId === currentUserId
    const activeConversation = getState().messenger.activeConversation
    const isCurrentGroupActive =
      activeConversation.type === 'group' &&
      activeConversation.id === payload.group_id

    dispatch(
      updateGroupSummaryFromMessage({
        groupId: payload.group_id,
        message,
        senderName: sender?.username,
        incrementUnread: !isMine && !isCurrentGroupActive
      })
    )

    await persistState(getState)
  }

export const sendPartnerConversationMessage =
  (payload: {
    type: MessengerMessageType
    content: string
    messageId?: string
    ctime?: number
  }) =>
  async (dispatch: any, getState: any) => {
    const state = getState()
    const partnerId = state.messenger.partner.partnerId as string | null
    const userInfo = state.user.userInfo

    if (!partnerId) {
      throw new Error('请先绑定另一半')
    }

    const message: MessengerMessage = {
      messageId: payload.messageId || uuidv4(),
      conversationId: partnerId,
      type: payload.type,
      content: payload.content,
      ctime: payload.ctime || Date.now(),
      fromUserId: userInfo?.user_id || '',
      senderName: userInfo?.username || userInfo?.account || '我',
      senderAvatar: userInfo?.avatar || ''
    }

    dispatch(upsertPartnerMessage(message))
    await persistState(getState)

    const ok = sendPartnerSocket({
      message_id: message.messageId,
      type: message.type,
      content: message.content,
      ctime: message.ctime,
      from_user_id: message.fromUserId,
      sender_name: message.senderName,
      sender_avatar: message.senderAvatar
    })

    if (!ok) {
      dispatch(connectPartnerRealtime())
      throw new Error('另一半聊天连接中，请稍后重试')
    }
  }

export const sendGroupConversationMessage =
  (payload: {
    groupId: string
    type: MessengerMessageType
    content: string
    messageId?: string
    ctime?: number
  }) =>
  async (dispatch: any, getState: any) => {
    const state = getState()
    const userInfo = state.user.userInfo
    const summary = (state.messenger.groups.items as ChatGroupSummary[]).find(
      item => item.groupId === payload.groupId
    )
    const localMessage: MessengerMessage = {
      messageId: payload.messageId || uuidv4(),
      conversationId: payload.groupId,
      type: payload.type,
      content: payload.content,
      ctime: payload.ctime || Date.now(),
      fromUserId: userInfo?.user_id || '',
      senderName: userInfo?.username || userInfo?.account || '我',
      senderAvatar: userInfo?.avatar || ''
    }

    if (isMockGroupId(payload.groupId)) {
      dispatch(
        upsertGroupMessage({
          groupId: payload.groupId,
          message: localMessage
        })
      )
      dispatch(
        updateGroupSummaryFromMessage({
          groupId: payload.groupId,
          message: localMessage,
          senderName: userInfo?.username || userInfo?.account || '我',
          incrementUnread: false
        })
      )
      await persistState(getState)
      return
    }

    dispatch(
      upsertGroupMessage({
        groupId: payload.groupId,
        message: localMessage
      })
    )

    const ok = sendGroupSocket({
      op: 'send',
      group_id: payload.groupId,
      message_id: localMessage.messageId,
      type: payload.type,
      content: payload.content
    })

    if (!ok) {
      dispatch(connectGroupRealtime())
      throw new Error('群聊连接中，请稍后重试')
    }

    dispatch(
      updateGroupSummaryFromMessage({
        groupId: payload.groupId,
        message: localMessage,
        senderName: userInfo?.username || userInfo?.account || '我',
        incrementUnread: false
      })
    )

    if (summary) {
      await persistState(getState)
    }
  }

export const createGroupConversation =
  (payload: CreateGroupPayload) => async (dispatch: any, getState: any) => {
    const res = await createChatGroup(payload)
    const groupId = res?.data?.group_id?.trim()

    if (!groupId) {
      throw new Error(res?.message || '创建群聊失败')
    }

    const now = Date.now()
    dispatch(
      upsertGroupSummary({
        groupId,
        name: payload.name,
        avatar: payload.avatar,
        description: payload.description,
        memberLimit: payload.member_limit,
        memberCount: 1,
        role: 'owner',
        unreadCount: 0,
        ctime: now,
        utime: now
      })
    )
    await persistState(getState)
    dispatch(connectGroupRealtime())

    return {
      ...res,
      data: {
        ...res?.data,
        group_id: groupId
      }
    }
  }

export const joinGroupConversation =
  (groupId: string) => async (dispatch: any) => {
    const res = await joinChatGroup(groupId)
    await dispatch(refreshGroupList())
    return res
  }

export const leaveGroupConversation =
  (groupId: string) => async (dispatch: any, getState: any) => {
    const res = await leaveChatGroup(groupId)

    dispatch(removeGroupConversation(groupId))

    const remainingGroupIds = (
      getState().messenger.groups.items as ChatGroupSummary[]
    )
      .map(item => item.groupId)
      .filter(item => !isMockGroupId(item))

    updateGroupSubscriptions(remainingGroupIds)
    await persistState(getState)

    return res
  }

export const dissolveGroupConversation =
  (groupId: string) => async (dispatch: any, getState: any) => {
    const res = await dissolveChatGroup(groupId)

    dispatch(removeGroupConversation(groupId))

    const remainingGroupIds = (
      getState().messenger.groups.items as ChatGroupSummary[]
    )
      .map(item => item.groupId)
      .filter(item => !isMockGroupId(item))

    updateGroupSubscriptions(remainingGroupIds)
    await persistState(getState)

    return res
  }

export const joinMockGroupConversation =
  (payload: {
    groupId: string
    name: string
    avatar: string
    description: string
    memberLimit: number
    memberCount: number
  }) =>
  async (dispatch: any, getState: any) => {
    dispatch(
      upsertGroupSummary({
        groupId: payload.groupId,
        name: payload.name,
        avatar: payload.avatar,
        description: payload.description,
        memberLimit: payload.memberLimit,
        memberCount: payload.memberCount,
        role: 'member',
        unreadCount: 0,
        ctime: Date.now(),
        utime: Date.now()
      })
    )
    await persistState(getState)
  }

export const bootstrapMessenger =
  () => async (dispatch: any, getState: any) => {
    if (!getState().user.token) {
      return
    }

    dispatch(setBootstrapping(true))
    await dispatch(loadMessengerCache())

    try {
      await Promise.all([
        dispatch(refreshPartnerInfo()),
        dispatch(refreshGroupList())
      ])
    } finally {
      dispatch(setBootstrapping(false))
    }
  }

export const shutdownMessenger = () => async (dispatch: any) => {
  closePartnerSocket()
  closeGroupSocket()
  dispatch(setPartnerConnectionStatus(false))
  dispatch(setGroupConnectionStatus(false))
}

export const clearMessengerState = () => async (dispatch: any) => {
  closePartnerSocket()
  closeGroupSocket()
  dispatch(resetMessengerState())

  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear messenger cache:', error)
  }
}

export default messengerSlice.reducer
