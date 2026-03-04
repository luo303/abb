import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchPostList,
  loadMorePosts,
  fetchFollowingPosts,
  loadMoreFollowingPosts
} from '@/store/modules/PostStore'
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
  const {
    postList,
    hasMore,
    isLoadingMore,
    page,
    followingPosts,
    followHasMore,
    isFollowLoading,
    followPage
  } = useAppSelector(state => state.post)
  const userInfo = useAppSelector(
    state => state.user.userInfo
  ) as UserMeResponse | null
  const babyState = useAppSelector(state => state.baby)

  const [refreshing, setRefreshing] = useState(false)
  const [localPosts, setLocalPosts] = useState<PostItem[]>([])
  const [activeTab, setActiveTab] = useState('推荐')

  const isMountedRef = useRef(true)
  const isLockRef = useRef(false)
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
      ? followingPosts // 关注列表只显示API获取的关注帖子
      : [...postList, ...uniqueLocalPosts]

  // 初始化时加载数据
  useEffect(() => {
    const loadData = async () => {
      if (activeTab === '关注') {
        try {
          await dispatch(fetchFollowingPosts({ page: 1 })).unwrap()
        } catch (error) {
          console.error('获取关注帖子失败:', error)
          showMessage('获取关注帖子失败，请稍后重试')
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
        await dispatch(fetchFollowingPosts({ page: 1 })).unwrap()
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
      if (activeTab === '关注') {
        showMessage('刷新关注帖子失败，请稍后重试')
      }
    } finally {
      setRefreshing(false)
    }
  }, [dispatch, activeTab, showMessage])

  // 加载更多
  const loadMore = useCallback(async () => {
    // 物理锁判断：只要有一个请求在跑，后续触发直接弹回
    if (isLockRef.current) return

    const currentLoading =
      activeTab === '关注' ? isFollowLoading : isLoadingMore
    const currentHasMore = activeTab === '关注' ? followHasMore : hasMore

    if (currentLoading || !currentHasMore) return

    // 针对 Mock 的刹车逻辑
    const currentPage = activeTab === '关注' ? followPage : page
    if (activeTab !== '关注' && currentPage >= 5) return

    // 🔒 上锁
    isLockRef.current = true

    try {
      if (activeTab === '关注') {
        await dispatch(
          loadMoreFollowingPosts({ page: followPage + 1 })
        ).unwrap()
      } else {
        let strategy = activeTab === '热门' ? 'hot' : 'ctime'
        await dispatch(loadMorePosts({ page: page + 1, strategy })).unwrap()
      }
    } catch (error) {
      console.error('Load more failed:', error)
      if (activeTab === '关注') {
        showMessage('加载更多关注帖子失败，请稍后重试')
      }
    } finally {
      // 解锁
      isLockRef.current = false
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
