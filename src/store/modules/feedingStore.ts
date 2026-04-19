import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  getFeedingListByDateReq,
  addFeedingRecordReq,
  updateFeedingRecordReq,
  FeedingListResponse
} from '../../api/feeding'
import { createFeedingRecord } from '../../api/daily'
import {
  FeedingItem,
  FeedingRecordRequest,
  FeedingType
} from '../../types/feeding'

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
    // 只从 API 获取数据
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
    { rejectWithValue, dispatch, getState }
  ) => {
    console.log('addFeedingRecord called with:', { babyId, data })
    try {
      const response = await addFeedingRecordReq(babyId, data)
      console.log('addFeedingRecord API response:', response)
      // 容错处理：由于 Mock 环境 code 类型可能不一致，判断成功时使用 String(res.code) === '0' || res.code === 200
      if (String(response.code) === '0' || response.code === 200) {
        // 获取当前日期
        const currentDate = (getState() as any).daily.currentDate
        // 触发统计信息更新
        dispatch({
          type: 'daily/fetchDailyStatistics',
          payload: { babyId, date: currentDate }
        })
        return { ...(response.data as { feeding_id: string }), data, babyId }
      } else {
        return rejectWithValue(response.message || '添加喂养记录失败')
      }
    } catch (error: any) {
      console.error('addFeedingRecord API error:', error)
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const updateFeedingRecord = createAsyncThunk<
  { message: string },
  { babyId: string; feedingId: string; data: FeedingRecordRequest }
>(
  'feeding/updateFeedingRecord',
  async (
    { babyId, feedingId, data },
    { rejectWithValue, dispatch, getState }
  ) => {
    try {
      const response = await updateFeedingRecordReq(babyId, feedingId, data)
      // 获取当前日期
      const currentDate = (getState() as any).daily.currentDate
      // 触发统计信息更新
      dispatch({
        type: 'daily/fetchDailyStatistics',
        payload: { babyId, date: currentDate }
      })
      return response.data as { message: string }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const saveFeedingRecord = createAsyncThunk(
  'feeding/saveFeedingRecord',
  async (
    { babyId, data }: { babyId: string; data: FeedingRecordRequest },
    { rejectWithValue, dispatch, getState }
  ) => {
    console.log('saveFeedingRecord called with:', { babyId, data })
    try {
      const response = await createFeedingRecord(babyId, data)
      console.log('saveFeedingRecord API response:', response)
      // 检查response是否为null或undefined
      if (!response) {
        return rejectWithValue('服务器返回数据异常')
      }
      // 修正逻辑：使用 String(res.code) === '0' 来判断成功
      if (
        response.code === 0 ||
        response.code === 200 ||
        String(response.code) === '0'
      ) {
        // 获取当前日期
        const currentDate = (getState() as any).daily.currentDate
        // 触发统计信息更新
        dispatch({
          type: 'daily/fetchDailyStatistics',
          payload: { babyId, date: currentDate }
        })
        return { ...(response.data as { feeding_id: string }), data, babyId }
      } else {
        return rejectWithValue(response.message || '添加喂养记录失败')
      }
    } catch (error: any) {
      console.error('saveFeedingRecord API error:', error)
      return rejectWithValue(
        error.response?.data?.message || error.message || '操作失败'
      )
    }
  }
)

const feedingSlice = createSlice({
  name: 'feeding',
  initialState,
  reducers: {
    addFeedingItem: (state, action: PayloadAction<FeedingItem>) => {
      // 检查是否已经存在相同的feeding_id
      const existingIndex = state.feedingList.findIndex(
        item => item.feeding_id === action.payload.feeding_id
      )
      if (existingIndex >= 0) {
        // 如果已经存在，替换旧记录
        state.feedingList[existingIndex] = action.payload
      } else {
        // 否则添加新记录
        state.feedingList.unshift(action.payload)
      }
    },
    updateFeedingItem: (state, action: PayloadAction<FeedingItem>) => {
      const index = state.feedingList.findIndex(
        item => item.feeding_id === action.payload.feeding_id
      )
      if (index >= 0) {
        state.feedingList[index] = action.payload
      }
    },
    deleteFeedingItem: (
      state,
      action: PayloadAction<{ feedingId: string; babyId: string; date: string }>
    ) => {
      state.feedingList = state.feedingList.filter(
        item => item.feeding_id !== action.payload.feedingId
      )
    },
    clearFeedingData: (
      state,
      action: PayloadAction<{ babyId: string; date: string }>
    ) => {
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

        // 从接口获取的数据
        if (action.payload?.code === 0 || action.payload?.code === 200) {
          const records = (action.payload.data?.items || []).map(item => ({
            feeding_id: item.feeding_id,
            baby_id: action.meta.arg.babyId,
            feed_type:
              (item.feed_type as string) === 'breast_milk'
                ? FeedingType.BREAST
                : (item.feed_type as string) === 'pumped_milk'
                  ? FeedingType.PUMP
                  : (item.feed_type as string) === 'solid'
                    ? FeedingType.FOOD
                    : FeedingType.FORMULA,
            feed_time: item.feed_time,
            amount: item.amount,
            duration: item.duration,
            remark: item.remark,
            summary_text: item.remark
          }))
          state.feedingList = records
        } else {
          state.error = action.payload?.message || '获取喂养记录失败'
        }
      })
      .addCase(fetchFeedingList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addFeedingRecord.pending, state => {
        state.error = null
      })
      .addCase(addFeedingRecord.fulfilled, (state, action) => {
        // 用返回的 record_id 替换本地记录的临时 ID
        const index = state.feedingList.findIndex(
          item =>
            typeof item.feeding_id === 'string' &&
            item.feeding_id.startsWith('feed_') &&
            item.baby_id === action.payload.babyId
        )
        if (index >= 0) {
          state.feedingList[index].feeding_id = action.payload.feeding_id
        }
      })
      .addCase(addFeedingRecord.rejected, (state, action) => {
        state.error = action.payload as string
      })
      .addCase(updateFeedingRecord.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFeedingRecord.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // 使用请求时传入的feedingId精准定位记录
        const index = state.feedingList.findIndex(
          item => item.feeding_id === action.meta.arg.feedingId
        )
        if (index >= 0) {
          // 用最新的表单数据全量覆盖旧记录，保持feeding_id不变
          state.feedingList[index] = {
            ...state.feedingList[index],
            feed_type: action.meta.arg.data.feed_type,
            feed_time: action.meta.arg.data.start_time,
            amount: action.meta.arg.data.amount,
            side: action.meta.arg.data.side,
            duration: action.meta.arg.data.duration,
            remark: action.meta.arg.data.remark,
            summary_text: action.meta.arg.data.remark
          }
        }
      })
      .addCase(updateFeedingRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(saveFeedingRecord.pending, state => {
        state.error = null
      })
      .addCase(saveFeedingRecord.fulfilled, (state, action) => {
        // 用返回的 feeding_id 替换本地记录的临时 ID 或添加新记录
        const { feeding_id, babyId, data } = action.payload

        // 确保feeding_id存在
        if (!feeding_id) {
          return
        }

        // 查找要更新的临时记录
        const index = state.feedingList.findIndex(
          item =>
            typeof item.feeding_id === 'string' &&
            item.feeding_id.startsWith('feed_') &&
            item.baby_id === babyId
        )

        if (index >= 0) {
          // 检查新的feeding_id是否已经存在
          const existingIndex = state.feedingList.findIndex(
            item => item.feeding_id === feeding_id
          )
          if (existingIndex >= 0 && existingIndex !== index) {
            // 如果已经存在，移除旧记录
            state.feedingList.splice(existingIndex, 1)
          }
          // 准确赋值feeding_id字段
          state.feedingList[index].feeding_id = feeding_id
        } else {
          // 如果没有找到临时记录，直接添加新记录
          const newRecord = {
            feeding_id: feeding_id,
            baby_id: babyId,
            feed_type: data.feed_type,
            feed_time: data.start_time,
            amount: data.amount,
            duration: data.duration,
            remark: data.remark,
            summary_text: data.remark
          }
          state.feedingList.unshift(newRecord)
        }
      })
      .addCase(saveFeedingRecord.rejected, (state, action) => {
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
