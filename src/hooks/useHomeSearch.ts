import { useState, useCallback } from 'react'
import { searchPosts } from '../api/post'
import { PostItem } from '../types/home'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../types/navigation'

export function useHomeSearch() {
  const navigation = useNavigation<NavigationProps>()
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<PostItem[]>([])
  const [searchPage, setSearchPage] = useState(1)
  const [searchHasMore, setSearchHasMore] = useState(true)

  // 搜索处理函数
  const handleSearch = useCallback(
    async (text: string) => {
      const keyword = text.trim()

      // 当搜索框内容为空时，重置搜索状态并切回首页推荐列表
      if (!keyword) {
        setSearchText('')
        setSearchLoading(false)
        setSearchPage(1)
        setSearchResults([])
        setSearchHasMore(true)
        return
      }

      // 增加请求锁，防止重叠请求
      if (searchLoading) return

      setSearchText(keyword)
      setSearchLoading(true)
      setSearchPage(1)
      // 修复分页重置逻辑：先设置 has_more 为 false，防止列表为空时自动触发 onEndReached
      setSearchHasMore(false)
      setSearchResults([])

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
          // 跳转到登录页
          navigation.navigate('Login')
          return
        }

        // 放宽 Response 校验，同时兼容 code: 0 和 200
        if ((response.code === 200 || response.code === 0) && response.data) {
          const items = response.data.items || []
          setSearchResults(items)
          // 如果没有结果，直接设置 has_more 为 false，防止无限加载
          setSearchHasMore(
            items.length > 0 && (response.data.has_more || false)
          )
        }
      } catch (error) {
        console.error('Search failed:', error)
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
      }
    } catch (error) {
      console.error('Load more search results failed:', error)
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
  }, [])

  return {
    searchText,
    searchLoading,
    searchResults,
    searchHasMore,
    handleSearch,
    loadMoreSearchResults,
    resetSearch
  }
}
