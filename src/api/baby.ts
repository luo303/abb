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

export interface FetchBabiesResponse {
  babies: BabyBasicInfo[]
}

export const addBabyReq = (data: BabyData) => {
  return request.post('/baby/newBaby', data)
}

export const fetchBabiesReq = () => {
  return request.get('/baby/changeBaby')
}
