import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/userStore'
import chatReducer from './modules/ChatStore'
import babyReducer from './modules/BabyStore'
import partnerReducer from './modules/PartnerStore'
import postReducer from './modules/PostStore'

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    baby: babyReducer,
    partner: partnerReducer,
    post: postReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
