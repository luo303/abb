import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'
import { historyList } from '../../data/mock/homePosts'
import { Message, HistoryItem, ChatState } from '../../types/AIchat'

const initialState: ChatState = {
  messages: [],
  historyList: historyList,
  currentConversationId: null,
  conversations: {}
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
      if (state.currentConversationId) {
        if (!state.conversations[state.currentConversationId]) {
          state.conversations[state.currentConversationId] = []
        }
        state.conversations[state.currentConversationId].push(action.payload)
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload
    },
    clearMessages: state => {
      state.messages = []
    },
    addHistoryItem: (state, action: PayloadAction<HistoryItem>) => {
      state.historyList.unshift(action.payload)
    },
    deleteHistoryItem: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.historyList = state.historyList.filter(
        item => item.conversation_id !== id
      )
      delete state.conversations[id]
      if (state.currentConversationId === id) {
        state.currentConversationId = null
        state.messages = []
      }
    },
    setCurrentConversationId: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload
    },
    // 新增：选择会话，同时加载对应的消息记录
    selectConversation: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.currentConversationId = id
      state.messages = state.conversations[id] || []
    }
  }
})

export const {
  addMessage,
  setMessages,
  clearMessages,
  addHistoryItem,
  deleteHistoryItem,
  setCurrentConversationId,
  selectConversation
} = chatSlice.actions

// 异步 Action：初始化会话（从 SecureStore 读取上次的会话 ID）
export const initChatSession = () => async (dispatch: Dispatch) => {
  try {
    const savedId = await SecureStore.getItemAsync('currentConversationId')
    if (savedId) {
      dispatch(selectConversation(savedId))
    }
  } catch (error) {
    console.error('Failed to load chat session:', error)
  }
}

// 异步 Action：切换并持久化会话 ID
export const switchConversation =
  (id: string) => async (dispatch: Dispatch) => {
    dispatch(selectConversation(id))
    try {
      await SecureStore.setItemAsync('currentConversationId', id)
    } catch (error) {
      console.error('Failed to save chat session:', error)
    }
  }

// 异步 Action：重置会话（用于点击“新对话”时）
export const resetSession = () => async (dispatch: Dispatch) => {
  dispatch(setCurrentConversationId(null))
  dispatch(clearMessages())
  try {
    await SecureStore.deleteItemAsync('currentConversationId')
  } catch (error) {
    console.error('Failed to reset chat session:', error)
  }
}

// 异步 Action：创建新会话（用于发送第一条消息时）
export const createNewSession = (id: string) => async (dispatch: Dispatch) => {
  // 1. 添加历史记录
  dispatch(
    addHistoryItem({
      conversation_id: id,
      conversation_title: '新对话',
      conversation_date: new Date().toLocaleDateString()
    })
  )
  // 2. 选中新会话（这会更新 currentConversationId）
  dispatch(selectConversation(id))
  // 3. 持久化
  try {
    await SecureStore.setItemAsync('currentConversationId', id)
  } catch (error) {
    console.error('Failed to create chat session:', error)
  }
}

export default chatSlice.reducer
