import { createSlice } from '@reduxjs/toolkit'
//expo提供的手机本地持久化存储，相当于localStorage
import * as SecureStore from 'expo-secure-store'
import { UserMeResponse } from '../../api/profile'

interface UserState {
  token: string
  rememberMe: boolean
  userInfo: UserMeResponse | null
}

const initialState: UserState = {
  token: SecureStore.getItem('token') || '',
  rememberMe: true,
  userInfo: null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
      state.rememberMe && SecureStore.setItem('token', action.payload)
    },
    clearToken: state => {
      state.token = ''
      SecureStore.deleteItemAsync('token')
      state.userInfo = null
    },
    setRememberMe: (state, action) => {
      state.rememberMe = action.payload
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload
    },
    clearUserInfo: state => {
      state.userInfo = null
    }
  }
})

export const {
  setToken,
  clearToken,
  setRememberMe,
  setUserInfo,
  clearUserInfo
} = userSlice.actions
export default userSlice.reducer
