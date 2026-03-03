import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'follow_following_ids'

/**
 * 保存关注用户ID列表
 * @param followingIds 关注用户ID数组
 */
export const saveFollowingIds = async (
  followingIds: string[]
): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(followingIds)
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue)
  } catch (e) {
    console.error('保存关注列表失败:', e)
  }
}

/**
 * 获取关注用户ID列表
 * @returns 关注用户ID数组，无数据时返回空数组
 */
export const getFollowingIds = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY)
    return jsonValue !== null ? JSON.parse(jsonValue) : []
  } catch (e) {
    console.error('获取关注列表失败:', e)
    return []
  }
}

/**
 * 清除关注用户ID列表
 */
export const clearFollowingIds = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('清除关注列表失败:', e)
  }
}
