import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, RootState } from '@/store'
import { fetchRelationshipCounts } from '@/store/modules/FollowStore'

const RELATIONSHIP_COUNTS_STALE_MS = 5 * 60 * 1000

export function useRelationshipCounts(userId?: string) {
  const dispatch = useDispatch<AppDispatch>()
  const {
    followerCount: cachedFollowerCount,
    followingCount: cachedFollowingCount,
    countsLoading,
    countsLastUpdated,
    relationshipCountsUserId
  } = useSelector((state: RootState) => state.follow)

  const cacheMatchesUser = relationshipCountsUserId === userId
  const followingCount = cacheMatchesUser ? cachedFollowingCount : null
  const followerCount = cacheMatchesUser ? cachedFollowerCount : null
  const hasCachedCounts = followingCount !== null && followerCount !== null
  const loadingCounts = countsLoading && !hasCachedCounts

  const reload = useCallback(async () => {
    if (!userId) {
      return
    }

    await dispatch(fetchRelationshipCounts({ userId }))
  }, [dispatch, userId])

  useEffect(() => {
    if (!userId || countsLoading) {
      return
    }

    const isStale =
      !countsLastUpdated ||
      Date.now() - countsLastUpdated > RELATIONSHIP_COUNTS_STALE_MS

    if (!cacheMatchesUser || !hasCachedCounts || isStale) {
      void dispatch(fetchRelationshipCounts({ userId }))
    }
  }, [
    cacheMatchesUser,
    countsLastUpdated,
    countsLoading,
    dispatch,
    hasCachedCounts,
    userId
  ])

  return {
    followingCount,
    followerCount,
    loadingCounts,
    reload
  }
}
