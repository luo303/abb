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
  return response as unknown as SleepSession
}

/**
 * 查询当前睡眠状态
 * @param babyId 宝宝ID
 * @returns 睡眠会话信息
 */
export const getActiveSleep = async (babyId: string): Promise<SleepSession> => {
  const response = await request.get(`/baby/${babyId}/daily/sleep/active`)
  return response as unknown as SleepSession
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
  return response as unknown as SleepRecord
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
  const response = await request.get(`/baby/${babyId}/daily/sleep/byDate`, {
    params: { date }
  })
  return response.items as unknown as SleepRecord[]
}
