import request from '../utils/request'
import { DiaperItem, DiaperRecordRequest } from '../types/diaper'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface DiaperListResponse {
  code: number
  message: string
  data?: {
    items: DiaperItem[]
  }
}

export interface DiaperDetailResponse {
  code: number
  message: string
  data?: DiaperItem
}

// 获取单日记录列表
export const getDiaperListByDateReq = async (
  baby_id: string,
  date: string
): Promise<DiaperListResponse> => {
  const res = await request.get<DiaperListResponse>(
    `/baby/${baby_id}/daily/diaper/byDate/list`,
    {
      params: {
        date
      }
    }
  )
  return res.data
}

// 新增记录
export const addDiaperRecordReq = async (
  baby_id: string,
  data: DiaperRecordRequest
): Promise<ApiResponse> => {
  const res = await request.post<ApiResponse>(
    `/baby/${baby_id}/daily/diaper`,
    data
  )
  return res.data
}

// 修改记录
export const updateDiaperRecordReq = async (
  baby_id: string,
  diaper_id: string,
  data: DiaperRecordRequest
): Promise<ApiResponse> => {
  const res = await request.put<ApiResponse>(
    `/baby/${baby_id}/daily/diaper/${diaper_id}`,
    data
  )
  return res.data
}

// 获取单条记录详情
export const getDiaperDetailReq = async (
  baby_id: string,
  diaper_id: string
): Promise<DiaperDetailResponse> => {
  const res = await request.get<DiaperDetailResponse>(
    `/baby/${baby_id}/daily/diaper/${diaper_id}`
  )
  return res.data
}

// 删除记录
export const deleteDiaperRecordReq = async (
  baby_id: string,
  diaper_id: string
): Promise<ApiResponse> => {
  const res = await request.delete<ApiResponse>(
    `/baby/${baby_id}/daily/diaper/${diaper_id}`
  )
  return res.data
}
