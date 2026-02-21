import request from '@/utils/request'

export interface PartnerBindPayload {
  account: string
  password: string
}

export interface PartnerResponse {
  code: number
  message: string
  data: {
    partner_id: string
  }
}

export const fetchPartner = () => {
  return request.get('/user/partner') as Promise<PartnerResponse>
}

export const PARTNER_WS_BASE_URL =
  'wss://misapprehensive-overcontritely-roxy.ngrok-free.dev/ws/chat'

export const bindPartner = (data: PartnerBindPayload) => {
  return request.post('/user/partner/bind', data) as Promise<PartnerResponse>
}

type PartnerSocketCallbacks = {
  onMessage: (raw: string) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
}

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let manualClose = false
let currentUrl = PARTNER_WS_BASE_URL
let callbacks: PartnerSocketCallbacks | null = null
let lastReceivedAt = 0

const HEARTBEAT_INTERVAL = 20000
const HEARTBEAT_TIMEOUT = 40000

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

const clearHeartbeatTimer = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

const startHeartbeat = () => {
  clearHeartbeatTimer()
  lastReceivedAt = Date.now()
  heartbeatTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return
    }
    const now = Date.now()
    if (now - lastReceivedAt > HEARTBEAT_TIMEOUT) {
      socket.close()
      return
    }
    const pingPayload = JSON.stringify({
      type: 'ping',
      timestamp: now
    })
    socket.send(pingPayload)
  }, HEARTBEAT_INTERVAL)
}

const innerConnect = () => {
  if (!currentUrl || !callbacks) return
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  clearReconnectTimer()
  clearHeartbeatTimer()
  manualClose = false

  socket = new WebSocket(currentUrl)

  socket.onopen = () => {
    lastReceivedAt = Date.now()
    callbacks?.onOpen && callbacks.onOpen()
    startHeartbeat()
  }

  socket.onmessage = event => {
    const rawText =
      typeof event.data === 'string' ? event.data : String(event.data)
    lastReceivedAt = Date.now()

    let payload: any = null
    try {
      payload = JSON.parse(rawText)
    } catch {
      payload = null
    }

    const type = payload?.type || payload?.event
    if (rawText === 'pong' || type === 'pong') {
      return
    }

    callbacks?.onMessage(rawText)
  }

  socket.onerror = event => {
    callbacks?.onError && callbacks.onError(event)
  }

  socket.onclose = () => {
    clearHeartbeatTimer()
    callbacks?.onClose && callbacks.onClose()
    socket = null
    if (manualClose) return
    if (reconnectTimer) return
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      innerConnect()
    }, 1500)
  }
}

export const connectPartnerSocket = (
  url: string,
  cb: PartnerSocketCallbacks
) => {
  currentUrl = url
  callbacks = cb
  manualClose = false
  innerConnect()
}

export const closePartnerSocket = () => {
  manualClose = true
  clearReconnectTimer()
  clearHeartbeatTimer()
  if (socket) {
    socket.close()
    socket = null
  }
}

export const sendPartnerSocket = (data: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data ?? {})
    socket.send(payload)
    return true
  }
  return false
}

export const isPartnerSocketOpen = () => {
  return !!socket && socket.readyState === WebSocket.OPEN
}
