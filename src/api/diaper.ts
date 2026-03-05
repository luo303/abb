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
  // 转换日期格式为YYYYMMDD
  const formattedDate = date.replace(/-/g, '')

  const res = await request.get(`/baby/${baby_id}/daily/diaper/byDate/list`, {
    params: {
      date: formattedDate
    }
  })

  // 确保items是数组
  const typedRes = res as unknown as DiaperListResponse
  if (
    typedRes.data &&
    typedRes.data.items &&
    !Array.isArray(typedRes.data.items)
  ) {
    typedRes.data.items = []
  }

  return typedRes
}

// 新增记录
export const addDiaperRecordReq = async (
  baby_id: string,
  data: DiaperRecordRequest
): Promise<ApiResponse> => {
  const res = await request.post(`/baby/${baby_id}/daily/diaper`, data)
  return res as unknown as ApiResponse
}

// 修改记录
export const updateDiaperRecordReq = async (
  baby_id: string,
  diaper_id: string,
  data: DiaperRecordRequest
): Promise<ApiResponse> => {
  const res = await request.put(
    `/baby/${baby_id}/daily/diaper/${diaper_id}`,
    data
  )
  return res as unknown as ApiResponse
}

// 获取单条记录详情
export const getDiaperDetailReq = async (
  baby_id: string,
  diaper_id: string
): Promise<DiaperDetailResponse> => {
  const res = await request.get(`/baby/${baby_id}/daily/diaper/${diaper_id}`)
  return res as unknown as DiaperDetailResponse
}

// 删除记录
export const deleteDiaperRecordReq = async (
  baby_id: string,
  diaper_id: string
): Promise<ApiResponse> => {
  const res = await request.delete(`/baby/${baby_id}/daily/diaper/${diaper_id}`)
  return res as unknown as ApiResponse
}
