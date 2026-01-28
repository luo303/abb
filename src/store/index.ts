import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/userStore'
import chatReducer from './modules/ChatStore'

const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
