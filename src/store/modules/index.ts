// 统一导出所有 store 模块

// 导入所有 reducer
import feedingReducer from './feedingStore'
import dailyReducer from './dailyStore'
import diaperReducer from './diaperStore'
import sleepReducer from './sleepStore'

// 导出所有 reducer
export { feedingReducer, dailyReducer, diaperReducer, sleepReducer }

// 导出所有 action creators (避免重复导出)
export {
  fetchFeedingList,
  addFeedingRecord,
  updateFeedingRecord,
  saveFeedingRecord,
  addFeedingItem,
  updateFeedingItem,
  deleteFeedingItem,
  clearFeedingData
} from './feedingStore'

export {
  updateDateAndRefresh,
  initDailyData,
  fetchDailyStatistics,
  setCurrentDate,
  selectSortedDailyRecords
} from './dailyStore'

export {
  fetchDiaperList,
  addDiaperRecord,
  updateDiaperRecord,
  deleteDiaperRecord,
  clearDiaperData
} from './diaperStore'

export {
  fetchSleepList,
  addSleepRecord,
  updateSleepRecord,
  endSleep,
  deleteSleepRecord,
  clearSleepData
} from './sleepStore'
