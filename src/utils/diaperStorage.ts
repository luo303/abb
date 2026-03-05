import AsyncStorage from '@react-native-async-storage/async-storage'
import { DiaperItem } from '../types/diaper'

const STORAGE_KEY_PREFIX = 'diaper_records_'

/**
 * 保存尿布记录到本地存储
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @param records 尿布记录列表
 */
export const saveDiaperRecords = async (
  babyId: string,
  date: string,
  records: DiaperItem[]
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = JSON.stringify(records)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (error) {
    console.error('保存尿布记录到本地存储失败:', error)
  }
}

/**
 * 从本地存储获取尿布记录
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @returns 尿布记录列表，无数据时返回空数组
 */
export const getDiaperRecords = async (
  babyId: string,
  date: string
): Promise<DiaperItem[]> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue !== null ? JSON.parse(jsonValue) : []
  } catch (error) {
    console.error('从本地存储获取尿布记录失败:', error)
    return []
  }
}

/**
 * 清除指定日期的尿布记录
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 */
export const clearDiaperRecords = async (
  babyId: string,
  date: string
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error('清除本地存储的尿布记录失败:', error)
  }
}

/**
 * 清除过期的尿布记录
 * @param babyId 宝宝ID
 * @param daysToKeep 保留天数，默认为30天
 */
export const clearExpiredDiaperRecords = async (
  babyId: string,
  daysToKeep: number = 30
): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const diaperKeys = keys.filter(key =>
      key.startsWith(`${STORAGE_KEY_PREFIX}${babyId}_`)
    )

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const expiredKeys = diaperKeys.filter(key => {
      const dateStr = key.replace(`${STORAGE_KEY_PREFIX}${babyId}_`, '')
      const recordDate = new Date(dateStr)
      return recordDate < cutoffDate
    })

    if (expiredKeys.length > 0) {
      await AsyncStorage.multiRemove(expiredKeys)
    }
  } catch (error) {
    console.error('清除过期尿布记录失败:', error)
  }
}
