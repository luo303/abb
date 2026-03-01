import AsyncStorage from '@react-native-async-storage/async-storage'
import { OngoingTimer } from '../types/sleep'

const STORAGE_KEY = 'sleep_ongoing_timer'

/**
 * 保存正在进行的睡眠计时
 * @param timer 计时信息
 */
export const saveOngoingTimer = async (timer: OngoingTimer): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(timer)
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue)
  } catch (e) {
    console.error('保存睡眠计时失败:', e)
  }
}

/**
 * 获取正在进行的睡眠计时
 * @returns 计时信息，无数据时返回 null
 */
export const getOngoingTimer = async (): Promise<OngoingTimer | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY)
    return jsonValue !== null ? JSON.parse(jsonValue) : null
  } catch (e) {
    console.error('获取睡眠计时失败:', e)
    return null
  }
}

/**
 * 清除正在进行的睡眠计时
 */
export const clearOngoingTimer = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('清除睡眠计时失败:', e)
  }
}
