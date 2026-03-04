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
  const res = await request.get<FeedingListResponse>(
    `/baby/${baby_id}/daily/feeding/byDate`,
    {
      params: {
        date
      }
    }
  )
  return res
}

// 新增喂养记录
export const addFeedingRecordReq = async (
  baby_id: string,
  data: FeedingRecordRequest
): Promise<ApiResponse> => {
  const res = await request.post<ApiResponse>(
    `/baby/${baby_id}/daily/feeding`,
    data
  )
  return res
}

// 修改喂养记录
export const updateFeedingRecordReq = async (
  baby_id: string,
  feeding_id: string,
  data: FeedingRecordRequest
): Promise<ApiResponse> => {
  const res = await request.put<ApiResponse>(
    `/baby/${baby_id}/daily/feeding/${feeding_id}`,
    data
  )
  return res
}
