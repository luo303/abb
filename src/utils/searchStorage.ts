import AsyncStorage from '@react-native-async-storage/async-storage'

const SEARCH_HISTORY_KEY = 'searchHistory'
const MAX_HISTORY_ITEMS = 10

/**
 * 获取搜索历史
 */
export const getSearchHistory = async (): Promise<string[]> => {
  try {
    const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error('获取搜索历史失败:', error)
    return []
  }
}

/**
 * 保存搜索历史
 * @param keyword 搜索关键词
 */
export const saveSearchHistory = async (keyword: string): Promise<void> => {
  try {
    if (!keyword.trim()) return

    const history = await getSearchHistory()

    // 移除重复项
    const filteredHistory = history.filter((item: string) => item !== keyword)

    // 添加到顶部
    const updatedHistory = [keyword, ...filteredHistory]

    // 限制数量
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS)

    await AsyncStorage.setItem(
      SEARCH_HISTORY_KEY,
      JSON.stringify(limitedHistory)
    )
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

/**
 * 清空搜索历史
 */
export const clearSearchHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY)
  } catch (error) {
    console.error('清空搜索历史失败:', error)
  }
}

/**
 * 删除单个搜索历史
 * @param keyword 要删除的关键词
 */
export const removeSearchHistoryItem = async (
  keyword: string
): Promise<void> => {
  try {
    const history = await getSearchHistory()
    const updatedHistory = history.filter((item: string) => item !== keyword)
    await AsyncStorage.setItem(
      SEARCH_HISTORY_KEY,
      JSON.stringify(updatedHistory)
    )
  } catch (error) {
    console.error('删除搜索历史失败:', error)
  }
}
