import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'
import { historyList } from '../../data/mock/homePosts'
import { Message, HistoryItem, ChatState } from '../../types/AIchat'
import { GetSessionMessages } from '../../api/ai'

const STORAGE_KEY_HISTORY = 'chat_history_list'

const initialState: ChatState = {
  messages: [],
  historyList: historyList,
  currentConversationId: null,
  isLoading: false,
  search_private: false,
  search_public: true
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
      if (state.currentConversationId === id) {
        state.currentConversationId = null
        state.messages = []
      }
    },
    setCurrentConversationId: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload
    },
    selectConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    updateLastMessageContent: (state, action: PayloadAction<string>) => {
      if (state.messages.length > 0) {
        const lastMsg = state.messages[state.messages.length - 1]
        if (lastMsg.role === 'assistant') {
          lastMsg.content += action.payload
        }
      }
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
  selectConversation,
  togglePublicEnabled,
  togglePrivateEnabled,
  setLoading,
  updateLastMessageContent
} = chatSlice.actions

// Helper: 保存历史列表
const saveHistoryToStorage = async (list: HistoryItem[]) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY_HISTORY, JSON.stringify(list))
  } catch (error) {
    console.error('Failed to save history list:', error)
  }
}

// 异步 Action：从 API 获取消息记录
export const fetchHistoryMessages =
  (sessionId: string) => async (dispatch: Dispatch) => {
    dispatch(setLoading(true))
    try {
      const res: any = await GetSessionMessages(sessionId)
      if (res.code === 0 && res.data) {
        dispatch(setMessages(res.data.messages))
      } else {
        dispatch(setMessages([]))
      }
    } catch (error) {
      console.error('Failed to fetch session messages:', error)
      dispatch(setMessages([]))
    } finally {
      dispatch(setLoading(false))
    }
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
        dispatch(selectConversation(savedId))
        // 从 API 获取消息
        // @ts-ignore
        dispatch(fetchHistoryMessages(savedId))
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
  }

// 异步 Action：切换并持久化会话 ID
export const switchConversation =
  (id: string) => async (dispatch: Dispatch, getState: any) => {
    dispatch(selectConversation(id))
    // 从 API 获取消息
    // @ts-ignore
    dispatch(fetchHistoryMessages(id))

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
    // 新会话初始为空消息
    dispatch(clearMessages())

    // 3. 持久化
    try {
      await SecureStore.setItemAsync('currentConversationId', id)
    } catch (error) {
      console.error('Failed to create chat session:', error)
    }
  }

export default chatSlice.reducer
