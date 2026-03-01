import request from '@/utils/request'
import { AiRequest } from '@/types/AIchat'
import * as SecureStore from 'expo-secure-store'
import { ApiResponse } from './profile'

const AI_URL =
  'https://tayna-nonredemptible-dissipatedly.ngrok-free.dev/api/common/ai/chat/stream'
const GROWTH_ANALYSIS_URL =
  'https://tayna-nonredemptible-dissipatedly.ngrok-free.dev/api/common/ai/growth/analysis'

//基本ai对话
export const SendMessage = async (data: AiRequest, signal?: AbortSignal) => {
  const token = await SecureStore.getItemAsync('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(AI_URL, {
    method: 'POST',
    headers,
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
    SecureStore.getItemAsync('token')
      .then(token => {
        const xhr = new XMLHttpRequest()
        let lastReadIndex = 0

        xhr.open('POST', AI_URL)
        xhr.setRequestHeader('Content-Type', 'application/json')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }

        if (signal) {
          signal.onabort = () => {
            xhr.abort()
            const error = new Error('Aborted')
            error.name = 'AbortError'
            reject(error)
          }
        }

        xhr.onprogress = () => {
          // 鑾峰彇鏂板鐨勯儴鍒?
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

        xhr.onerror = () => {
          reject(new Error('Network request failed'))
        }

        xhr.send(JSON.stringify(data))
      })
      .catch(error => {
        reject(error)
      })
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

export type GrowthAnalysisMetric = 'height' | 'weight' | 'head_circumference'
export type GrowthAnalysisUnit = 'cm' | 'kg'
export interface GrowthAnalysisItem {
  time: number
  value: number
}
export interface GrowthAnalysisPayload {
  birthday: number
  metric: GrowthAnalysisMetric
  unit: GrowthAnalysisUnit
  items: GrowthAnalysisItem[]
}

export const SendGrowthAnalysisStream = (
  data: GrowthAnalysisPayload,
  onMessage: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  console.log(1, data)

  return new Promise((resolve, reject) => {
    SecureStore.getItemAsync('token')
      .then(token => {
        const xhr = new XMLHttpRequest()
        let lastReadIndex = 0

        xhr.open('POST', GROWTH_ANALYSIS_URL)
        xhr.setRequestHeader('Content-Type', 'application/json')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }

        if (signal) {
          signal.onabort = () => {
            xhr.abort()
            const error = new Error('Aborted')
            error.name = 'AbortError'
            reject(error)
          }
        }

        xhr.onprogress = () => {
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

        xhr.onerror = () => {
          reject(new Error('Network request failed'))
        }

        xhr.send(JSON.stringify(data))
      })
      .catch(error => {
        reject(error)
      })
  })
}

//获取会话记录
export const GetSessionMessages = async (session_id: string) => {
  console.log(`获取会话记录${session_id}`)

  const res = await request.get(
    `/common/ai/chat/history?session_id=${session_id}`
  )
  console.log(res)

  return res
}
