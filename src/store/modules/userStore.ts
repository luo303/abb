import { createSlice } from '@reduxjs/toolkit'
//expo提供的手机本地持久化存储，相当于localStorage
import * as SecureStore from 'expo-secure-store'

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: SecureStore.getItem('token') || ''
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
      SecureStore.setItem('token', action.payload)
    },
    clearToken: state => {
      state.token = ''
      SecureStore.deleteItemAsync('token')
    }
  }
})

export const { setToken, clearToken } = userSlice.actions
export default userSlice.reducer
