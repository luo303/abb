import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getDiaperListByDateReq, DiaperListResponse } from '../../api/diaper'
import { DiaperItem } from '../../types/diaper'

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
      const response = await getDiaperListByDateReq(
        babyId,
        state.diaper.currentDate
      )
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
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
