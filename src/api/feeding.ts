import request from '../utils/request'
import { FeedingItem, FeedingRecordRequest } from '../types/feeding'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface FeedingListResponse {
  code: number
  message: string
  data?: {
    items: FeedingItem[]
  }
}

// 获取单日喂养列表
export const getFeedingListByDateReq = async (
  baby_id: string,
  date: string
): Promise<FeedingListResponse> => {
  // 转换日期格式为YYYYMMDD
  const formattedDate = date.replace(/-/g, '')
  const res = (await request.get(`/baby/${baby_id}/daily/feeding/byDate`, {
    params: {
      date: formattedDate
    }
  })) as unknown as FeedingListResponse
  // 统一处理响应code
  if (String(res.code) !== '0') {
    throw new Error(res.message || '获取喂养记录失败')
  }

  // 确保items是数组
  if (res.data && res.data.items && !Array.isArray(res.data.items)) {
    res.data.items = []
  }

  return res
}

// 新增喂养记录
export const addFeedingRecordReq = async (
  baby_id: string,
  data: FeedingRecordRequest
): Promise<ApiResponse> => {
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
  )) as unknown as ApiResponse
  return res
}

// 修改喂养记录
export const updateFeedingRecordReq = async (
  baby_id: string,
  feeding_id: string,
  data: FeedingRecordRequest
): Promise<ApiResponse> => {
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
  const res = (await request.put(
    `/baby/${baby_id}/daily/feeding/${feeding_id}`,
    transformedData
  )) as unknown as ApiResponse
  return res
}
