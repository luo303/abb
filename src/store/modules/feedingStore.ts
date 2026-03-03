import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getFeedingListByDateReq, FeedingListResponse } from '../../api/feeding'
import { FeedingItem } from '../../types/feeding'

interface FeedingState {
  feedingList: FeedingItem[]
  loading: boolean
  error: string | null
}

const initialState: FeedingState = {
  feedingList: [],
  loading: false,
  error: null
}

export const fetchFeedingList = createAsyncThunk<
  FeedingListResponse,
  { babyId: string; date: string }
>('feeding/fetchFeedingList', async ({ babyId, date }, { rejectWithValue }) => {
  try {
    const response = await getFeedingListByDateReq(babyId, date)
    return response
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

const feedingSlice = createSlice({
  name: 'feeding',
  initialState,
  reducers: {
    addFeedingItem: (state, action: PayloadAction<FeedingItem>) => {
      state.feedingList.unshift(action.payload)
    },
    updateFeedingItem: (state, action: PayloadAction<FeedingItem>) => {
      const index = state.feedingList.findIndex(
        item => item.feed_id === action.payload.feed_id
      )
      if (index >= 0) {
        state.feedingList[index] = action.payload
      }
    },
    deleteFeedingItem: (state, action: PayloadAction<string>) => {
      state.feedingList = state.feedingList.filter(
        item => item.feed_id !== action.payload
      )
    },
    clearFeedingData: state => {
      state.feedingList = []
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFeedingList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFeedingList.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.code === 0 || action.payload?.code === 200) {
          state.feedingList = action.payload.data?.items || []
        } else {
          state.error = action.payload?.message || '获取喂养记录失败'
        }
      })
      .addCase(fetchFeedingList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  addFeedingItem,
  updateFeedingItem,
  deleteFeedingItem,
  clearFeedingData
} = feedingSlice.actions

export default feedingSlice.reducer
