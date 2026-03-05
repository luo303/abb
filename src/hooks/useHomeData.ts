import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import {
  fetchPostList,
  loadMorePosts,
  fetchFollowingPosts,
  loadMoreFollowingPosts,
  addLocalPost
} from '@/store/modules/PostStore'
import { getUserMeReq, ApiResponse, UserMeResponse } from '../api/profile'
import { setUserInfo } from '../store/modules/userStore'
import { PostItem } from '../types/home'
import { useMessage } from '@/components/Message'

export function useHomeData() {
  const dispatch = useAppDispatch()
  const {
    postList,
    hasMore,
    isLoadingMore,
    page,
    hotPostList,
    hotHasMore,
    isHotLoadingMore,
    hotPage,
    followingPosts,
    followHasMore,
    isFollowLoading,
    followPage,
    localPublishedPosts
  } = useAppSelector(state => state.post)
  const userInfo = useAppSelector(
    state => state.user.userInfo
  ) as UserMeResponse | null
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('推荐')
  const isTabLoading = false

  const isMountedRef = useRef(true)
  const isLockRef = useRef(false)
  const { showMessage } = useMessage()

  // 合并展示的数据
  const serverIds = new Set(
    activeTab === '关注'
      ? followingPosts.map(p => p.post_id)
      : activeTab === '热门'
        ? hotPostList.map(p => p.post_id)
        : postList.map(p => p.post_id)
  )
  const uniqueLocalPosts =
    activeTab === '推荐'
      ? localPublishedPosts.filter(p => !serverIds.has(p.post_id))
      : []
  const posts =
    activeTab === '关注'
      ? followingPosts // 关注列表只显示API获取的关注帖子
      : activeTab === '热门'
        ? hotPostList
        : [...uniqueLocalPosts, ...postList] // 本地添加的帖子优先显示在前面

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

  // 下拉刷新处理函数
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      if (activeTab === '关注') {
        await dispatch(fetchFollowingPosts({ page: 1, force: true })).unwrap()
      } else {
        let strategy: string | undefined
        if (activeTab === '热门') {
          strategy = 'hot'
        } else if (activeTab === '推荐') {
          strategy = 'random'
        }
        await dispatch(
          fetchPostList({ page: 1, strategy, force: true })
        ).unwrap()
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
    if (refreshing) return

    const currentListLength =
      activeTab === '关注'
        ? followingPosts.length
        : activeTab === '热门'
          ? hotPostList.length
          : postList.length + localPublishedPosts.length
    if (currentListLength === 0) return

    const currentLoading =
      activeTab === '关注'
        ? isFollowLoading
        : activeTab === '热门'
          ? isHotLoadingMore
          : isLoadingMore
    if (currentLoading) return

    const currentHasMore =
      activeTab === '关注'
        ? followHasMore
        : activeTab === '热门'
          ? hotHasMore
          : hasMore
    if (!currentHasMore) return

    // 针对 Mock 的刹车逻辑
    const currentPage =
      activeTab === '关注' ? followPage : activeTab === '热门' ? hotPage : page
    if (activeTab !== '关注' && currentPage >= 5) return

    // 🔒 上锁
    isLockRef.current = true

    try {
      if (activeTab === '关注') {
        await dispatch(
          loadMoreFollowingPosts({ page: followPage + 1 })
        ).unwrap()
      } else {
        let strategy = activeTab === '热门' ? 'hot' : 'random'
        const nextPage = activeTab === '热门' ? hotPage + 1 : page + 1
        await dispatch(loadMorePosts({ page: nextPage, strategy })).unwrap()
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
  const addNewPost = useCallback(
    (newPost: PostItem) => {
      dispatch(addLocalPost(newPost))
    },
    [dispatch]
  )

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    posts,
    // 关键：根据 activeTab 返回对应的 hasMore 状态
    hasMore:
      activeTab === '关注'
        ? followHasMore
        : activeTab === '热门'
          ? hotHasMore
          : hasMore,
    isLoadingMore:
      activeTab === '关注'
        ? isFollowLoading
        : activeTab === '热门'
          ? isHotLoadingMore
          : isLoadingMore,
    isTabLoading,
    refreshing,
    activeTab,
    setActiveTab,
    handleRefresh,
    loadMore,
    addNewPost
  }
}
