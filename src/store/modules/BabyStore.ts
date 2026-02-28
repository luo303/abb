import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  addBabyReq,
  fetchBabiesReq,
  getBabyProfileReq,
  getGrowthCurveReq,
  BabyData,
  ApiResponse,
  AddBabyResponse,
  BabyBasicInfo,
  FetchBabiesResponse,
  BabyProfile,
  GrowthCurveParams,
  GrowthCurveResponse,
  GrowthCurveItem
} from '../../api/baby'

interface BabyState {
  loading: boolean
  error: string | null
  currentBabyId: string | null
  babiesList: BabyBasicInfo[]
  currentBabyDetail: BabyProfile | null
  growthCurve: {
    height: GrowthCurveItem[]
    weight: GrowthCurveItem[]
    head: GrowthCurveItem[]
  }
}

const initialState: BabyState = {
  loading: false,
  error: null,
  currentBabyId: null,
  babiesList: [],
  currentBabyDetail: null,
  growthCurve: {
    height: [],
    weight: [],
    head: []
  }
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

export const fetchBabyProfile = createAsyncThunk<
  ApiResponse<BabyProfile>,
  string
>('baby/fetchBabyProfile', async (babyId, { rejectWithValue }) => {
  try {
    const response = await getBabyProfileReq(babyId)
    return response as unknown as ApiResponse<BabyProfile>
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

export const fetchGrowthCurve = createAsyncThunk<
  ApiResponse<GrowthCurveResponse>,
  GrowthCurveParams
>('baby/fetchGrowthCurve', async (params, { rejectWithValue }) => {
  try {
    const response = await getGrowthCurveReq(params)
    console.log(response)

    return response as unknown as ApiResponse<GrowthCurveResponse>
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
    },
    setCurrentBabyId: (state, action: PayloadAction<string>) => {
      state.currentBabyId = action.payload
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
      // Fetch Baby Profile
      .addCase(fetchBabyProfile.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBabyProfile.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.code === 0) {
          state.currentBabyDetail = action.payload.data!
        } else {
          state.error = action.payload?.message || '获取宝宝详情失败'
        }
      })
      .addCase(fetchBabyProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Fetch Growth Curve
      .addCase(fetchGrowthCurve.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGrowthCurve.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.code === 0) {
          const { metric, items } = action.payload.data!
          if (metric === 'height') {
            state.growthCurve.height = items
          } else if (metric === 'weight') {
            state.growthCurve.weight = items
          } else if (metric === 'head_circumference') {
            state.growthCurve.head = items
          }
        } else {
          state.error = action.payload?.message || '获取成长曲线失败'
        }
      })
      .addCase(fetchGrowthCurve.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { resetBabyState, clearCurrentBabyId, setCurrentBabyId } =
  babySlice.actions
export default babySlice.reducer
