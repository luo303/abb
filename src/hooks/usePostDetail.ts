import { useState, useEffect, useCallback } from 'react'
import { getPostDetail } from '@/api/home'
import { PostItem } from '@/types/home'
import { useMessage } from '@/components/Message'

export interface UsePostDetailReturn {
  post: PostItem | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  updateLocalPost: (updates: Partial<PostItem>) => void
}

export function usePostDetail(id: string): UsePostDetailReturn {
  const [post, setPost] = useState<PostItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { showMessage } = useMessage()

  const fetchPostDetail = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await getPostDetail(id)
      const postData = response?.data?.post

      // 宽松的成功条件：只要有数据，或者 code 是明确的成功码
      const hasData = !!postData
      const isSuccessCode =
        response && (response.code === 200 || response.code === 0)

      if (hasData || isSuccessCode) {
        if (postData) {
          setPost(postData)
        } else {
          // 只有在既没有数据，又是成功码的情况下，才抛出数据为空的错误
          throw new Error('Post data is empty')
        }
      } else {
        const msg = response?.message || '获取帖子详情失败'
        console.warn('Get post detail failed:', JSON.stringify(response))
        showMessage(msg)
        throw new Error(msg)
      }
    } catch (err) {
      console.error('Fetch post detail error:', err)
      setError(err as Error)
      showMessage('网络请求失败')
    } finally {
      setIsLoading(false)
    }
  }, [id, showMessage])

  useEffect(() => {
    fetchPostDetail()
  }, [fetchPostDetail])

  const updateLocalPost = useCallback((updates: Partial<PostItem>) => {
    setPost(prev => (prev ? { ...prev, ...updates } : null))
  }, [])

  return {
    post,
    isLoading,
    error,
    refresh: fetchPostDetail,
    updateLocalPost
  }
}
