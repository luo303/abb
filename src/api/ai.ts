import request from '@/utils/request'
import { aiReuset } from '@/types/AIchat'
//基本ai对话
export const SendMessage = async (data: aiReuset) => {
  return request.post('/common/ai/chat/stream', data)
}
