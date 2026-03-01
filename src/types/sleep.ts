// 开启睡眠返回的数据
export interface SleepSession {
  session_id: string
  started_at: number // 时间戳，毫秒
}

// 结束睡眠 & 列表单条记录
export interface SleepRecord {
  session_id: string
  started_at: number // 时间戳，毫秒
  ended_at: number // 时间戳，毫秒
  duration_ms: number // 睡眠时长，毫秒
}

// 本地缓存正在进行的计时（存 AsyncStorage）
export interface OngoingTimer {
  session_id: string
  started_at: number // 时间戳，毫秒
}
