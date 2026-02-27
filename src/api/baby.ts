import request from '../utils/request'

export interface BabyData {
  name: string
  gender: string
  birthday: number
  avatar?: string
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
