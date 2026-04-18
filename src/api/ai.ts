import request from '@/utils/request'
import { AiRequest } from '@/types/AIchat'
import * as SecureStore from 'expo-secure-store'
import { fetch as expoFetch } from 'expo/fetch'
import { ApiResponse } from './profile'

const AI_URL = 'http://38.76.197.12:8080/api/common/ai/chat/stream'
const GROWTH_ANALYSIS_URL =
  'http://38.76.197.12:8080/api/common/ai/growth/analysis'

//基本ai对话
export const SendMessage = async (data: AiRequest, signal?: AbortSignal) => {
  const token = await SecureStore.getItemAsync('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return expoFetch(AI_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    signal
  })
}

const createAbortError = () => {
  const abortError = new Error('Aborted')
  abortError.name = 'AbortError'
  return abortError
}

const streamWithExpoFetch = async <T extends object>(
  url: string,
  data: T,
  onMessage: (chunk: string) => void,
  signal?: AbortSignal
) => {
  const token = await SecureStore.getItemAsync('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await expoFetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    signal
  })

  if (!res.ok) {
    throw new Error(`HTTP Error: ${res.status}`)
  }

  if (!res.body) {
    const text = await res.text()
    if (text) onMessage(text)
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')

  while (true) {
    if (signal?.aborted) {
      throw createAbortError()
    }
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) onMessage(chunk)
  }

  const remain = decoder.decode()
  if (remain) onMessage(remain)
}

export const SendMessageStream = async (
  data: AiRequest,
  onMessage: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  try {
    await streamWithExpoFetch(AI_URL, data, onMessage, signal)
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error
    if (signal?.aborted) throw createAbortError()
    throw error
  }
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

export const SendGrowthAnalysisStream = async (
  data: GrowthAnalysisPayload,
  onMessage: (chunk: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  try {
    await streamWithExpoFetch(GROWTH_ANALYSIS_URL, data, onMessage, signal)
  } catch (error: any) {
    if (error?.name === 'AbortError') throw error
    if (signal?.aborted) throw createAbortError()
    throw error
  }
}

export type GrowthReportLanguage = 'zh' | 'en'

export interface GrowthReportRequest {
  baby_id: string
  range_days: number
  language: GrowthReportLanguage
}

export interface GrowthReportBaby {
  baby_id: string
  name: string
  gender: string
  birthday: number
  avatar: string
}

export interface GrowthReportRange {
  from: number
  to: number
  days: number
}

export interface GrowthReportGrowthItem {
  time: number
  height?: number
  weight?: number
  head_circumference?: number
  remark?: string
}

export interface GrowthReportGrowth {
  items: GrowthReportGrowthItem[]
}

export interface GrowthReportStructuredData {
  baby: GrowthReportBaby
  range: GrowthReportRange
  growth: GrowthReportGrowth
  analysis?: Record<string, unknown>
}

export interface GrowthReportApiData {
  markdown: string
  data: GrowthReportStructuredData
}

export const makeGrowthReportCacheKey = (params: GrowthReportRequest) => {
  return `${params.baby_id}:${params.range_days}:${params.language}`
}

export const getGrowthReport = async (
  data: GrowthReportRequest
): Promise<GrowthReportApiData> => {
  const res = (await request.post(
    '/common/ai/report/growth',
    data
  )) as ApiResponse<GrowthReportApiData>
  if (res?.code === 0 && res.data) return res.data
  const err = new Error(res?.message || '生成报告失败')
  ;(err as any).code = res?.code
  throw err
}
