import request from '../utils/request'

export interface BabyData {
  name: string
  gender: string
  birthday: number
  avatar: string
  height?: number
  weight?: number
  head_circumference?: number
  remark?: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface AddBabyResponse {
  baby_id: string
  message: string
}

export interface BabyBasicInfo {
  baby_id: string
  name: string
  avatar: string
}

export interface BabyProfile {
  baby_id: string
  name: string
  avatar: string
  gender: string
  birthday: number
  record_time: number
  height: number
  weight: number
  head_circumference: number
}

export interface FetchBabiesResponse {
  babies: BabyBasicInfo[]
}

export interface GrowthCurveParams {
  baby_id: string
  metric: 'weight' | 'height' | 'head_circumference'
  group_by?: 'day' | 'month'
  from?: string
  to?: string
}

export interface GrowthCurveItem {
  time: number
  value: number
}

export interface GrowthCurveResponse {
  metric: string
  unit: string
  items: GrowthCurveItem[]
}

export interface UpsertGrowthRecordParams {
  baby_id: string
  record_time: number
  height: number
  weight: number
  head_circumference: number
  remark: string
}

export interface UpsertGrowthRecordResponse {
  record_id: string
  message: string
}

export interface BabyPhotoItem {
  photo_id: string
  link: string
  ctime: number
}

export interface BabyPhotoListData {
  items: BabyPhotoItem[]
  page: number
  page_size: number
  has_more: boolean
}

export interface BabyPhotoListResponse {
  code: number
  message: string
  data?: BabyPhotoListData
}

export interface BabyPhotoUploadResponse {
  code: number
  message: string
  data?: {
    items: BabyPhotoItem[]
  }
}

export const addBabyReq = (data: BabyData) => {
  return request.post('/baby/newBaby', data)
}

export const fetchBabiesReq = () => {
  return request.get('/baby/changeBaby')
}

export const getBabyProfileReq = (baby_id: string) => {
  return request.get('/baby/profile', {
    params: {
      baby_id
    }
  })
}

export const getGrowthCurveReq = (params: GrowthCurveParams) => {
  console.log(params)

  return request.get('/baby/growthCurve', {
    params
  })
}

export const upsertGrowthRecordReq = (data: UpsertGrowthRecordParams) => {
  return request.post('/baby/growthRecords', data)
}

export const getBabyPhotoListReq = async (
  baby_id: string,
  page = 1,
  pageSize = 10
): Promise<BabyPhotoListResponse> => {
  const res = await request.get('/baby/photo/list', {
    params: {
      baby_id,
      page,
      page_size: pageSize
    }
  })
  return res as unknown as BabyPhotoListResponse
}

export const uploadBabyPhotosReq = async (
  baby_id: string,
  links: string[]
): Promise<BabyPhotoUploadResponse> => {
  const res = await request.post('/baby/photo/upload', {
    baby_id,
    links
  })
  return res as unknown as BabyPhotoUploadResponse
}
