import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  addBabyReq,
  fetchBabiesReq,
  BabyData,
  ApiResponse,
  AddBabyResponse,
  BabyBasicInfo,
  FetchBabiesResponse
} from '../../api/baby'

interface BabyState {
  loading: boolean
  error: string | null
  currentBabyId: string | null
  babiesList: BabyBasicInfo[]
}

const initialState: BabyState = {
  loading: false,
  error: null,
  currentBabyId: null,
  babiesList: []
}

export const addBaby = createAsyncThunk<ApiResponse<AddBabyResponse>, BabyData>(
  'baby/addBaby',
  async (data: BabyData, { rejectWithValue }) => {
    try {
      const response = await addBabyReq(data)
      return response as unknown as ApiResponse<AddBabyResponse>
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

export const fetchBabies = createAsyncThunk<
  ApiResponse<FetchBabiesResponse>,
  void
>('baby/fetchBabies', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchBabiesReq()
    return response as unknown as ApiResponse<FetchBabiesResponse>
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

const babySlice = createSlice({
  name: 'baby',
  initialState,
  reducers: {
    resetBabyState: state => {
      state.loading = false
      state.error = null
      // 不清除 currentBabyId，以便后续使用
    },
    clearCurrentBabyId: state => {
      state.currentBabyId = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(addBaby.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(addBaby.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.code === 0) {
          state.currentBabyId = action.payload.data!.baby_id
        } else {
          state.error = action.payload?.message || '未知错误'
        }
      })
      .addCase(addBaby.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Babies
      .addCase(fetchBabies.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBabies.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.code === 0) {
          state.babiesList = action.payload.data?.babies || []
          // 如果当前没有选中的宝宝，且列表不为空，默认选中第一个
          if (!state.currentBabyId && state.babiesList.length > 0) {
            state.currentBabyId = state.babiesList[0].baby_id
          }
        } else {
          state.error = action.payload?.message || '未知错误'
        }
      })
      .addCase(fetchBabies.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { resetBabyState, clearCurrentBabyId } = babySlice.actions
export default babySlice.reducer
