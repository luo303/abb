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

    // 增加防抖：如果关注列表刚刚添加了新帖子，暂时不加载更多
    if (activeTab === '关注' && followingPosts.length > 0) {
      const lastPost = followingPosts[0]
      // 检查帖子是否是刚刚添加的（通过检查是否有本地添加的标记）
      if (lastPost && lastPost.__isLocalAdded) {
        return
      }
    }

    try {
      if (activeTab === '关注') {
        const nextPage = followPage + 1
        await dispatch(loadMoreFollowingPosts({ page: nextPage })).unwrap()
      } else {
        await dispatch(loadMorePosts({ page: page + 1 })).unwrap()
      }
    } catch (error) {
      // 增加日志：在 catch 块中打印出 res 的完整内容
      console.error('Load more failed:', error)
      if (activeTab === '关注') {
        showMessage('加载更多关注帖子失败，请稍后重试')
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
    followPage,
    followingPosts
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
