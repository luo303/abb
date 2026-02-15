import { useState, useCallback, useRef, useEffect } from 'react'
import { PostItem } from '../types/home'
import { getHomePosts } from '../api/home'

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

        if (newItems.length > 0) {
          setPosts(prevPosts => {
            // 过滤重复数据
            const existingIds = new Set(prevPosts.map(p => p.post_id))
            const uniqueNewItems = newItems.filter(
              p => !existingIds.has(p.post_id)
            )
            return [...prevPosts, ...uniqueNewItems]
          })
          setHasMore(response.data.has_more ?? false)
          setPage(nextPage)
        } else {
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
  }, [isLoadingMore, hasMore, page])

  return {
    posts,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    refresh,
    loadMore
  }
}
