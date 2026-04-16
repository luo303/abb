import request from '@/utils/request'

export interface PartnerBindPayload {
  account: string
  password: string
}

export interface PartnerResponse {
  code: number
  message: string
  data?: {
    partner_id?: string
    partner_username?: string
    partner_avatar?: string
  }
}

export interface ChatGroupSummaryResponse {
  code: number
  message: string
  data?: {
    items: ChatGroupSummaryDto[]
  }
}

export interface ChatGroupSummaryDto {
  group_id: string
  name: string
  avatar: string
  description: string
  member_limit: number
  member_count: number
  role: string
  unread_count: number
  ctime: number
  utime: number
  last_message_from_user_id?: string
  last_message_from_name?: string
  last_message_type?: string
  last_message_content?: string
  last_message_time?: number
}

export interface ChatGroupDiscoverDto {
  group_id: string
  name: string
  avatar: string
  member_count: number
  member_limit: number
}

export interface ChatGroupDiscoverResponse {
  code: number
  message: string
  data?: {
    seed: string
    items: ChatGroupDiscoverDto[]
    has_more: boolean
    next_cursor: string
  }
}

export interface ChatGroupSearchResponse {
  code: number
  message: string
  data?: {
    items: ChatGroupDiscoverDto[]
  }
}

export interface CreateGroupPayload {
  name: string
  avatar: string
  description: string
  member_limit: number
}

export interface CreateGroupResponse {
  code: number
  message: string
  data?: {
    group_id: string
    message: string
  }
}

export interface GroupMessageDto {
  message_id: string
  group_id: string
  from_user_id: string
  type: string
  content: string
  ctime: number
}

export interface GroupMessagesResponse {
  code: number
  message: string
  data?: {
    items: GroupMessageDto[]
    has_more: boolean
    next_before: string
  }
}

export interface GroupMemberDto {
  user_id: string
  username: string
  avatar: string
  role: string
  join_time: number
}

export interface GroupMembersResponse {
  code: number
  message: string
  data?: {
    items: GroupMemberDto[]
    page: number
    page_size: number
    has_more: boolean
  }
}

export const PARTNER_WS_BASE_URL = 'ws://38.76.197.12:8080/ws/chat'
export const GROUP_WS_BASE_URL = 'ws://38.76.197.12:8080/ws/groups'

export const fetchPartner = () => {
  return request.get('/user/partner') as Promise<PartnerResponse>
}

export const bindPartner = (data: PartnerBindPayload) => {
  return request.post('/user/partner/bind', data) as Promise<PartnerResponse>
}

export const fetchMyGroups = () => {
  return request.get('/chat/groups/mine') as Promise<ChatGroupSummaryResponse>
}

export const fetchDiscoverGroups = (params: {
  seed: string
  limit?: number
  next_cursor?: string
}) => {
  return request.get('/chat/groups/discover', {
    params
  }) as Promise<ChatGroupDiscoverResponse>
}

export const searchDiscoverGroups = (keyword: string, limit = 50) => {
  return request.get('/chat/groups/search', {
    params: {
      keyword,
      limit
    }
  }) as Promise<ChatGroupSearchResponse>
}

export const createChatGroup = (data: CreateGroupPayload) => {
  return request.post('/chat/groups', data) as Promise<CreateGroupResponse>
}

export const joinChatGroup = (groupId: string) => {
  return request.post(`/chat/groups/${groupId}/join`) as Promise<{
    code: number
    message: string
    data: null
  }>
}

export const fetchGroupMessages = (groupId: string, limit = 50) => {
  return request.get(`/chat/groups/${groupId}/messages`, {
    params: {
      limit
    }
  }) as Promise<GroupMessagesResponse>
}

export const fetchGroupMembers = (
  groupId: string,
  page = 1,
  pageSize = 100
) => {
  return request.get(`/chat/groups/${groupId}/members`, {
    params: {
      page,
      page_size: pageSize
    }
  }) as Promise<GroupMembersResponse>
}

export const markGroupSeen = (groupId: string) => {
  return request.post(`/chat/groups/${groupId}/seen`) as Promise<{
    code: number
    message: string
    data: null
  }>
}
