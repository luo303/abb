// 记录类型定义
export type RecordType = 'feeding' | 'sleep' | 'diaper'

// 记录数据结构
export interface RecordItem {
  id: string
  type: RecordType
  time: string | number
  details: string
  icon: string
  name: string
  title?: string
  description?: string
  remark?: string
  primaryDetail?: string
  secondaryDetail?: string
  categoryLabel?: string
  tags?: string[]
}

// 统计数据结构
export interface Statistics {
  feedingCount: number
  feedingVolume: number
  sleepCount: number
  sleepDuration: number
  diaperCount: number
}
