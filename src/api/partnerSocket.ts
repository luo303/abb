import { PARTNER_WS_BASE_URL } from '@/api/messenger'

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

const HEARTBEAT_INTERVAL = 60000
const HEARTBEAT_TIMEOUT = 180000

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
    if (!socket || socket.readyState !== WebSocket.OPEN) return

    if (Date.now() - lastReceivedAt > HEARTBEAT_TIMEOUT) {
      socket.close()
      return
    }

    socket.send(
      JSON.stringify({
        type: 'ping',
        timestamp: Date.now()
      })
    )
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
    callbacks?.onOpen?.()
    startHeartbeat()
  }

  socket.onmessage = event => {
    const rawText =
      typeof event.data === 'string' ? event.data : String(event.data)
    lastReceivedAt = Date.now()

    if (rawText === 'pong' || rawText === 'ping') {
      return
    }

    let payload: any = null
    try {
      payload = JSON.parse(rawText)
    } catch {
      payload = null
    }

    if (
      payload?.type === 'pong' ||
      payload?.type === 'ping' ||
      payload?.type === 'heartbeat'
    ) {
      return
    }

    callbacks?.onMessage(rawText)
  }

  socket.onerror = event => {
    callbacks?.onError?.(event)
  }

  socket.onclose = () => {
    clearHeartbeatTimer()
    callbacks?.onClose?.()
    socket = null

    if (manualClose || reconnectTimer) return

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      innerConnect()
    }, 2500)
  }
}

export const connectPartnerSocket = (
  token: string,
  partnerId: string,
  cb: PartnerSocketCallbacks
) => {
  const nextUrl = `${PARTNER_WS_BASE_URL}?token=${encodeURIComponent(token)}&user_id=${encodeURIComponent(partnerId)}`

  if (socket && currentUrl !== nextUrl) {
    socket.close()
    socket = null
  }

  currentUrl = nextUrl
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

export const sendPartnerSocket = (data: unknown) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false
  }

  socket.send(typeof data === 'string' ? data : JSON.stringify(data ?? {}))
  return true
}

export const isPartnerSocketOpen = () => {
  return !!socket && socket.readyState === WebSocket.OPEN
}
