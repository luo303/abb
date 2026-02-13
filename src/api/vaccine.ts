import request from '../utils/request'

export interface VaccineItem {
  vaccine_id: string
  name: string
  disease: string
  due_time: number
  status: 'all' | 'given' | 'not_given'
  actual_time: number
  dose_id: string
  dose_number: number
}

export interface GetVaccineListResponse {
  items: VaccineItem[]
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export interface ChangeVaccineStatusData {
  baby_id: string
  dose_id: string
  status: 'given' | 'not_given'
  actual_time: number
}

export const changeVaccineStatusReq = (data: ChangeVaccineStatusData) => {
  return request.put('/baby/vaccine/changeStatus', data) as Promise<
    ApiResponse<{ message: string }>
  >
}

export const getVaccineListReq = (baby_id: string, status?: string) => {
  return request.get('/baby/vaccine/getVaccineList', {
    params: {
      baby_id,
      status
    }
  }) as Promise<ApiResponse<GetVaccineListResponse>>
}
