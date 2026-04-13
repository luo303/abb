import { createSlice, PayloadAction, Dispatch } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Message, HistoryItem, ChatState } from '../../types/AIchat'

const STORAGE_KEY_HISTORY = 'chat_history_list'
const STORAGE_KEY_SESSION_PREFIX = 'chat_messages_'

const initialState: ChatState = {
  messages: [],
  historyList: [],
  currentConversationId: null,
  isLoading: true,
  hasHydrated: false,
  search_private: false
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    resetChatState: () => initialState,
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
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hasHydrated = action.payload
    },
    togglePinHistoryItem: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const index = state.historyList.findIndex(item => item.session_id === id)
      if (index !== -1) {
        const item = state.historyList[index]
        item.isPinned = !item.isPinned

        // 重新排序：置顶的在前面，然后按原来的顺序（假设原来是按时间倒序）
        // 这里我们可以简单地将置顶的移到最前面，取消置顶的移到它该在的位置（如果按时间排序）
        // 但为了简单和稳定，我们直接对整个列表进行排序
        state.historyList.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          // 如果置顶状态相同，保持原有相对顺序（因为原本就是按时间倒序添加的）
          // 但由于 sort 并不保证稳定，且我们没有精确的时间戳字段（只有日期字符串），
          // 所以最好还是依赖 index，但 sort 会改变 index。
          // 实际上，只要我们确保添加时是 unshift，那么列表本身就是按时间倒序的。
          // 我们可以不做额外的基于时间的 sort，只做基于置顶的 sort，但这可能会打乱时间顺序。
          // 更好的做法是：不仅 toggle 属性，还要移动位置。
          return 0
        })
      }
    }
  }
})

export const {
  resetChatState,
  addMessage,
  setMessages,
  clearMessages,
  addHistoryItem,
  setHistoryList,
  deleteHistoryItem,
  setCurrentConversationId,
  selectConversation,
  togglePrivateEnabled,
  setLoading,
  setHydrated,
  togglePinHistoryItem
} = chatSlice.actions

// Helper: 保存历史列表
const saveHistoryToStorage = async (list: HistoryItem[]) => {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY_HISTORY, JSON.stringify(list))
  } catch (error) {
    console.error('Failed to save history list:', error)
  }
}

const loadSessionMessagesFromStorage = async (
  sessionId: string
): Promise<Message[] | null> => {
  try {
    const cache = await AsyncStorage.getItem(
      `${STORAGE_KEY_SESSION_PREFIX}${sessionId}`
    )
    if (!cache) return null
    return JSON.parse(cache)
  } catch (error) {
    console.error('Failed to load session messages cache:', error)
    return null
  }
}

export const saveSessionMessagesToStorage = async (
  sessionId: string,
  messages: Message[]
) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEY_SESSION_PREFIX}${sessionId}`,
      JSON.stringify(messages)
    )
  } catch (error) {
    console.error('Failed to save session messages cache:', error)
  }
}

const removeSessionMessagesFromStorage = async (sessionId: string) => {
  try {
    await AsyncStorage.removeItem(`${STORAGE_KEY_SESSION_PREFIX}${sessionId}`)
  } catch (error) {
    console.error('Failed to remove session messages cache:', error)
  }
}

// 异步 Action：切换置顶状态并同步存储
export const togglePin =
  (id: string) => async (dispatch: Dispatch, getState: any) => {
    dispatch(togglePinHistoryItem(id))
    const state = getState().chat
    saveHistoryToStorage(state.historyList)
  }

// 异步 Action：加载初始数据（历史列表和上次会话）
export const loadInitialData =
  () => async (dispatch: Dispatch, getState: any) => {
    if (getState().chat.hasHydrated) {
      return
    }

    try {
      dispatch(setLoading(true))

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
        const cachedMessages = await loadSessionMessagesFromStorage(savedId)
        if (cachedMessages) {
          dispatch(setMessages(cachedMessages))
        } else {
          dispatch(clearMessages())
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error)
    } finally {
      dispatch(setHydrated(true))
      dispatch(setLoading(false))
    }
  }

// 异步 Action：删除历史项并同步存储
export const removeHistoryItem =
  (id: string) => async (dispatch: Dispatch, getState: any) => {
    dispatch(deleteHistoryItem(id))
    const state = getState().chat
    saveHistoryToStorage(state.historyList)
    await removeSessionMessagesFromStorage(id)
  }

// 异步 Action：切换并持久化会话 ID
export const switchConversation =
  (id: string) => async (dispatch: Dispatch) => {
    dispatch(selectConversation(id))
    const cachedMessages = await loadSessionMessagesFromStorage(id)
    if (cachedMessages) {
      dispatch(setMessages(cachedMessages))
    } else {
      dispatch(clearMessages())
    }
    dispatch(setLoading(false))

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
  dispatch(setLoading(false))
  try {
    await SecureStore.deleteItemAsync('currentConversationId')
  } catch (error) {
    console.error('Failed to reset chat session:', error)
  }
}

export const clearAllChatData = () => async (dispatch: Dispatch) => {
  dispatch(resetChatState())
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY_HISTORY)
    await SecureStore.deleteItemAsync('currentConversationId')
  } catch (error) {
    console.error('Failed to clear chat data:', error)
  }
}

// 异步 Action：创建新会话（用于发送第一条消息时）
export const createNewSession =
  (id: string) => async (dispatch: Dispatch, getState: any) => {
    // 1. 获取当前历史记录数量，用于生成标题
    const currentHistory = getState().chat.historyList
    const newTitle = `会话${currentHistory.length + 1}`

    // 2. 添加历史记录
    dispatch(
      addHistoryItem({
        session_id: id,
        session_title: newTitle,
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
