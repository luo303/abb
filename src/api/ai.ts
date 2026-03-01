import request from '@/utils/request'
import { AiRequest } from '@/types/AIchat'
import * as SecureStore from 'expo-secure-store'
import { ApiResponse } from './profile'

const AI_URL =
  'https://misapprehensive-overcontritely-roxy.ngrok-free.dev/api/common/ai/chat/stream'

//基本ai对话
export const SendMessage = async (data: AiRequest, signal?: AbortSignal) => {
  const token = SecureStore.getItem('token')
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

// 基于 XMLHttpRequest 的流式发送方法
export const SendMessageStream = (
  data: AiRequest,
  onMessage: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const token = SecureStore.getItem('token')
    const xhr = new XMLHttpRequest()
    let lastReadIndex = 0

    xhr.open('POST', AI_URL)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    if (signal) {
      signal.onabort = () => {
        xhr.abort()
        const error = new Error('Aborted')
        error.name = 'AbortError'
        reject(error)
      }
    }

    xhr.onprogress = () => {
      // 获取新增的部分
      const currIndex = xhr.responseText.length
      if (currIndex > lastReadIndex) {
        const chunk = xhr.responseText.substring(lastReadIndex, currIndex)
        lastReadIndex = currIndex
        onMessage(chunk)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`HTTP Error: ${xhr.status}`))
      }
    }

    xhr.onerror = e => {
      reject(new Error('Network request failed'))
    }

    xhr.send(JSON.stringify(data))
  })
}

export type UploadKnowledgePayload = {
  space_type: 'public' | 'private'
  content: string
}

export const uploadKnowledge = async (
  data: UploadKnowledgePayload
): Promise<ApiResponse<null>> => {
  const res = (await request.post(
    '/common/ai/knowledge/upload',
    data
  )) as ApiResponse<null>
  if (res?.code === 0) return res
  const err = new Error(res?.message || '上传失败')
  // @ts-ignore 附加后端自定义code便于上层判别
  err.code = res?.code
  throw err
}

//获取会话记录
export const GetSessionMessages = async (session_id: string) => {
  console.log(`获取会话记录${session_id}`)

  return request.get(`/common/ai/chat/history?session_id=${session_id}`)
}
