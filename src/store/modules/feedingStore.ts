import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  getFeedingListByDateReq,
  addFeedingRecordReq,
  updateFeedingRecordReq,
  FeedingListResponse
} from '../../api/feeding'
import { FeedingItem, FeedingRecordRequest } from '../../types/feeding'

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

export const addFeedingRecord = createAsyncThunk(
  'feeding/addFeedingRecord',
  async (
    { babyId, data }: { babyId: string; data: FeedingRecordRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await addFeedingRecordReq(babyId, data)
      return { ...(response.data as { feeding_id: string }), data }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateFeedingRecord = createAsyncThunk<
  { message: string },
  { babyId: string; feedingId: string; data: FeedingRecordRequest }
>(
  'feeding/updateFeedingRecord',
  async ({ babyId, feedingId, data }, { rejectWithValue }) => {
    try {
      const response = await updateFeedingRecordReq(babyId, feedingId, data)
      return response.data as { message: string }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

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
      .addCase(addFeedingRecord.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addFeedingRecord.fulfilled, (state, action) => {
        state.loading = false
        // 构建新的喂养记录对象并添加到列表中
        const newRecord: FeedingItem = {
          feed_id: action.payload.feeding_id,
          baby_id: action.meta.arg.babyId,
          feed_type: action.payload.data.feed_type,
          start_time: action.payload.data.start_time,
          amount: action.payload.data.amount,
          side: action.payload.data.side,
          duration: action.payload.data.duration,
          remark: action.payload.data.remark,
          summary_text: action.payload.data.summary_text
        }
        state.feedingList.unshift(newRecord)
      })
      .addCase(addFeedingRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateFeedingRecord.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFeedingRecord.fulfilled, (state, action) => {
        state.loading = false
        // 更新feedingList中的记录
        const index = state.feedingList.findIndex(
          item => item.feed_id === action.meta.arg.feedingId
        )
        if (index >= 0) {
          state.feedingList[index] = {
            ...state.feedingList[index],
            feed_type: action.meta.arg.data.feed_type,
            start_time: action.meta.arg.data.start_time,
            amount: action.meta.arg.data.amount,
            side: action.meta.arg.data.side,
            duration: action.meta.arg.data.duration,
            remark: action.meta.arg.data.remark,
            summary_text: action.meta.arg.data.summary_text
          }
        }
      })
      .addCase(updateFeedingRecord.rejected, (state, action) => {
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
