import request from '../utils/request'
import { SleepSession, SleepRecord } from '../types/sleep'

/**
 * 开启睡眠记录
 * @param babyId 宝宝ID
 * @returns 睡眠会话信息
 */
export const startSleep = async (babyId: string): Promise<SleepSession> => {
  const response = await request.post(`/baby/${babyId}/daily/sleep/start`)
  console.log('startSleep原始response:', JSON.stringify(response))
  const data = response.data as unknown as SleepSession
  // 确保返回的时间戳是毫秒级的
  if (typeof data.started_at === 'number') {
    data.started_at = data.started_at * 1000
  }
  return data
}

/**
 * 查询当前睡眠状态
 * @param babyId 宝宝ID
 * @returns 睡眠会话信息
 */
export const getActiveSleep = async (babyId: string): Promise<SleepSession> => {
  const response = await request.get(`/baby/${babyId}/daily/sleep/active`)
  return response.data as unknown as SleepSession
}

/**
 * 结束睡眠记录
 * @param babyId 宝宝ID
 * @param session_id 睡眠会话ID
 * @returns 完整的睡眠记录
 */
export const endSleep = async (
  babyId: string,
  session_id: string
): Promise<SleepRecord> => {
  const response = await request.post(`/baby/${babyId}/daily/sleep/stop`, {
    session_id
  })
  return response.data as unknown as SleepRecord
}

/**
 * 根据日期获取睡眠记录列表
 * @param babyId 宝宝ID
 * @param date 日期，格式为 "YYYY-MM-DD"
 * @returns 睡眠记录数组
 */
export const getSleepByDate = async (
  babyId: string,
  date: string
): Promise<SleepRecord[]> => {
  const formattedDate = date.replace(/-/g, '')

  const response = await request.get(`/baby/${babyId}/daily/sleep/byDate`, {
    params: { date: formattedDate }
  })
  console.log('getSleepByDate response:', JSON.stringify(response))
  console.log('items:', JSON.stringify(response.data?.items))

  // 确保返回的时间戳是毫秒级的
  const items = response.data?.items || []
  return items.map((item: any) => {
    console.log('Original sleep item:', JSON.stringify(item))
    const startedAt = typeof item.started_at === 'number' ? item.started_at : 0
    const endedAt = typeof item.ended_at === 'number' ? item.ended_at : 0

    // 检查时间戳是否已经是毫秒级（大于1天的毫秒数）
    const isStartedAtMs = startedAt > 86400000
    const isEndedAtMs = endedAt > 86400000

    console.log('Sleep timestamp info:', {
      originalStartedAt: startedAt,
      originalEndedAt: endedAt,
      isStartedAtMs,
      isEndedAtMs
    })

    return {
      ...item,
      started_at: isStartedAtMs ? startedAt : startedAt * 1000,
      ended_at: isEndedAtMs ? endedAt : endedAt * 1000
    }
  })
}
