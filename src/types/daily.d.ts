// 日常记录统计信息类型定义

// 顶部统计与混合列表项
export interface DailySummaryItem {
  id: string
  type: 'feeding' | 'sleep' | 'diaper'
  sub_type: string
  time: number
  duration_ms?: number // 仅限睡眠
}

// 顶部统计响应
export interface DailyStatisticsResponse {
  feeding_count: number
  sleep_duration_ms: number
  diaper_count: number
  items: DailySummaryItem[]
}

// 喂养统计信息
export interface FeedingStatistics {
  totalAmount?: number // 总奶量
  totalCount: number // 总次数
  lastTime?: number // 最后喂养时间
}

// 睡眠统计信息
export interface SleepStatistics {
  totalDuration: number // 总睡眠时长（毫秒）
  totalCount: number // 总次数
  lastTime?: number // 最后睡眠时间
}

//  diaper统计信息
export interface DiaperStatistics {
  totalCount: number // 总次数
  peeCount: number // 小便次数
  poopCount: number // 大便次数
  lastTime?: number // 最后diaper时间
}

// 当日统计信息
export interface DailyStatistics {
  feeding: FeedingStatistics
  sleep: SleepStatistics
  diaper: DiaperStatistics
  date: string // 统计日期
}
