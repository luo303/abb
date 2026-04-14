import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getSleepByDate, endSleep } from '../../api/sleep'
import { SleepRecord } from '../../types/sleep'
import {
  saveSleepRecords,
  getSleepRecords,
  clearSleepRecords
} from '../../utils/sleepStorage'

interface SleepState {
  sleepList: SleepRecord[]
  loading: boolean
  error: string | null
}

const initialState: SleepState = {
  sleepList: [],
  loading: false,
  error: null
}

export const fetchSleepList = createAsyncThunk<
  SleepRecord[],
  { babyId: string; date: string }
>('sleep/fetchSleepList', async ({ babyId, date }, { rejectWithValue }) => {
  try {
    // 优先从 API 获取数据
    const response = await getSleepByDate(babyId, date)

    // 保存到本地存储
    await saveSleepRecords(babyId, date, response)

    return response
  } catch (error: any) {
    // 失败时从本地存储获取数据
    try {
      const localRecords = await getSleepRecords(babyId, date)
      if (localRecords.length > 0) {
        return localRecords
      }
    } catch {}
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const addSleepRecord = createAsyncThunk<
  SleepRecord,
  { babyId: string; session_id: string; started_at: number; ended_at: number }
>(
  'sleep/addSleepRecord',
  async (
    { babyId, session_id, started_at, ended_at },
    { rejectWithValue, getState }
  ) => {
    try {
      await endSleep(babyId, session_id)
      // 总是使用传入的参数创建睡眠记录，因为这些值是基于用户实际计时的时间计算的
      const duration_ms = ended_at - started_at
      const sleepRecord: SleepRecord = {
        session_id: session_id,
        started_at: started_at,
        ended_at: ended_at,
        duration_ms: duration_ms
      }

      // 保存到本地存储
      try {
        // 使用 UTC 日期来避免时区问题
        const date = new Date(sleepRecord.started_at)
          .toISOString()
          .split('T')[0]
        // 先从本地存储获取当前日期的睡眠记录
        const existingRecords = await getSleepRecords(babyId, date)
        // 将新的睡眠记录添加到列表的开头
        const updatedRecords = [sleepRecord, ...existingRecords]
        await saveSleepRecords(babyId, date, updatedRecords)
      } catch {}

      return sleepRecord
    } catch (error: any) {
      // API 调用失败，使用传入的参数创建一个有效的 SleepRecord 对象
      const duration_ms = ended_at - started_at
      const sleepRecord: SleepRecord = {
        session_id: session_id,
        started_at: started_at,
        ended_at: ended_at,
        duration_ms: duration_ms
      }

      // 保存到本地存储
      try {
        // 使用 UTC 日期来避免时区问题
        const date = new Date(sleepRecord.started_at)
          .toISOString()
          .split('T')[0]
        // 先从本地存储获取当前日期的睡眠记录
        const existingRecords = await getSleepRecords(babyId, date)
        // 将新的睡眠记录添加到列表的开头
        const updatedRecords = [sleepRecord, ...existingRecords]
        await saveSleepRecords(babyId, date, updatedRecords)
      } catch {}

      return sleepRecord
    }
  }
)

export const updateSleepRecord = createAsyncThunk<
  SleepRecord,
  { babyId: string; session_id: string; data: Partial<SleepRecord> }
>(
  'sleep/updateSleepRecord',
  async ({ babyId, session_id, data }, { rejectWithValue, getState }) => {
    try {
      // 由于睡眠记录的特殊性，更新操作可能需要不同的API
      // 这里暂时返回模拟数据，实际实现需要根据后端API调整
      const updatedRecord: SleepRecord = {
        session_id,
        started_at: data.started_at || 0,
        ended_at: data.ended_at || 0,
        duration_ms: data.duration_ms || 0
      }

      // 保存到本地存储
      try {
        const date = new Date(updatedRecord.started_at)
          .toISOString()
          .split('T')[0]
        const state = getState() as { sleep: SleepState }
        const updatedRecords = (state.sleep.sleepList || []).map(record =>
          record.session_id === session_id ? updatedRecord : record
        )
        await saveSleepRecords(babyId, date, updatedRecords)
      } catch (storageError) {
        console.error('保存睡眠记录到本地存储失败:', storageError)
      }

      return updatedRecord
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const sleepSlice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {
    addSleepItem: (
      state,
      action: PayloadAction<{ record: SleepRecord; babyId: string }>
    ) => {
      if (!Array.isArray(state.sleepList)) {
        state.sleepList = []
      }

      // 检查是否已经存在相同session_id的记录
      const existingIndex = state.sleepList.findIndex(
        item => item.session_id === action.payload.record.session_id
      )

      if (existingIndex >= 0) {
        // 如果存在，更新记录
        state.sleepList[existingIndex] = action.payload.record
      } else {
        // 如果不存在，添加新记录
        state.sleepList.unshift(action.payload.record)
      }

      // 保存到本地存储
      try {
        const date = new Date(action.payload.record.started_at)
          .toISOString()
          .split('T')[0]
        saveSleepRecords(action.payload.babyId, date, state.sleepList)
      } catch (error) {
        console.error('保存睡眠记录到本地存储失败:', error)
      }
    },
    updateSleepItem: (
      state,
      action: PayloadAction<{ record: SleepRecord; babyId: string }>
    ) => {
      if (!Array.isArray(state.sleepList)) {
        state.sleepList = []
        return
      }
      const index = state.sleepList.findIndex(
        item => item.session_id === action.payload.record.session_id
      )
      if (index >= 0) {
        state.sleepList[index] = action.payload.record
        // 保存到本地存储
        try {
          const date = new Date(action.payload.record.started_at)
            .toISOString()
            .split('T')[0]
          saveSleepRecords(action.payload.babyId, date, state.sleepList)
        } catch (error) {
          console.error('保存睡眠记录到本地存储失败:', error)
        }
      }
    },
    deleteSleepItem: (
      state,
      action: PayloadAction<{ sessionId: string; babyId: string; date: string }>
    ) => {
      if (!Array.isArray(state.sleepList)) {
        state.sleepList = []
        return
      }
      state.sleepList = state.sleepList.filter(
        item => item.session_id !== action.payload.sessionId
      )
      // 保存到本地存储
      try {
        saveSleepRecords(
          action.payload.babyId,
          action.payload.date,
          state.sleepList
        )
      } catch (error) {
        console.error('保存睡眠记录到本地存储失败:', error)
      }
    },
    clearSleepData: (
      state,
      action: PayloadAction<{ babyId: string; date: string }>
    ) => {
      state.sleepList = []
      state.error = null
      // 清除本地存储
      try {
        clearSleepRecords(action.payload.babyId, action.payload.date)
      } catch (error) {
        console.error('清除本地存储失败:', error)
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSleepList.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSleepList.fulfilled, (state, action) => {
        state.loading = false
        state.sleepList = action.payload || []
      })
      .addCase(fetchSleepList.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(addSleepRecord.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addSleepRecord.fulfilled, (state, action) => {
        state.loading = false
        // 将新的睡眠记录添加到列表中
        if (!Array.isArray(state.sleepList)) {
          state.sleepList = []
        }

        // 检查是否已经存在相同session_id的记录
        const existingIndex = state.sleepList.findIndex(
          item => item.session_id === action.payload.session_id
        )

        if (existingIndex >= 0) {
          // 如果存在，更新记录
          state.sleepList[existingIndex] = action.payload
        } else {
          // 如果不存在，添加新记录
          state.sleepList.unshift(action.payload)
        }
      })
      .addCase(addSleepRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateSleepRecord.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSleepRecord.fulfilled, (state, action) => {
        state.loading = false
        // 更新sleepList中的记录
        if (!Array.isArray(state.sleepList)) {
          state.sleepList = []
          return
        }
        const index = state.sleepList.findIndex(
          item => item.session_id === action.payload.session_id
        )
        if (index >= 0) {
          state.sleepList[index] = action.payload
        }
      })
      .addCase(updateSleepRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  addSleepItem,
  updateSleepItem,
  deleteSleepItem,
  clearSleepData
} = sleepSlice.actions

export default sleepSlice.reducer
