import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { PostItem } from '../types/home'
import { getHomePosts } from '../api/home'

// 从 content 中提取图片 URL 的函数
const extractImageUrls = (content: string): string[] => {
  // 正则表达式匹配指定的几种主流图片格式，包括被反引号包围的情况和带查询参数的情况
  const imgUrlRegex =
    /`?https?:\/\/(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>"']*\.(?:jpg|jpeg|png|webp|gif))(?:\?[^\s<>"']*)?`?/gi
  const matches = content.match(imgUrlRegex)

  if (!matches) return []

  // 去除可能的反引号包围并过滤掉明显无效的链接
  return matches
    .map(url => url.replace(/^`|`$/g, ''))
    .filter(url => {
      // 过滤掉明显无效的测试链接
      if (url.includes('extra-1.jpg') || url.includes('extra-2.jpg')) {
        return false
      }
      return true
    })
}

// 清洗 content 中的图片 URL，只保留纯文字
const cleanContent = (content: string): string => {
  // 使用相同的正则表达式匹配图片 URL，包括带查询参数的情况
  const imgUrlRegex =
    /`?https?:\/\/(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,}(?:\/[^\s<>"']*\.(?:jpg|jpeg|png|webp|gif))(?:\?[^\s<>"']*)?`?/gi
  // 将匹配到的 URL 替换为空字符串
  return content.replace(imgUrlRegex, '').trim()
}

interface UsePostListReturn {
  posts: PostItem[]
  page: number
  hasMore: boolean
  isLoading: boolean
  isLoadingMore: boolean
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

export function usePostList(): UsePostListReturn {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const isLoadingRef = useRef(false)

  const refresh = useCallback(async () => {
    if (isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoading(true)
    try {
      const response = await getHomePosts(1)

      if (!isMountedRef.current) return

      if (response && response.data && Array.isArray(response.data.items)) {
        setPosts(response.data.items)
        setPage(1)
        setHasMore(response.data.has_more ?? false)
      } else {
        setPosts([])
        setHasMore(false)
      }
    } catch (error) {
      console.error('Refresh posts failed:', error)
      if (isMountedRef.current) {
        setPosts([])
        setHasMore(false)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      isLoadingRef.current = false
    }
  }, [])

  // 初始化时自动加载数据
  useEffect(() => {
    refresh()
  }, [refresh])

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoadingRef.current) return

    isLoadingRef.current = true
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = await getHomePosts(nextPage)

      if (!isMountedRef.current) return

      if (response && response.data && Array.isArray(response.data.items)) {
        const newItems = response.data.items

        // 过滤重复数据
        const existingIds = new Set(posts.map(p => p.post_id))
        const uniqueNewItems = newItems.filter(p => !existingIds.has(p.post_id))

        if (uniqueNewItems.length > 0) {
          setPosts(prevPosts => [...prevPosts, ...uniqueNewItems])
          setHasMore(response.data.has_more ?? false)
          setPage(nextPage)
        } else {
          // 如果没有新数据，设置 hasMore 为 false，避免无限加载
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Load more posts failed:', error)
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMore(false)
      }
      isLoadingRef.current = false
    }
  }, [isLoadingMore, hasMore, page, posts])

  // 使用 useMemo 处理数据，为每个帖子添加 imageUrls 和 cleanedContent 属性
  const processedPosts = useMemo(() => {
    return posts.map(post => {
      const imageUrls = extractImageUrls(post.content)
      const cleanedContent = cleanContent(post.content)
      return {
        ...post,
        imageUrls,
        cleanedContent
      }
    })
  }, [posts])

  return {
    posts: processedPosts,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    refresh,
    loadMore
  }
}
