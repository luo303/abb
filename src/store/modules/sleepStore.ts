import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getSleepByDate } from '../../api/sleep'
import { SleepRecord } from '../../types/sleep'

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
    const response = await getSleepByDate(babyId, date)
    return response
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

const sleepSlice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {
    addSleepItem: (state, action: PayloadAction<SleepRecord>) => {
      state.sleepList.unshift(action.payload)
    },
    updateSleepItem: (state, action: PayloadAction<SleepRecord>) => {
      const index = state.sleepList.findIndex(
        item => item.session_id === action.payload.session_id
      )
      if (index >= 0) {
        state.sleepList[index] = action.payload
      }
    },
    deleteSleepItem: (state, action: PayloadAction<string>) => {
      state.sleepList = state.sleepList.filter(
        item => item.session_id !== action.payload
      )
    },
    clearSleepData: state => {
      state.sleepList = []
      state.error = null
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
  }
})

export const {
  addSleepItem,
  updateSleepItem,
  deleteSleepItem,
  clearSleepData
} = sleepSlice.actions

export default sleepSlice.reducer
