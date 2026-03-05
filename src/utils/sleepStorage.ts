import AsyncStorage from '@react-native-async-storage/async-storage'
import { SleepRecord } from '../types/sleep'

interface OngoingTimer {
  session_id: string
  started_at: number
}

const STORAGE_KEY_PREFIX = 'sleep_records_'

/**
 * 保存睡眠记录到本地存储
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @param records 睡眠记录列表
 */
export const saveSleepRecords = async (
  babyId: string,
  date: string,
  records: SleepRecord[]
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = JSON.stringify(records)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (error) {
    console.error('保存睡眠记录到本地存储失败:', error)
  }
}

/**
 * 从本地存储获取睡眠记录
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @returns 睡眠记录列表，无数据时返回空数组
 */
export const getSleepRecords = async (
  babyId: string,
  date: string
): Promise<SleepRecord[]> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue !== null ? JSON.parse(jsonValue) : []
  } catch (error) {
    console.error('从本地存储获取睡眠记录失败:', error)
    return []
  }
}

/**
 * 清除指定日期的睡眠记录
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 */
export const clearSleepRecords = async (
  babyId: string,
  date: string
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error('清除本地存储的睡眠记录失败:', error)
  }
}

/**
 * 清除过期的睡眠记录
 * @param babyId 宝宝ID
 * @param daysToKeep 保留天数，默认为30天
 */
export const clearExpiredSleepRecords = async (
  babyId: string,
  daysToKeep: number = 30
): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const sleepKeys = keys.filter(key =>
      key.startsWith(`${STORAGE_KEY_PREFIX}${babyId}_`)
    )

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const expiredKeys = sleepKeys.filter(key => {
      const dateStr = key.replace(`${STORAGE_KEY_PREFIX}${babyId}_`, '')
      const recordDate = new Date(dateStr)
      return recordDate < cutoffDate
    })

    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys)
    }
  } catch (error) {
    console.error('清除过期睡眠记录失败:', error)
  }
}

const ONGOING_TIMER_KEY = 'sleep_ongoing_timer'

/**
 * 保存正在进行的睡眠计时
 * @param timer 正在进行的计时器信息
 */
export const saveOngoingTimer = async (timer: OngoingTimer): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(timer)
    await AsyncStorage.setItem(ONGOING_TIMER_KEY, jsonValue)
  } catch (error) {
    console.error('保存正在进行的睡眠计时失败:', error)
  }
}

/**
 * 获取正在进行的睡眠计时
 * @returns 正在进行的计时器信息，无数据时返回null
 */
export const getOngoingTimer = async (): Promise<OngoingTimer | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ONGOING_TIMER_KEY)
    return jsonValue !== null ? JSON.parse(jsonValue) : null
  } catch (error) {
    console.error('获取正在进行的睡眠计时失败:', error)
    return null
  }
}

/**
 * 清除正在进行的睡眠计时
 */
export const clearOngoingTimer = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONGOING_TIMER_KEY)
  } catch (error) {
    console.error('清除正在进行的睡眠计时失败:', error)
  }
}
