// 记录类型定义
export type RecordType = 'feeding' | 'sleep' | 'diaper'

// 记录数据结构
export interface RecordItem {
  id: string
  type: RecordType
  time: string
  details: string
  icon: string
  name: string
}

// 统计数据结构
export interface Statistics {
  feedingCount: number
  feedingVolume: number
  sleepCount: number
  sleepDuration: number
  diaperCount: number
}
