import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from '..'
import {
  GrowthReportApiData,
  GrowthReportRequest,
  getGrowthReport,
  makeGrowthReportCacheKey
} from '@/api/ai'

type ReportStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface GrowthReportCacheItem {
  status: ReportStatus
  fetchedAt?: number
  error?: string
  request?: GrowthReportRequest
  report?: GrowthReportApiData
}

interface AIReportState {
  byKey: Record<string, GrowthReportCacheItem>
}

const initialState: AIReportState = {
  byKey: {}
}

export const fetchGrowthReport = createAsyncThunk<
  { cacheKey: string; report: GrowthReportApiData; fetchedAt: number },
  GrowthReportRequest,
  { rejectValue: string }
>('aiReport/fetchGrowthReport', async (params, { rejectWithValue }) => {
  try {
    const report = await getGrowthReport(params)
    return {
      cacheKey: makeGrowthReportCacheKey(params),
      report,
      fetchedAt: Date.now()
    }
  } catch (error: any) {
    return rejectWithValue(error?.message || '生成报告失败')
  }
})

const aiReportSlice = createSlice({
  name: 'aiReport',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGrowthReport.pending, (state, action) => {
        const cacheKey = makeGrowthReportCacheKey(action.meta.arg)
        state.byKey[cacheKey] = {
          ...state.byKey[cacheKey],
          status: 'loading',
          error: undefined,
          request: action.meta.arg
        }
      })
      .addCase(fetchGrowthReport.fulfilled, (state, action) => {
        const { cacheKey, report, fetchedAt } = action.payload
        state.byKey[cacheKey] = {
          status: 'succeeded',
          report,
          fetchedAt,
          error: undefined,
          request: state.byKey[cacheKey]?.request
        }
      })
      .addCase(fetchGrowthReport.rejected, (state, action) => {
        const cacheKey = makeGrowthReportCacheKey(action.meta.arg)
        state.byKey[cacheKey] = {
          ...state.byKey[cacheKey],
          status: 'failed',
          error: action.payload || action.error.message || '生成报告失败'
        }
      })
  }
})

export const selectGrowthReportCacheItemByKey = (
  state: RootState,
  cacheKey: string
) => state.aiReport.byKey[cacheKey]

export const selectGrowthReportCacheItem = (
  state: RootState,
  params: GrowthReportRequest
) => state.aiReport.byKey[makeGrowthReportCacheKey(params)]

export default aiReportSlice.reducer
