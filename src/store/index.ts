import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/userStore'
import chatReducer from './modules/ChatStore'
import babyReducer from './modules/BabyStore'
import messengerReducer from './modules/MessengerStore'
import partnerReducer from './modules/PartnerStore'
import postReducer from './modules/PostStore'
import followReducer from './modules/FollowStore'
import diaperReducer from './modules/diaperStore'
import feedingReducer from './modules/feedingStore'
import sleepReducer from './modules/sleepStore'
import dailyReducer from './modules/dailyStore'

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    baby: babyReducer,
    messenger: messengerReducer,
    partner: partnerReducer,
    post: postReducer,
    follow: followReducer,
    diaper: diaperReducer,
    feeding: feedingReducer,
    sleep: sleepReducer,
    daily: dailyReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
