export enum FeedType {
  FORMULA = 'formula',
  BREAST = 'breast',
  PUMP = 'pump',
  FOOD = 'food'
}

export enum FeedSide {
  LEFT = 'left',
  RIGHT = 'right',
  BOTH = 'both'
}

export interface FeedingItem {
  feed_id: string
  baby_id: string
  feed_type: FeedType
  start_time: number
  amount?: number
  side?: FeedSide
  duration?: number
  remark?: string
  summary_text?: string
}

export interface FeedingRecordRequest {
  feed_type: FeedType
  start_time: number
  amount?: number
  side?: FeedSide
  duration?: number
  remark?: string
  summary_text?: string
}
