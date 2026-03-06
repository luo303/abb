// 日常统计信息类型
export interface DailyStatistics {
  feeding: {
    totalCount: number
    lastTime?: number
  }
  sleep: {
    totalDuration: number
    totalCount: number
    lastTime?: number
  }
  diaper: {
    totalCount: number
    peeCount: number
    poopCount: number
    lastTime?: number
  }
  date: string
}

// 日常记录项类型
export interface DailyRecordItem {
  id: string
  type: 'feeding' | 'diaper' | 'sleep'
  sub_type: string
  time: number
  duration_ms?: number
}
