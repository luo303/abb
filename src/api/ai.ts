import request from '@/utils/request'
import { AiRequest } from '@/types/AIchat'
import store from '../store'

const AI_URL =
  'http://127.0.0.1:4523/m1/7571791-7309471-default/common/ai/chat/stream'

//基本ai对话
export const SendMessage = async (data: AiRequest, signal?: AbortSignal) => {
  const token = store.getState().user.token
  return fetch(AI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    signal
  })
}
//获取会话记录
export const GetSessionMessages = async (session_id: string) => {
  return request.get(`/common/ai/chat/history?session_id=${session_id}`)
}
