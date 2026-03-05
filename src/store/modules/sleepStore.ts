import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getSleepByDate, endSleep, startSleep } from '../../api/sleep'
import { SleepRecord, SleepSession } from '../../types/sleep'
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
    console.log('Fetching sleep list for babyId:', babyId, 'date:', date)
    // 先尝试从本地存储获取数据
    const localRecords = await getSleepRecords(babyId, date)
    console.log('Local records:', JSON.stringify(localRecords))
    if (localRecords.length > 0) {
      console.log('Returning local records')
      return localRecords
    }

    // 本地存储没有数据时，从 API 获取
    console.log('Fetching sleep records from API')
    const response = await getSleepByDate(babyId, date)
    console.log('API response:', JSON.stringify(response))

    // 保存到本地存储
    await saveSleepRecords(babyId, date, response)
    console.log('API records saved to local storage')

    return response
  } catch (error: any) {
    console.error('Error fetching sleep list:', error)
    // 失败时从本地存储获取数据
    try {
      const localRecords = await getSleepRecords(babyId, date)
      console.log('Local records on error:', JSON.stringify(localRecords))
      if (localRecords.length > 0) {
        console.log('Returning local records on error')
        return localRecords
      }
    } catch (localError) {
      console.error('从本地存储获取数据失败:', localError)
    }
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
      const response = await endSleep(babyId, session_id)
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
        console.log('Saving sleep record for date:', date)
        console.log('Sleep record:', JSON.stringify(sleepRecord))
        // 先从本地存储获取当前日期的睡眠记录
        const existingRecords = await getSleepRecords(babyId, date)
        console.log('Existing records:', JSON.stringify(existingRecords))
        // 将新的睡眠记录添加到列表的开头
        const updatedRecords = [sleepRecord, ...existingRecords]
        console.log('Updated records:', JSON.stringify(updatedRecords))
        await saveSleepRecords(babyId, date, updatedRecords)
        console.log('Sleep record saved to local storage')
      } catch (storageError) {
        console.error('保存睡眠记录到本地存储失败:', storageError)
      }

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
        console.log('Saving sleep record for date:', date)
        console.log('Sleep record:', JSON.stringify(sleepRecord))
        // 先从本地存储获取当前日期的睡眠记录
        const existingRecords = await getSleepRecords(babyId, date)
        console.log('Existing records:', JSON.stringify(existingRecords))
        // 将新的睡眠记录添加到列表的开头
        const updatedRecords = [sleepRecord, ...existingRecords]
        console.log('Updated records:', JSON.stringify(updatedRecords))
        await saveSleepRecords(babyId, date, updatedRecords)
        console.log('Sleep record saved to local storage')
      } catch (storageError) {
        console.error('保存睡眠记录到本地存储失败:', storageError)
      }

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
      state.sleepList.unshift(action.payload.record)
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
        console.log('fetchSleepList payload:', JSON.stringify(action.payload))
        state.sleepList = action.payload || []
        console.log('sleepList after set:', JSON.stringify(state.sleepList))
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
        state.sleepList.unshift(action.payload)
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
