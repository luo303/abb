import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { fetchPostList, loadMorePosts } from '@/store/modules/PostStore'
import { getUserMeReq, ApiResponse, UserMeResponse } from '../api/profile'
import { setUserInfo } from '../store/modules/userStore'
import { fetchBabies, fetchBabyProfile } from '../store/modules/BabyStore'
import { PostItem } from '../types/home'

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

  const isMountedRef = useRef(true)

  // 合并展示的数据
  const serverIds = new Set(postList.map(p => p.post_id))
  const uniqueLocalPosts = localPosts.filter(p => !serverIds.has(p.post_id))
  const posts = [...postList, ...uniqueLocalPosts]

  // 初始化时加载数据
  useEffect(() => {
    let strategy: string | undefined
    if (activeTab === '热门') {
      strategy = 'hot'
    } else if (activeTab === '推荐' || activeTab === '关注') {
      strategy = 'ctime'
    }
    dispatch(fetchPostList({ page: 1, strategy }))
  }, [dispatch, activeTab])

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
    if (babyState.currentBabyId) {
      dispatch(fetchBabyProfile(babyState.currentBabyId))
      return
    }
    dispatch(fetchBabies()).then(action => {
      // @ts-ignore
      if (fetchBabies.fulfilled.match(action) && action.payload?.code === 0) {
        const id = action.payload?.data?.babies?.[0]?.baby_id
        if (id) {
          dispatch(fetchBabyProfile(id))
        }
      }
    })
  }, [dispatch, babyState.currentBabyId, babyState.currentBabyDetail])

  // 下拉刷新处理函数
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      let strategy: string | undefined
      if (activeTab === '热门') {
        strategy = 'hot'
      } else if (activeTab === '推荐' || activeTab === '关注') {
        strategy = 'ctime'
      }
      await dispatch(fetchPostList({ page: 1, strategy })).unwrap()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }, [dispatch, activeTab])

  // 加载更多
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    try {
      await dispatch(loadMorePosts({ page: page + 1 })).unwrap()
    } catch (error) {
      console.error('Load more failed:', error)
    }
  }, [dispatch, page, hasMore, isLoadingMore])

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
    hasMore,
    isLoadingMore,
    refreshing,
    activeTab,
    setActiveTab,
    handleRefresh,
    loadMore,
    addNewPost
  }
}
