export type VaccineStatus = 'pending' | 'completed'

export interface Vaccine {
  id: string
  name: string
  description: string
  status: VaccineStatus
  vaccinationDate?: number // 接种时间 (timestamp)
  recommendedDate: number // 推荐接种时间 (timestamp)
  detail: string // 接种详情
  dose?: string // 第几剂，可选
}
