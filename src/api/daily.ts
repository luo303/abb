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

  try {
    const res = (await request.get(`/baby/${baby_id}/daily/stats/byDate`, {
      params: {
        date: formattedDate
      }
    })) as unknown as DailyStatisticsResponse

    // 统一处理响应code
    if (String(res.code) !== '0' && res.code !== 200) {
      throw new Error(res.message || '获取当日统计信息失败')
    }

    // 数据验证
    if (res.data) {
      // 验证必要字段
      if (typeof res.data.feeding_count !== 'number') {
        throw new Error('数据格式错误：feeding_count 必须是数字')
      }
      if (typeof res.data.sleep_duration_ms !== 'number') {
        throw new Error('数据格式错误：sleep_duration_ms 必须是数字')
      }
      if (typeof res.data.diaper_count !== 'number') {
        throw new Error('数据格式错误：diaper_count 必须是数字')
      }
      if (!Array.isArray(res.data.items)) {
        throw new Error('数据格式错误：items 必须是数组')
      }

      // 验证items数组中的每个元素
      if (res.data.items.length > 0) {
        res.data.items.forEach((item, index) => {
          if (typeof item.id !== 'string') {
            throw new Error(`数据格式错误：items[${index}].id 必须是字符串`)
          }
          if (typeof item.type !== 'string') {
            throw new Error(`数据格式错误：items[${index}].type 必须是字符串`)
          }
          if (typeof item.sub_type !== 'string') {
            throw new Error(
              `数据格式错误：items[${index}].sub_type 必须是字符串`
            )
          }
          if (typeof item.time !== 'number') {
            throw new Error(`数据格式错误：items[${index}].time 必须是数字`)
          }
          if (
            item.duration_ms !== undefined &&
            typeof item.duration_ms !== 'number'
          ) {
            throw new Error(
              `数据格式错误：items[${index}].duration_ms 必须是数字`
            )
          }
        })
      }
    }

    return res
  } catch (error) {
    throw error
  }
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
