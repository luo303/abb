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
  GrowthCurveItem,
  UpsertGrowthRecordParams,
  UpsertGrowthRecordResponse,
  upsertGrowthRecordReq
} from '../../api/baby'
import * as SecureStore from 'expo-secure-store'

interface BabyState {
  loading: boolean
  error: string | null
  currentBabyId: string | null
  babiesList: BabyBasicInfo[]
  currentBabyDetail: BabyProfile | null
  babiesFetched: boolean
  babyProfileFetchedId: string | null
  growthCurve: {
    height: GrowthCurveItem[]
    weight: GrowthCurveItem[]
    head: GrowthCurveItem[]
  }
}

const STORAGE_KEY_CURRENT_BABY_ID = 'current_baby_id'

const initialState: BabyState = {
  loading: false,
  error: null,
  currentBabyId: null,
  babiesList: [],
  currentBabyDetail: null,
  babiesFetched: false,
  babyProfileFetchedId: null,
  growthCurve: {
    height: [],
    weight: [],
    head: []
  }
}

const clearGrowthCurve = (state: BabyState) => {
  state.growthCurve.height = []
  state.growthCurve.weight = []
  state.growthCurve.head = []
}

const upsertGrowthItem = (
  list: GrowthCurveItem[],
  time: number,
  value: number
) => {
  const index = list.findIndex(item => item.time === time)
  if (index >= 0) {
    list[index] = { time, value }
    return
  }
  list.push({ time, value })
  list.sort((a, b) => a.time - b.time)
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
>(
  'baby/fetchBabies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchBabiesReq()
      return response as unknown as ApiResponse<FetchBabiesResponse>
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as { baby: BabyState }
      if (state.baby.loading) return false
      if (state.baby.babiesFetched && state.baby.babiesList.length > 0) {
        return false
      }
      return true
    }
  }
)

export const fetchBabyProfile = createAsyncThunk<
  ApiResponse<BabyProfile>,
  string
>(
  'baby/fetchBabyProfile',
  async (babyId, { rejectWithValue }) => {
    try {
      const response = await getBabyProfileReq(babyId)
      console.log(response)
      return response as unknown as ApiResponse<BabyProfile>
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  },
  {
    condition: (babyId, { getState }) => {
      const state = getState() as { baby: BabyState }
      if (state.baby.loading) return false
      if (
        state.baby.currentBabyDetail?.baby_id === babyId &&
        state.baby.babyProfileFetchedId === babyId
      ) {
        return false
      }
      return true
    }
  }
)

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

export const upsertGrowthRecord = createAsyncThunk<
  ApiResponse<UpsertGrowthRecordResponse>,
  UpsertGrowthRecordParams
>('baby/upsertGrowthRecord', async (params, { rejectWithValue }) => {
  try {
    const response = await upsertGrowthRecordReq(params)
    return response as unknown as ApiResponse<UpsertGrowthRecordResponse>
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message)
  }
})

const babySlice = createSlice({
  name: 'baby',
  initialState,
  reducers: {
    resetBabyAll: () => initialState,
    resetBabyState: state => {
      state.loading = false
      state.error = null
      // 不清除 currentBabyId，以便后续使用
    },
    clearCurrentBabyId: state => {
      state.currentBabyId = null
      state.currentBabyDetail = null
      clearGrowthCurve(state)
    },
    setCurrentBabyId: (state, action: PayloadAction<string>) => {
      if (state.currentBabyId === action.payload) return
      state.currentBabyId = action.payload
      state.currentBabyDetail = null
      clearGrowthCurve(state)
    },
    applyGrowthRecordLocal: (
      state,
      action: PayloadAction<UpsertGrowthRecordParams>
    ) => {
      const { baby_id, record_time, height, weight, head_circumference } =
        action.payload
      if (state.currentBabyId !== baby_id) return
      upsertGrowthItem(state.growthCurve.height, record_time, height)
      upsertGrowthItem(state.growthCurve.weight, record_time, weight)
      upsertGrowthItem(state.growthCurve.head, record_time, head_circumference)
      if (
        state.currentBabyDetail &&
        state.currentBabyDetail.baby_id === baby_id
      ) {
        state.currentBabyDetail = {
          ...state.currentBabyDetail,
          height,
          weight,
          head_circumference,
          record_time
        }
      }
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
        state.babiesFetched = true
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
        state.babiesFetched = true
        state.error = action.payload as string
      })
      // Fetch Baby Profile
      .addCase(fetchBabyProfile.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBabyProfile.fulfilled, (state, action) => {
        state.loading = false
        const requestedBabyId = action.meta.arg
        state.babyProfileFetchedId = requestedBabyId
        if (requestedBabyId !== state.currentBabyId) {
          return
        }
        if (action.payload?.code === 0) {
          state.currentBabyDetail = action.payload.data!
        } else {
          state.error = action.payload?.message || '获取宝宝详情失败'
        }
      })
      .addCase(fetchBabyProfile.rejected, (state, action) => {
        state.loading = false
        state.babyProfileFetchedId = action.meta.arg
        state.error = action.payload as string
      })
      // Fetch Growth Curve
      .addCase(fetchGrowthCurve.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGrowthCurve.fulfilled, (state, action) => {
        state.loading = false
        const requestedBabyId = action.meta.arg.baby_id
        if (requestedBabyId !== state.currentBabyId) {
          return
        }
        if (action.payload?.code === 0) {
          const { items } = action.payload.data!
          const metric = action.meta.arg.metric
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
      // Upsert Growth Record
      .addCase(upsertGrowthRecord.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(upsertGrowthRecord.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.code !== 0) {
          state.error = action.payload?.message || '保存成长记录失败'
        }
      })
      .addCase(upsertGrowthRecord.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const loadCurrentBabyId = () => async (dispatch: any, getState: any) => {
  try {
    const savedId = await SecureStore.getItemAsync(STORAGE_KEY_CURRENT_BABY_ID)
    if (!savedId) return
    if (getState().baby.currentBabyId) return
    dispatch(setCurrentBabyId(savedId))
  } catch (error) {
    console.error('Failed to load current baby id:', error)
  }
}

export const setCurrentBabyIdPersist =
  (id: string) => async (dispatch: any) => {
    dispatch(setCurrentBabyId(id))
    try {
      await SecureStore.setItemAsync(STORAGE_KEY_CURRENT_BABY_ID, id)
    } catch (error) {
      console.error('Failed to save current baby id:', error)
    }
  }

export const clearAllBabyData = () => async (dispatch: any) => {
  dispatch(resetBabyAll())
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY_CURRENT_BABY_ID)
  } catch (error) {
    console.error('Failed to clear current baby id:', error)
  }
}

export const {
  resetBabyAll,
  resetBabyState,
  clearCurrentBabyId,
  setCurrentBabyId,
  applyGrowthRecordLocal
} = babySlice.actions
export default babySlice.reducer
