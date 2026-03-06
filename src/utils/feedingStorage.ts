import AsyncStorage from '@react-native-async-storage/async-storage'
import { FeedingItem } from '../types/feeding'

const STORAGE_KEY_PREFIX = 'feeding_records_'

/**
 * 保存喂养记录到本地存储
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @param records 喂养记录列表
 */
export const saveFeedingRecords = async (
  babyId: string,
  date: string,
  records: FeedingItem[]
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = JSON.stringify(records)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (e) {
    console.error('保存喂养记录失败:', e)
  }
}

/**
 * 从本地存储获取喂养记录
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 * @returns 喂养记录列表，无数据时返回空数组
 */
export const getFeedingRecords = async (
  babyId: string,
  date: string
): Promise<FeedingItem[]> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    const jsonValue = await AsyncStorage.getItem(key)
    return jsonValue !== null ? JSON.parse(jsonValue) : []
  } catch (e) {
    console.error('获取喂养记录失败:', e)
    return []
  }
}

/**
 * 清除指定日期的喂养记录
 * @param babyId 宝宝ID
 * @param date 日期，格式为 YYYY-MM-DD
 */
export const clearFeedingRecords = async (
  babyId: string,
  date: string
): Promise<void> => {
  try {
    const key = `${STORAGE_KEY_PREFIX}${babyId}_${date}`
    await AsyncStorage.removeItem(key)
  } catch (e) {
    console.error('清除喂养记录失败:', e)
  }
}

/**
 * 清除所有喂养记录
 * @param babyId 宝宝ID
 */
export const clearAllFeedingRecords = async (babyId: string): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const feedingKeys = keys.filter(key =>
      key.startsWith(`${STORAGE_KEY_PREFIX}${babyId}_`)
    )
    await AsyncStorage.multiRemove(feedingKeys)
  } catch (e) {
    console.error('清除所有喂养记录失败:', e)
  }
}
