import request from '../utils/request'

export interface UpdateProfilePayload {
  occupation?: string
  phone?: string
  province?: string
  city?: string
  birthday?: string
  gender?: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface UpdateProfileResponse {
  message: string
}

export const updateProfileReq = (data: UpdateProfilePayload) => {
  return request.put('/user/profile', data)
}

export interface UserMeResponse {
  user_id?: string
  account?: string
  email?: string
  username?: string
  gender?: string
  avatar?: string
  phone?: string
  occupation?: string
  birthday?: number
  province?: string
  city?: string
  ctime?: number
  utime?: number
  partner_id?: string
  baby_age_text?: string
}

export const getUserMeReq = () => {
  return request.get('/user/me')
}

export interface UpdateAvatarPayload {
  avatar: string
}

export interface UpdateAvatarResponse {
  message: string
}

export const updateAvatarReq = (data: UpdateAvatarPayload) => {
  return request.put('/user/avatar', data)
}
