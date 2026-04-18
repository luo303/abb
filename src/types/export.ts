// 导出相关类型定义

export type ExportType = 'pdf' | 'excel' | 'image'
export type RecordType =
  | 'growth'
  | 'vaccine'
  | 'feeding'
  | 'daily'
  | 'ai_growth_report'

export interface ExportOptions {
  type: ExportType
  recordType: RecordType
  dateRange?: { start: string; end: string }
  includeCharts?: boolean
  includeStatistics?: boolean
}

export interface ExportResult {
  success: boolean
  filePath?: string
  fileName?: string
  error?: string
}

export interface GrowthExportData {
  babyInfo: {
    name: string
    gender: string
    birthday: number
  }
  heightData: {
    time: number
    value: number
  }[]
  weightData: {
    time: number
    value: number
  }[]
  headData: {
    time: number
    value: number
  }[]
  viewRef?: any // 用于图片导出
}

export interface VaccineExportData {
  babyInfo: {
    name: string
    gender: string
    birthday: number
  }
  vaccines: {
    vaccine_id: string
    name: string
    disease: string
    due_time: number
    status: 'given' | 'not_given'
    actual_time: number
    dose_id: string
    dose_number: number
  }[]
  viewRef?: any // 用于图片导出
}

export interface FeedingExportData {
  babyInfo: {
    name: string
    gender: string
    birthday: number
  }
  feedingRecords: {
    feeding_id: string
    feed_type: 'formula' | 'breast' | 'pump' | 'food'
    feed_time: number
    amount?: number
    duration?: number
    remark?: string
  }[]
  viewRef?: any // 用于图片导出
}

export interface DailyExportData {
  babyId: string
  date: string
  records: {
    id: string
    type: 'feeding' | 'sleep' | 'diaper'
    time: number | string
    details: string
    icon: string
    name: string
    title: string
    description: string
    remark?: string
    data?: any
  }[]
  statistics: {
    feedingCount: number
    feedingVolume: number
    sleepCount: number
    sleepDuration: number
    diaperCount: number
  }
  viewRef?: any // 用于图片导出
}

export interface AIGrowthReportExportData {
  babyInfo: {
    name: string
    gender: string
    birthday: number
  }
  range: {
    from?: number
    to?: number
    days: number
  }
  language: 'zh' | 'en'
  markdown: string
  items: {
    time: number
    height?: number
    weight?: number
    head_circumference?: number
    remark?: string
  }[]
}

export type ExportData =
  | GrowthExportData
  | VaccineExportData
  | FeedingExportData
  | DailyExportData
  | AIGrowthReportExportData
