import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Message {
  id: string
  text: string
  sender: 'me' | 'partner'
  timestamp: number
}

interface PartnerState {
  partnerId: string | null
  partnerName: string | null
  partnerAvatar: string | null
  messages: Message[]
  isConnected: boolean
}

const initialState: PartnerState = {
  partnerId: null, // Initial state is null, meaning no partner added
  partnerName: null,
  partnerAvatar: null,
  messages: [],
  isConnected: false
}

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    setPartner: (
      state,
      action: PayloadAction<{
        id: string
        name: string
        avatar?: string | null
      }>
    ) => {
      state.partnerId = action.payload.id
      state.partnerName = action.payload.name
      state.partnerAvatar = action.payload.avatar || null
      // Persist if needed, but for now just state
    },
    removePartner: state => {
      state.partnerId = null
      state.partnerName = null
      state.partnerAvatar = null
      state.messages = []
      state.isConnected = false
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    }
  }
})

export const { setPartner, removePartner, addMessage, setConnectionStatus } =
  partnerSlice.actions
export default partnerSlice.reducer
