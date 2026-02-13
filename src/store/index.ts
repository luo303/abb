import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/userStore'
import chatReducer from './modules/ChatStore'
import babyReducer from './modules/BabyStore'

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    baby: babyReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
