import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { toggleFollow } from '@/api/follow'
import { saveFollowingIds } from '@/utils/followStorage'

interface FollowState {
  followingIds: string[]
  loading: boolean
  error: string | null
}

const initialState: FollowState = {
  followingIds: [],
  loading: false,
  error: null
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
      }
    },
    // 取消关注用户
    unfollowUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload
      state.followingIds = state.followingIds.filter(id => id !== userId)
      // 保存到本地存储
      saveFollowingIds(state.followingIds)
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
  }
})

export const { followUser, unfollowUser, setFollowingIds, clearFollowingIds } =
  followSlice.actions

// 选择器：判断某个用户是否在关注名单里
export const isFollowing =
  (state: { follow: FollowState }) => (userId: string) => {
    return state.follow.followingIds.includes(userId)
  }

export default followSlice.reducer
