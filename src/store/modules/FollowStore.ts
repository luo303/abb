import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getFollowerUsers, getFollowingUsers, toggleFollow } from '@/api/follow'
import { saveFollowingIds } from '@/utils/followStorage'

interface FollowState {
  followingIds: string[]
  loading: boolean
  error: string | null
  followingCount: number | null
  followerCount: number | null
  countsLoading: boolean
  countsError: string | null
  countsLastUpdated: number | null
  relationshipCountsUserId: string | null
}

const initialState: FollowState = {
  followingIds: [],
  loading: false,
  error: null,
  followingCount: null,
  followerCount: null,
  countsLoading: false,
  countsError: null,
  countsLastUpdated: null,
  relationshipCountsUserId: null
}

const PAGE_SIZE = 100
const MAX_PAGE = 100

async function getRelationshipCount(
  fetcher: (
    page?: number,
    pageSize?: number,
    userId?: string
  ) => Promise<{
    data: {
      list: unknown[]
      has_more: boolean
    }
  }>,
  userId?: string
) {
  let page = 1
  let total = 0
  let hasMore = true

  while (hasMore) {
    const response = await fetcher(page, PAGE_SIZE, userId)
    const list = response.data?.list ?? []

    total += list.length
    hasMore = Boolean(response.data?.has_more)
    page += 1

    if (page > MAX_PAGE) {
      break
    }
  }

  return total
}

// 初始化关注列表
export const initFollowingIds = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>('follow/initFollowingIds', async (_, { rejectWithValue }) => {
  try {
    // 清除可能存在的错误数据，确保初始状态为空
    await saveFollowingIds([])
    return []
  } catch (error: any) {
    return rejectWithValue(error.message)
  }
})

// 关注/取消关注用户的异步操作
export const followUserAsync = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>('follow/followUser', async (userId: string, { rejectWithValue }) => {
  try {
    await toggleFollow(userId)
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const fetchRelationshipCounts = createAsyncThunk<
  {
    userId: string
    followingCount: number
    followerCount: number
    fetchedAt: number
  },
  { userId: string },
  { rejectValue: string }
>('follow/fetchRelationshipCounts', async ({ userId }, { rejectWithValue }) => {
  try {
    const [followingCount, followerCount] = await Promise.all([
      getRelationshipCount(getFollowingUsers, userId),
      getRelationshipCount(getFollowerUsers, userId)
    ])

    return {
      userId,
      followingCount,
      followerCount,
      fetchedAt: Date.now()
    }
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || '获取关注/粉丝统计失败'
    )
  }
})

const followSlice = createSlice({
  name: 'follow',
  initialState,
  reducers: {
    // 关注用户
    followUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      if (!state.followingIds.includes(userId)) {
        state.followingIds.push(userId)
        // 保存到本地存储
        saveFollowingIds(state.followingIds)

        if (state.followingCount !== null) {
          state.followingCount += 1
        }
      }
    },
    // 取消关注用户
    unfollowUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      state.followingIds = state.followingIds.filter(id => id !== userId)
      // 保存到本地存储
      saveFollowingIds(state.followingIds)

      if (state.followingCount !== null) {
        state.followingCount = Math.max(0, state.followingCount - 1)
      }
    },
    // 初始化关注列表
    setFollowingIds: (state, action: PayloadAction<string[]>) => {
      state.followingIds = action.payload
      // 保存到本地存储
      saveFollowingIds(state.followingIds)
    },
    // 清空关注列表
    clearFollowingIds: state => {
      state.followingIds = []
      // 保存到本地存储
      saveFollowingIds(state.followingIds)
    },
    clearRelationshipCounts: state => {
      state.followingCount = null
      state.followerCount = null
      state.countsLoading = false
      state.countsError = null
      state.countsLastUpdated = null
      state.relationshipCountsUserId = null
    },
    resetFollowState: state => {
      state.followingIds = []
      state.loading = false
      state.error = null
      state.followingCount = null
      state.followerCount = null
      state.countsLoading = false
      state.countsError = null
      state.countsLastUpdated = null
      state.relationshipCountsUserId = null
      saveFollowingIds([])
    }
  },
  extraReducers: builder => {
    builder
      // 初始化关注列表
      .addCase(initFollowingIds.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(initFollowingIds.fulfilled, (state, action) => {
        state.loading = false
        state.followingIds = action.payload
      })
      .addCase(initFollowingIds.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || '加载关注列表失败'
      })
      // 关注/取消关注用户
      .addCase(followUserAsync.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(followUserAsync.fulfilled, state => {
        state.loading = false
      })
      .addCase(followUserAsync.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || '操作失败'
      })
      .addCase(fetchRelationshipCounts.pending, state => {
        state.countsLoading = true
        state.countsError = null
      })
      .addCase(fetchRelationshipCounts.fulfilled, (state, action) => {
        state.countsLoading = false
        state.relationshipCountsUserId = action.payload.userId
        state.followingCount = action.payload.followingCount
        state.followerCount = action.payload.followerCount
        state.countsLastUpdated = action.payload.fetchedAt
      })
      .addCase(fetchRelationshipCounts.rejected, (state, action) => {
        state.countsLoading = false
        state.countsError = action.payload || '获取关注/粉丝统计失败'
      })
  }
})

export const {
  followUser,
  unfollowUser,
  setFollowingIds,
  clearFollowingIds,
  clearRelationshipCounts,
  resetFollowState
} = followSlice.actions

// 选择器：判断某个用户是否在关注名单里
export const isFollowing =
  (state: { follow: FollowState }) => (userId: string) => {
    return state.follow.followingIds.includes(userId)
  }

export default followSlice.reducer
