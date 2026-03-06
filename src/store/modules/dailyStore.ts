import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'
import { fetchDiaperList as fetchDiaperListAction } from './diaperStore'
import { fetchFeedingList as fetchFeedingListAction } from './feedingStore'
import { fetchSleepList as fetchSleepListAction } from './sleepStore'
import {
  getDailyStatistics as getDailyStatisticsApi,
  DailyStatisticsResponse
} from '../../api/daily'
import { DiaperItem } from '../../types/diaper'
import { FeedingItem } from '../../types/feeding'
import { SleepRecord } from '../../types/sleep'
import { DailyStatistics as DailyStatisticsType } from '../../types/daily'
import {
  saveDailyStatistics,
  getDailyStatistics,
  clearDailyStatistics
} from '../../utils/dailyStorage'

interface DailyState {
  currentDate: string
  isLoading: boolean
  statistics: DailyStatisticsType | null
}

// 获取今天的日期，格式为 YYYYMMDD
const getTodayDate = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const initialState: DailyState = {
  currentDate: getTodayDate(),
  isLoading: false,
  statistics: null
}

export const updateDateAndRefresh = createAsyncThunk<
  void,
  { babyId: string; date: string }
>('daily/updateDateAndRefresh', async ({ babyId, date }, { dispatch }) => {
  // 先更新日期
  dispatch(setCurrentDate(date))

  // 同时触发四个仓库的 fetch 请求，包括统计信息
  await Promise.all([
    dispatch(fetchDiaperListAction({ babyId, date })),
    dispatch(fetchFeedingListAction({ babyId, date })),
    dispatch(fetchSleepListAction({ babyId, date })),
    dispatch(fetchDailyStatistics({ babyId, date }))
  ])
})

export const initDailyData = createAsyncThunk<void, string>(
  'daily/initDailyData',
  async (babyId, { dispatch, getState }) => {
    const date = (getState() as RootState).daily.currentDate

    // 同时触发三个仓库的 fetch 请求
    await Promise.all([
      dispatch(fetchDiaperListAction({ babyId, date })),
      dispatch(fetchFeedingListAction({ babyId, date })),
      dispatch(fetchSleepListAction({ babyId, date })),
      dispatch(fetchDailyStatistics({ babyId, date }))
    ])
  }
)

export const fetchDailyStatistics = createAsyncThunk<
  DailyStatisticsType,
  { babyId: string; date: string }
>(
  'daily/fetchDailyStatistics',
  async ({ babyId, date }, { rejectWithValue }) => {
    try {
      // 优先从API获取数据
      const response = await getDailyStatisticsApi(babyId, date)

      // 处理响应数据，转换为本地统计类型
      if (
        response.code === 0 ||
        response.code === 200 ||
        String(response.code) === '0'
      ) {
        const data = response.data
        if (data) {
          // 确保items是数组
          const items = Array.isArray(data.items) ? data.items : []

          // 从items中提取各类型的记录
          const feedingItems = items.filter(
            item => item && item.type === 'feeding'
          )
          const sleepItems = items.filter(item => item && item.type === 'sleep')
          const diaperItems = items.filter(
            item => item && item.type === 'diaper'
          )

          // 计算喂养统计
          const feedingStats = {
            totalCount:
              typeof data.feeding_count === 'number' ? data.feeding_count : 0,
            lastTime:
              feedingItems.length > 0
                ? Math.max(...feedingItems.map(item => item.time || 0))
                : undefined
          }

          // 计算睡眠统计
          const sleepStats = {
            totalDuration:
              typeof data.sleep_duration_ms === 'number'
                ? data.sleep_duration_ms
                : 0,
            totalCount: sleepItems.length,
            lastTime:
              sleepItems.length > 0
                ? Math.max(...sleepItems.map(item => item.time || 0))
                : undefined
          }

          // 计算 diaper 统计
          const peeCount = diaperItems.filter(
            item => item && item.sub_type === 'pee'
          ).length
          const poopCount = diaperItems.filter(
            item => item && item.sub_type === 'poop'
          ).length
          const diaperStats = {
            totalCount:
              typeof data.diaper_count === 'number' ? data.diaper_count : 0,
            peeCount,
            poopCount,
            lastTime:
              diaperItems.length > 0
                ? Math.max(...diaperItems.map(item => item.time || 0))
                : undefined
          }

          const processedData = {
            feeding: feedingStats,
            sleep: sleepStats,
            diaper: diaperStats,
            date
          }

          // 保存到本地存储
          await saveDailyStatistics(babyId, date, processedData)

          return processedData
        }
      }

      throw new Error('获取统计信息失败')
    } catch (error: any) {
      // 尝试从本地存储获取
      try {
        const localData = await getDailyStatistics(babyId, date)
        if (localData) {
          return localData
        }
      } catch (localError) {
        console.error('从本地存储获取数据失败:', localError)
      }
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const dailySlice = createSlice({
  name: 'daily',
  initialState,
  reducers: {
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload
    }
  },
  extraReducers: builder => {
    builder
      .addCase(updateDateAndRefresh.pending, state => {
        state.isLoading = true
      })
      .addCase(updateDateAndRefresh.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(updateDateAndRefresh.rejected, state => {
        state.isLoading = false
      })
      .addCase(initDailyData.pending, state => {
        state.isLoading = true
      })
      .addCase(initDailyData.fulfilled, state => {
        state.isLoading = false
      })
      .addCase(initDailyData.rejected, state => {
        state.isLoading = false
      })
      .addCase(fetchDailyStatistics.pending, state => {
        state.isLoading = true
      })
      .addCase(fetchDailyStatistics.fulfilled, (state, action) => {
        state.isLoading = false
        state.statistics = action.payload
      })
      .addCase(fetchDailyStatistics.rejected, state => {
        state.isLoading = false
        state.statistics = null
      })
  }
})

export const { setCurrentDate } = dailySlice.actions

// 统一的记录类型
interface UnifiedRecord {
  id: string
  type: 'diaper' | 'feeding' | 'sleep'
  time: number
  data: DiaperItem | FeedingItem | SleepRecord
}

// 选择器：合并并排序所有记录
export const selectSortedDailyRecords = (state: RootState): UnifiedRecord[] => {
  const { diaperList } = state.diaper
  const { feedingList } = state.feeding
  const { sleepList } = state.sleep

  // 转换为统一格式
  const diaperRecords: UnifiedRecord[] = diaperList.map(item => ({
    id: item.diaper_id,
    type: 'diaper' as const,
    time: item.change_time,
    data: item
  }))

  const feedingRecords: UnifiedRecord[] = feedingList.map(item => ({
    id: item.feeding_id,
    type: 'feeding' as const,
    time: item.feed_time,
    data: item
  }))

  const sleepRecords: UnifiedRecord[] = sleepList.map(item => ({
    id: item.session_id,
    type: 'sleep' as const,
    time: item.started_at,
    data: item
  }))

  // 合并并按时间降序排序
  return [...diaperRecords, ...feedingRecords, ...sleepRecords].sort(
    (a, b) => b.time - a.time
  )
}

export default dailySlice.reducer
