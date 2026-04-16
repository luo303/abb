import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
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
import { HomeFeedTabKey, PostItem } from '../types/home'
import { useMessage } from '@/components/Message'

const DEFAULT_TAB: HomeFeedTabKey = 'recommend'

export const normalizeHomeTabKey = (tab?: string | null): HomeFeedTabKey => {
  switch (tab) {
    case 'hot':
    case '热门':
      return 'hot'
    case 'following':
    case '关注':
      return 'following'
    case 'recommend':
    case '推荐':
    default:
      return 'recommend'
  }
}

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
  const [activeTab, setActiveTabState] = useState<HomeFeedTabKey>(DEFAULT_TAB)
  const isTabLoading = false

  const isMountedRef = useRef(true)
  const isLockRef = useRef(false)
  const { showMessage } = useMessage()

  const recommendServerIds = useMemo(
    () => new Set(postList.map(p => p.post_id)),
    [postList]
  )

  const recommendPosts = useMemo(
    () => [
      ...localPublishedPosts.filter(p => !recommendServerIds.has(p.post_id)),
      ...postList
    ],
    [localPublishedPosts, postList, recommendServerIds]
  )

  const setActiveTab = useCallback((tab: HomeFeedTabKey | string) => {
    setActiveTabState(normalizeHomeTabKey(tab))
  }, [])

  const getTabPosts = useCallback(
    (tab: HomeFeedTabKey) => {
      switch (tab) {
        case 'hot':
          return hotPostList
        case 'following':
          return followingPosts
        case 'recommend':
        default:
          return recommendPosts
      }
    },
    [followingPosts, hotPostList, recommendPosts]
  )

  const getTabHasMore = useCallback(
    (tab: HomeFeedTabKey) => {
      switch (tab) {
        case 'hot':
          return hotHasMore
        case 'following':
          return followHasMore
        case 'recommend':
        default:
          return hasMore
      }
    },
    [followHasMore, hasMore, hotHasMore]
  )

  const getTabLoadingMore = useCallback(
    (tab: HomeFeedTabKey) => {
      switch (tab) {
        case 'hot':
          return isHotLoadingMore
        case 'following':
          return isFollowLoading
        case 'recommend':
        default:
          return isLoadingMore
      }
    },
    [isFollowLoading, isHotLoadingMore, isLoadingMore]
  )

  const getTabPage = useCallback(
    (tab: HomeFeedTabKey) => {
      switch (tab) {
        case 'hot':
          return hotPage
        case 'following':
          return followPage
        case 'recommend':
        default:
          return page
      }
    },
    [followPage, hotPage, page]
  )

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
        console.error('获取用户信息失败:', error)
      }
    }

    fetchUserInfo()
  }, [dispatch, userInfo])

  const handleRefresh = useCallback(
    async (tab: HomeFeedTabKey = activeTab) => {
      setRefreshing(true)
      try {
        if (tab === 'following') {
          await dispatch(fetchFollowingPosts({ page: 1, force: true })).unwrap()
          return
        }

        const strategy = tab === 'hot' ? 'hot' : 'random'
        await dispatch(
          fetchPostList({ page: 1, strategy, force: true })
        ).unwrap()
      } catch (error) {
        console.error('Refresh failed:', error)
        if (tab === 'following') {
          showMessage('刷新关注帖子失败，请稍后重试')
        }
      } finally {
        setRefreshing(false)
      }
    },
    [activeTab, dispatch, showMessage]
  )

  const loadMore = useCallback(
    async (tab: HomeFeedTabKey = activeTab) => {
      if (isLockRef.current || refreshing) return

      const currentPosts = getTabPosts(tab)
      if (currentPosts.length === 0) return

      const currentLoading = getTabLoadingMore(tab)
      if (currentLoading) return

      const currentHasMore = getTabHasMore(tab)
      if (!currentHasMore) return

      const currentPage = getTabPage(tab)
      if (tab !== 'following' && currentPage >= 5) return

      isLockRef.current = true

      try {
        if (tab === 'following') {
          await dispatch(
            loadMoreFollowingPosts({ page: followPage + 1 })
          ).unwrap()
          return
        }

        const strategy = tab === 'hot' ? 'hot' : 'random'
        const nextPage = tab === 'hot' ? hotPage + 1 : page + 1
        await dispatch(loadMorePosts({ page: nextPage, strategy })).unwrap()
      } catch (error) {
        console.error('Load more failed:', error)
        if (tab === 'following') {
          showMessage('加载更多关注帖子失败，请稍后重试')
        }
      } finally {
        isLockRef.current = false
      }
    },
    [
      activeTab,
      dispatch,
      followPage,
      getTabHasMore,
      getTabLoadingMore,
      getTabPage,
      getTabPosts,
      hotPage,
      page,
      refreshing,
      showMessage
    ]
  )

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
    activeTab,
    setActiveTab,
    refreshing,
    isTabLoading,
    addNewPost,
    handleRefresh,
    loadMore,
    posts: getTabPosts(activeTab),
    hasMore: getTabHasMore(activeTab),
    isLoadingMore: getTabLoadingMore(activeTab),
    recommendPosts,
    hotPosts: hotPostList,
    followingFeedPosts: followingPosts,
    getTabPosts,
    getTabHasMore,
    getTabLoadingMore
  }
}
