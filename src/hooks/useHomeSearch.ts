import { useState, useCallback } from 'react'
import { searchPosts } from '../api/post'
import { PostItem } from '../types/home'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../types/navigation'

type SearchOutcome =
  | { status: 'reset' }
  | { status: 'redirect' }
  | { status: 'error'; message: string }
  | { status: 'success'; count: number }

export function useHomeSearch() {
  const navigation = useNavigation<NavigationProps>()
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<PostItem[]>([])
  const [searchPage, setSearchPage] = useState(1)
  const [searchHasMore, setSearchHasMore] = useState(true)
  const [searchError, setSearchError] = useState<string | null>(null)

  // 搜索处理函数
  const handleSearch = useCallback(
    async (text: string): Promise<SearchOutcome> => {
      const keyword = text.trim()

      // 当搜索框内容为空时，重置搜索状态并切回首页推荐列表
      if (!keyword) {
        setSearchText('')
        setSearchLoading(false)
        setSearchPage(1)
        setSearchResults([])
        setSearchHasMore(true)
        setSearchError(null)
        return { status: 'reset' }
      }

      // 增加请求锁，防止重叠请求
      if (searchLoading) {
        return { status: 'error', message: '正在搜索中，请稍后再试' }
      }

      setSearchText(keyword)
      setSearchLoading(true)
      setSearchPage(1)
      // 修复分页重置逻辑：先设置 has_more 为 false，防止列表为空时自动触发 onEndReached
      setSearchHasMore(false)
      setSearchResults([])
      setSearchError(null)

      try {
        // 传递正确的参数给 searchPosts 函数
        const response = await searchPosts(keyword, 1, 10, undefined, 'time')

        // 处理错误情况
        if (response.code === -1 || response.message.includes('用户不存在')) {
          // 跳转到登录页前清空所有搜索状态
          setSearchText('')
          setSearchLoading(false)
          setSearchPage(1)
          setSearchResults([])
          setSearchHasMore(true)
          setSearchError(null)
          // 跳转到登录页
          navigation.navigate('Login')
          return { status: 'redirect' }
        }

        // 放宽 Response 校验，同时兼容 code: 0 和 200
        if ((response.code === 200 || response.code === 0) && response.data) {
          const items = response.data.items || []
          setSearchResults(items)
          // 如果没有结果，直接设置 has_more 为 false，防止无限加载
          setSearchHasMore(
            items.length > 0 && (response.data.has_more || false)
          )
          return { status: 'success', count: items.length }
        }

        setSearchError('搜索服务暂不可用，请稍后再试')
        return { status: 'error', message: '搜索服务暂不可用，请稍后再试' }
      } catch (error) {
        console.error('Search failed:', error)
        setSearchError('网络异常，请稍后再试')
        return { status: 'error', message: '网络异常，请稍后再试' }
      } finally {
        setSearchLoading(false)
      }
    },
    [navigation, searchLoading]
  )

  // 加载更多搜索结果
  const loadMoreSearchResults = useCallback(async () => {
    if (!searchText.trim() || searchLoading || !searchHasMore) return

    setSearchLoading(true)
    setSearchError(null)
    try {
      const nextPage = searchPage + 1
      // 传递正确的参数给 searchPosts 函数
      const response = await searchPosts(
        searchText,
        nextPage,
        10,
        undefined,
        'time'
      )

      // 放宽 Response 校验，同时兼容 code: 0 和 200
      if ((response.code === 200 || response.code === 0) && response.data) {
        const items = response.data.items || []
        setSearchResults(prev => [...prev, ...items])
        // 如果没有更多结果，设置 has_more 为 false
        setSearchHasMore(items.length > 0 && (response.data.has_more || false))
        setSearchPage(nextPage)
        return
      }

      setSearchError('加载更多失败，请稍后再试')
    } catch (error) {
      console.error('Load more search results failed:', error)
      setSearchError('加载更多失败，请稍后再试')
    } finally {
      setSearchLoading(false)
    }
  }, [searchText, searchLoading, searchHasMore, searchPage])

  // 重置搜索状态
  const resetSearch = useCallback(() => {
    setSearchText('')
    setSearchLoading(false)
    setSearchPage(1)
    setSearchResults([])
    setSearchHasMore(true)
    setSearchError(null)
  }, [])

  return {
    searchText,
    searchLoading,
    searchError,
    searchResults,
    searchHasMore,
    handleSearch,
    loadMoreSearchResults,
    resetSearch
  }
}
