import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  getDiaperListByDateReq,
  addDiaperRecordReq,
  updateDiaperRecordReq,
  deleteDiaperRecordReq,
  DiaperListResponse,
  ApiResponse
} from '../../api/diaper'
import { DiaperItem, DiaperRecordRequest } from '../../types/diaper'
import {
  saveDiaperRecords,
  getDiaperRecords,
  clearDiaperRecords
} from '../../utils/diaperStorage'

interface DiaperState {
  diaperList: DiaperItem[]
  currentDate: string
  isLoading: boolean
  error: string | null
}

// 获取今天的日期，格式为 YYYYMMDD
const getTodayDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const initialState: DiaperState = {
  diaperList: [],
  currentDate: getTodayDate(),
  isLoading: false,
  error: null
}

export const fetchDiaperList = createAsyncThunk<DiaperListResponse, string>(
  'diaper/fetchDiaperList',
  async (babyId, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { diaper: DiaperState }
      // 转换日期格式为 YYYY-MM-DD
      const formattedDate = state.diaper.currentDate.replace(
        /(\d{4})(\d{2})(\d{2})/,
        '$1-$2-$3'
      )
      const response = await getDiaperListByDateReq(babyId, formattedDate)

      // 保存到本地存储
      if (response.code === 0 || response.code === 200) {
        const records = response.data?.items || []
        await saveDiaperRecords(records)
      }

      return response
    } catch (error: any) {
      // 失败时从本地存储获取数据
      try {
        const localRecords = await getDiaperRecords()
        return {
          code: 0,
          message: '从本地存储获取数据',
          data: { items: localRecords }
        } as DiaperListResponse
      } catch (localError) {
        return rejectWithValue(
          error.response?.data?.message || error.message || '获取尿布记录失败'
        )
      }
    }
  }
)

export const addDiaperItem = createAsyncThunk<
  ApiResponse,
  { babyId: string; data: DiaperRecordRequest }
>(
  'diaper/addDiaperItem',
  async ({ babyId, data }, { getState, rejectWithValue }) => {
    try {
      const response = await addDiaperRecordReq(babyId, data)

      // 更新本地存储
      if (response.code === 0 || response.code === 200) {
        const state = getState() as { diaper: DiaperState }
        const updatedRecords = state.diaper.diaperList
        await saveDiaperRecords(updatedRecords)
      }

      return response
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || '添加尿布记录失败'
      )
    }
  }
)

export const updateDiaperItem = createAsyncThunk<
  ApiResponse,
  { babyId: string; diaperId: string; data: DiaperRecordRequest }
>(
  'diaper/updateDiaperItem',
  async (
    { babyId, diaperId, data },
    { getState, rejectWithValue, dispatch }
  ) => {
    try {
      const response = await updateDiaperRecordReq(babyId, diaperId, data)

      // 更新本地存储
      if (response.code === 0 || response.code === 200) {
        const state = getState() as { diaper: DiaperState }
        const updatedRecords = state.diaper.diaperList
        await saveDiaperRecords(updatedRecords)
      }

      return response
    } catch (error: any) {
      // 错误时回滚到原始记录
      const state = getState() as { diaper: DiaperState }
      const originalRecord = state.diaper.diaperList.find(
        item => item.diaper_id === diaperId
      )
      if (originalRecord) {
        dispatch(updateDiaperRecord(originalRecord))
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || '更新尿布记录失败'
      )
    }
  }
)

export const deleteDiaperItem = createAsyncThunk<
  ApiResponse,
  { babyId: string; diaperId: string }
>(
  'diaper/deleteDiaperItem',
  async ({ babyId, diaperId }, { getState, rejectWithValue, dispatch }) => {
    try {
      const response = await deleteDiaperRecordReq(babyId, diaperId)

      // 更新本地存储
      if (response.code === 0 || response.code === 200) {
        const state = getState() as { diaper: DiaperState }
        const updatedRecords = state.diaper.diaperList
        await saveDiaperRecords(updatedRecords)
      }

      return response
    } catch (error: any) {
      // 错误时恢复记录
      const state = getState() as { diaper: DiaperState }
      const deletedRecord = state.diaper.diaperList.find(
        item => item.diaper_id === diaperId
      )
      if (deletedRecord) {
        dispatch(addDiaperRecord(deletedRecord))
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || '删除尿布记录失败'
      )
    }
  }
)

export const clearDiaperDataAsync = createAsyncThunk(
  'diaper/clearDiaperDataAsync',
  async (_, { rejectWithValue }) => {
    try {
      await clearDiaperRecords()
      return { success: true }
    } catch (error: any) {
      return rejectWithValue(error.message || '清除尿布记录失败')
    }
  }
)

const diaperSlice = createSlice({
  name: 'diaper',
  initialState,
  reducers: {
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload
    },
    clearDiaperData: state => {
      state.diaperList = []
      state.currentDate = getTodayDate()
      state.error = null
    },
    addDiaperRecord: (state, action: PayloadAction<DiaperItem>) => {
      // 将新记录添加到列表开头
      state.diaperList.unshift(action.payload)
    },
    updateDiaperRecord: (state, action: PayloadAction<DiaperItem>) => {
      // 找到并更新对应的记录
      const index = state.diaperList.findIndex(
        item => item.diaper_id === action.payload.diaper_id
      )
      if (index !== -1) {
        state.diaperList[index] = action.payload
      }
    },
    deleteDiaperRecord: (state, action: PayloadAction<string>) => {
      // 删除对应的记录
      state.diaperList = state.diaperList.filter(
        item => item.diaper_id !== action.payload
      )
    }
  },
  extraReducers: builder => {
    builder
      // fetchDiaperList
      .addCase(fetchDiaperList.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDiaperList.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload?.code === 0 || action.payload?.code === 200) {
          state.diaperList = action.payload.data?.items || []
        } else {
          state.error = action.payload?.message || '获取换尿布记录失败'
        }
      })
      .addCase(fetchDiaperList.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // addDiaperItem
      .addCase(addDiaperItem.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addDiaperItem.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(addDiaperItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // updateDiaperItem
      .addCase(updateDiaperItem.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDiaperItem.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(updateDiaperItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // deleteDiaperItem
      .addCase(deleteDiaperItem.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteDiaperItem.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(deleteDiaperItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // clearDiaperDataAsync
      .addCase(clearDiaperDataAsync.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(clearDiaperDataAsync.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(clearDiaperDataAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setCurrentDate,
  clearDiaperData,
  addDiaperRecord,
  updateDiaperRecord,
  deleteDiaperRecord
} = diaperSlice.actions

export default diaperSlice.reducer
