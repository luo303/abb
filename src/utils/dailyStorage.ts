import AsyncStorage from '@react-native-async-storage/async-storage'
import { DailyStatistics } from '../types/daily'

const STORAGE_KEY_PREFIX = 'daily_stats_'

/**
 * 保存日常统计信息到本地存储
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @param statistics 日常统计信息
 */
export const saveDailyStatistics = async (
  babyId: string,
  date: string,
  statistics: DailyStatistics
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = JSON.stringify(statistics)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (error) {
    console.error('保存日常统计信息到本地存储失败:', error)
  }
}

/**
 * 从本地存储获取日常统计信息
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @returns 日常统计信息，无数据时返回null
 */
export const getDailyStatistics = async (
  babyId: string,
  date: string
): Promise<DailyStatistics | null> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue !== null ? JSON.parse(jsonValue) : null
  } catch (error) {
    console.error('从本地存储获取日常统计信息失败:', error)
    return null
  }
}

/**
 * 清除指定日期的日常统计信息
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 */
export const clearDailyStatistics = async (
  babyId: string,
  date: string
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error('清除本地存储的日常统计信息失败:', error)
  }
}

/**
 * 清除过期的日常统计信息
 * @param babyId 宝宝ID
 * @param daysToKeep 保留天数，默认为30天
 */
export const clearExpiredDailyStatistics = async (
  babyId: string,
  daysToKeep: number = 30
): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const dailyStatsKeys = keys.filter(key =>
      key.startsWith(`${STORAGE_KEY_PREFIX}${babyId}_`)
    )

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const expiredKeys = dailyStatsKeys.filter(key => {
      const dateStr = key.replace(`${STORAGE_KEY_PREFIX}${babyId}_`, '')
      const recordDate = new Date(dateStr)
      return recordDate < cutoffDate
    })

    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys)
    }
  } catch (error) {
    console.error('清除过期日常统计信息失败:', error)
  }
}
