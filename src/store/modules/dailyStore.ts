import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '..'
import { fetchDiaperList as fetchDiaperListAction } from './diaperStore'
import { fetchFeedingList as fetchFeedingListAction } from './feedingStore'
import { fetchSleepList as fetchSleepListAction } from './sleepStore'
import { DiaperItem } from '../../types/diaper'
import { FeedingItem } from '../../types/feeding'
import { SleepRecord } from '../../types/sleep'

interface DailyState {
  currentDate: string
  isLoading: boolean
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
  isLoading: false
}

export const updateDateAndRefresh = createAsyncThunk<
  void,
  { babyId: string; date: string }
>('daily/updateDateAndRefresh', async ({ babyId, date }, { dispatch }) => {
  // 先更新日期
  dispatch(setCurrentDate(date))

  // 同时触发三个仓库的 fetch 请求
  await Promise.all([
    dispatch(fetchDiaperListAction(babyId)),
    dispatch(fetchFeedingListAction({ babyId, date })),
    dispatch(fetchSleepListAction({ babyId, date }))
  ])
})

export const initDailyData = createAsyncThunk<void, string>(
  'daily/initDailyData',
  async (babyId, { dispatch, getState }) => {
    const date = (getState() as RootState).daily.currentDate

    // 同时触发三个仓库的 fetch 请求
    await Promise.all([
      dispatch(fetchDiaperListAction(babyId)),
      dispatch(fetchFeedingListAction({ babyId, date })),
      dispatch(fetchSleepListAction({ babyId, date }))
    ])
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
    id: item.feed_id,
    type: 'feeding' as const,
    time: item.start_time,
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
