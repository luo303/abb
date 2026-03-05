import AsyncStorage from '@react-native-async-storage/async-storage'
import { DiaperItem } from '../types/diaper'

const DIAPER_RECORDS_KEY = 'diaper_records'

export const saveDiaperRecords = async (
  records: DiaperItem[]
): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(records)
    await AsyncStorage.setItem(DIAPER_RECORDS_KEY, jsonValue)
  } catch (error) {
    console.error('保存尿布记录到本地存储失败:', error)
  }
}

export const getDiaperRecords = async (): Promise<DiaperItem[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(DIAPER_RECORDS_KEY)
    return jsonValue !== null ? JSON.parse(jsonValue) : []
  } catch (error) {
    console.error('从本地存储获取尿布记录失败:', error)
    return []
  }
}

export const clearDiaperRecords = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DIAPER_RECORDS_KEY)
  } catch (error) {
    console.error('清除本地存储的尿布记录失败:', error)
  }
}
