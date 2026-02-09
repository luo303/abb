export type VaccineStatus = 'pending' | 'completed'

export interface Vaccine {
  id: string
  name: string
  description: string
  status: VaccineStatus
  vaccinationDate?: string // 接种时间
  recommendedDate: string // 推荐接种时间
  detail: string // 接种详情
  dose?: string // 第几剂，可选
}
