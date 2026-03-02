import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { fetchPostList, loadMorePosts } from '@/store/modules/PostStore'
import { getUserMeReq, ApiResponse, UserMeResponse } from '../api/profile'
import { setUserInfo } from '../store/modules/userStore'
import {
  fetchBabies,
  fetchBabyProfile,
  loadCurrentBabyId
} from '../store/modules/BabyStore'
import { PostItem } from '../types/home'
import { getFollowingPosts } from '../api/follow'
import { useMessage } from '@/components/Message'

export function useHomeData() {
  const dispatch = useAppDispatch()
  const { postList, hasMore, isLoadingMore, page } = useAppSelector(
    state => state.post
  )
  const userInfo = useAppSelector(
    state => state.user.userInfo
  ) as UserMeResponse | null
  const babyState = useAppSelector(state => state.baby)

  const [refreshing, setRefreshing] = useState(false)
  const [localPosts, setLocalPosts] = useState<PostItem[]>([])
  const [activeTab, setActiveTab] = useState('推荐')
  const [followingPosts, setFollowingPosts] = useState<any[]>([])
  // 增加独立的状态控制
  const [followHasMore, setFollowHasMore] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [followPage, setFollowPage] = useState(1)

  const isMountedRef = useRef(true)
  const { showMessage } = useMessage()

  // 合并展示的数据
  const serverIds = new Set(
    activeTab === '关注'
      ? followingPosts.map(p => p.post_id)
      : postList.map(p => p.post_id)
  )
  const uniqueLocalPosts = localPosts.filter(p => !serverIds.has(p.post_id))
  const posts =
    activeTab === '关注'
      ? [...followingPosts, ...uniqueLocalPosts]
      : [...postList, ...uniqueLocalPosts]

  // 初始化时加载数据
  useEffect(() => {
    const loadData = async () => {
      if (activeTab === '关注') {
        try {
          setIsFollowLoading(true)
          const res = await getFollowingPosts(1, 10)
          // 增加容错处理：兼容 res.data.items 和 res.items
          const remoteData = res.data || res
          const items = remoteData.items || []
          const hasMoreFromApi = remoteData.has_more ?? false

          if (isMountedRef.current) {
            // 重置页码为 1
            setFollowPage(1)
            // 直接设置为新数据，不需要过滤重复，因为是重新加载第一页
            setFollowingPosts(items)
            setFollowHasMore(hasMoreFromApi) // 使用接口返回的真实分页状态
          }
        } catch (error) {
          console.error('获取关注帖子失败:', error)
          if (isMountedRef.current) {
            showMessage('获取关注帖子失败，请稍后重试')
          }
        } finally {
          if (isMountedRef.current) {
            setIsFollowLoading(false)
          }
        }
      } else {
        let strategy: string | undefined
        if (activeTab === '热门') {
          strategy = 'hot'
        } else if (activeTab === '推荐') {
          strategy = 'ctime'
        }
        dispatch(fetchPostList({ page: 1, strategy }))
      }
    }

    loadData()
  }, [dispatch, activeTab, showMessage])

  // 首次进入首页时获取一次用户信息（如果 Redux 中还没有）
  useEffect(() => {
    if (userInfo) return

    const fetchUserInfo = async () => {
      try {
        const res =
          (await getUserMeReq()) as unknown as ApiResponse<UserMeResponse>
        if (!isMountedRef.current) return
        if (res.code === 0 && res.data) {
          dispatch(setUserInfo(res.data))
        }
      } catch (error) {
        if (!isMountedRef.current) return
        console.error('获取用户信息失败：', error)
      }
    }

    fetchUserInfo()
  }, [dispatch, userInfo])

  // 获取宝宝信息
  useEffect(() => {
    if (babyState.currentBabyDetail) return
    if (!babyState.currentBabyId) {
      dispatch(loadCurrentBabyId())
    }
    if (babyState.currentBabyId) {
      dispatch(fetchBabyProfile(babyState.currentBabyId))
      return
    }
    dispatch(fetchBabies())
  }, [dispatch, babyState.currentBabyId, babyState.currentBabyDetail])

  // 下拉刷新处理函数
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (activeTab === '关注') {
        const res = await getFollowingPosts(1, 10)
        // 增加容错处理：兼容 res.data.items 和 res.items
        const remoteData = res.data || res
        const items = remoteData.items || []
        const hasMoreFromApi = remoteData.has_more ?? false

        if (isMountedRef.current) {
          // 重置页码为 1
          setFollowPage(1)
          setFollowingPosts(items)
          setFollowHasMore(hasMoreFromApi) // 使用接口返回的真实分页状态
        }
      } else {
        let strategy: string | undefined
        if (activeTab === '热门') {
          strategy = 'hot'
        } else if (activeTab === '推荐') {
          strategy = 'ctime'
        }
        await dispatch(fetchPostList({ page: 1, strategy })).unwrap()
      }
    } catch (error) {
      console.error('Refresh failed:', error)
      if (activeTab === '关注' && isMountedRef.current) {
        showMessage('刷新关注帖子失败，请稍后重试')
      }
    } finally {
      setRefreshing(false)
    }
  }, [dispatch, activeTab, showMessage])

  // 加载更多
  const loadMore = useCallback(async () => {
    // 优化加载锁：在 loadMore 开始时，先检查 isFollowLoading，如果为 true 直接 return
    if (activeTab === '关注' && isFollowLoading) {
      return
    }

    // 根据当前标签使用对应的状态，确保没有更多内容时不触发加载
    if (
      (activeTab === '关注' && !followHasMore) ||
      (activeTab !== '关注' && (isLoadingMore || !hasMore))
    ) {
      return
    }

    try {
      if (activeTab === '关注') {
        setIsFollowLoading(true)
        const nextPage = followPage + 1
        const res = await getFollowingPosts(nextPage, 10)

        // 检查响应状态
        if (res.code !== 0 && res.code !== 200) {
          throw new Error(res.message || '获取关注帖子失败')
        }

        // 增加容错处理：兼容 res.data.items 和 res.items
        const remoteData = res.data || res
        const items = remoteData.items || []
        const hasMoreFromApi = remoteData.has_more ?? false

        // 数据清洗：过滤有效项
        const validItems = items.filter(item => item && item.post_id)

        if (isMountedRef.current) {
          // 前置页码更新：立即执行 setFollowPage(nextPage)
          setFollowPage(nextPage)

          if (validItems.length > 0) {
            // 过滤重复数据，防止出现重复的 key
            setFollowingPosts(prev => {
              const existingIds = new Set(prev.map(p => p.post_id))
              const uniqueItems = validItems.filter(
                item => !existingIds.has(item.post_id)
              )
              return [...prev, ...uniqueItems]
            })
          }
          // 使用接口返回的真实分页状态，确保没有更多内容时停止加载
          setFollowHasMore(hasMoreFromApi)
        }
      } else {
        await dispatch(loadMorePosts({ page: page + 1 })).unwrap()
      }
    } catch (error) {
      // 增加日志：在 catch 块中打印出 res 的完整内容
      console.error('Load more failed:', error)
      if (activeTab === '关注' && isMountedRef.current) {
        showMessage('加载更多关注帖子失败，请稍后重试')
      }
    } finally {
      // 确保在关注标签时重置加载状态
      if (activeTab === '关注' && isMountedRef.current) {
        setIsFollowLoading(false)
      }
    }
  }, [
    dispatch,
    page,
    hasMore,
    isLoadingMore,
    activeTab,
    showMessage,
    isFollowLoading,
    followHasMore,
    followPage
  ])

  // 添加新帖子
  const addNewPost = useCallback((newPost: PostItem) => {
    setLocalPosts(prev => {
      const isDuplicate = prev.some(p => p.post_id === newPost.post_id)
      if (isDuplicate) return prev
      return [newPost, ...prev]
    })
  }, [])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    posts,
    // 关键：根据 activeTab 返回对应的 hasMore 状态
    hasMore: activeTab === '关注' ? followHasMore : hasMore,
    isLoadingMore: activeTab === '关注' ? isFollowLoading : isLoadingMore,
    refreshing,
    activeTab,
    setActiveTab,
    handleRefresh,
    loadMore,
    addNewPost
  }
}
