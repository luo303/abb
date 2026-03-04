import request from '../utils/request'
import { FeedingRecordRequest } from '../types/feeding'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

// 新增喂养记录
export const createFeedingRecord = async (
  baby_id: string,
  data: FeedingRecordRequest
): Promise<ApiResponse<{ feeding_id: string }>> => {
  // 转换数据结构，匹配后端API要求
  const transformedData = {
    feed_type:
      data.feed_type === 'breast'
        ? 'breast_milk'
        : data.feed_type === 'food'
          ? 'solid'
          : 'formula',
    feed_time: data.start_time,
    remark: data.remark || ''
  }
  const res = (await request.post(
    `/baby/${baby_id}/daily/feeding`,
    transformedData
  )) as unknown as ApiResponse<{ feeding_id: string }>
  return res
}

// 当日统计信息
export interface DailyStatisticsResponse {
  code: number
  message: string
  data?: {
    feeding_count: number
    sleep_duration_ms: number
    diaper_count: number
    items: {
      id: string
      type: string
      sub_type: string
      time: number
      duration_ms?: number
    }[]
  }
}

export const getDailyStatistics = async (
  baby_id: string,
  date: string
): Promise<DailyStatisticsResponse> => {
  // 转换日期格式为YYYYMMDD
  const formattedDate = date.replace(/-/g, '')
  const res = (await request.get(`/baby/${baby_id}/daily/stats/byDate`, {
    params: {
      date: formattedDate
    }
  })) as unknown as DailyStatisticsResponse
  // 统一处理响应code
  if (String(res.code) !== '0') {
    throw new Error(res.message || '获取当日统计信息失败')
  }
  return res
}

// 获取当日统计信息
export const getDailyStatisticsReq = async (
  baby_id: string,
  date: string
): Promise<DailyStatisticsResponse> => {
  // 转换日期格式为YYYYMMDD
  const formattedDate = date.replace(/-/g, '')
  const res = (await request.get(`/baby/${baby_id}/daily/statistics`, {
    params: {
      date: formattedDate
    }
  })) as unknown as DailyStatisticsResponse
  // 统一处理响应code
  if (String(res.code) !== '0') {
    throw new Error(res.message || '获取当日统计信息失败')
  }
  return res
}
