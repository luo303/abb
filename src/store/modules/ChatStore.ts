import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'
import { historyList } from '../../data/mock/homePosts'
import { Message, HistoryItem, ChatState } from '../../types/AIchat'

const STORAGE_KEY_HISTORY = 'chat_history_list'

const initialState: ChatState = {
  messages: [],
  historyList: historyList,
  currentConversationId: null,
  conversations: {},
  search_private: false,
  search_public: false
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    togglePublicEnabled: state => {
      state.search_public = !state.search_public
    },
    togglePrivateEnabled: state => {
      state.search_private = !state.search_private
    },
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
    setHistoryList: (state, action: PayloadAction<HistoryItem[]>) => {
      state.historyList = action.payload
    },
    deleteHistoryItem: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.historyList = state.historyList.filter(
        item => item.session_id !== id
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
    // 新增：更新指定会话的消息记录（用于加载数据时同步 state）
    updateConversation: (
      state,
      action: PayloadAction<{ id: string; messages: Message[] }>
    ) => {
      const { id, messages } = action.payload
      state.conversations[id] = messages
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
  setHistoryList,
  deleteHistoryItem,
  setCurrentConversationId,
  updateConversation,
  selectConversation,
  togglePublicEnabled,
  togglePrivateEnabled
} = chatSlice.actions

// Helper: 保存历史列表
const saveHistoryToStorage = async (list: HistoryItem[]) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY_HISTORY, JSON.stringify(list))
  } catch (error) {
    console.error('Failed to save history list:', error)
  }
}

// Helper: 模拟后端 API 获取详细对话
const fetchConversationMessages = async (id: string): Promise<Message[]> => {
  // TODO: 这里实现向后端发送请求的逻辑
  // const response = await api.get(`/conversations/${id}/messages`)
  // return response.data
  return []
}

// 异步 Action：加载初始数据（历史列表和上次会话）
export const loadInitialData =
  () => async (dispatch: Dispatch, getState: any) => {
    try {
      // 1. 加载历史列表
      const historyJson = await SecureStore.getItemAsync(STORAGE_KEY_HISTORY)
      if (historyJson) {
        const list = JSON.parse(historyJson)
        dispatch(setHistoryList(list))
      }

      // 2. 加载上次会话 ID
      const savedId = await SecureStore.getItemAsync('currentConversationId')
      if (savedId) {
        // 3. TODO: 调用后端 API 获取该会话的详细消息
        // const messages = await fetchConversationMessages(savedId)
        // dispatch(updateConversation({ id: savedId, messages }))

        // 恢复 ID 并选中会话
        dispatch(selectConversation(savedId))
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    }
  }

// 异步 Action：删除历史项并同步存储
export const removeHistoryItem =
  (id: string) => async (dispatch: Dispatch, getState: any) => {
    dispatch(deleteHistoryItem(id))
    const state = getState().chat
    saveHistoryToStorage(state.historyList)
    // TODO: 这里可以添加通知后端删除会话的逻辑
  }

// 异步 Action：切换并持久化会话 ID
export const switchConversation =
  (id: string) => async (dispatch: Dispatch, getState: any) => {
    // 检查内存中是否已有消息，如果没有则尝试从后端获取
    const state = getState().chat
    if (!state.conversations[id] || state.conversations[id].length === 0) {
      // TODO: 调用后端 API 获取该会话的详细消息
      // const messages = await fetchConversationMessages(id)
      // dispatch(updateConversation({ id, messages }))
    }

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
export const createNewSession =
  (id: string) => async (dispatch: Dispatch, getState: any) => {
    // 1. 添加历史记录
    dispatch(
      addHistoryItem({
        session_id: id,
        session_title: '新对话',
        session_date: new Date().toLocaleDateString()
      })
    )
    // 保存历史记录
    const state = getState().chat
    saveHistoryToStorage(state.historyList)

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
