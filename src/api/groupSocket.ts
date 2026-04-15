import { GROUP_WS_BASE_URL } from '@/api/messenger'

type GroupSocketCallbacks = {
  onMessage: (raw: string) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
}

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let manualClose = false
let currentToken = ''
let desiredGroupIds: string[] = []
let callbacks: GroupSocketCallbacks | null = null

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

const sendSubscribe = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  if (desiredGroupIds.length === 0) return

  socket.send(
    JSON.stringify({
      op: 'subscribe_many',
      group_ids: desiredGroupIds
    })
  )
}

const createSocket = () => {
  return new (WebSocket as any)(GROUP_WS_BASE_URL, undefined, {
    headers: {
      Authorization: `Bearer ${currentToken}`
    }
  }) as WebSocket
}

const innerConnect = () => {
  if (!currentToken || !callbacks) return
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }

  clearReconnectTimer()
  manualClose = false
  socket = createSocket()

  socket.onopen = () => {
    callbacks?.onOpen?.()
    sendSubscribe()
  }

  socket.onmessage = event => {
    const rawText =
      typeof event.data === 'string' ? event.data : String(event.data)
    callbacks?.onMessage(rawText)
  }

  socket.onerror = event => {
    callbacks?.onError?.(event)
  }

  socket.onclose = () => {
    callbacks?.onClose?.()
    socket = null

    if (manualClose || reconnectTimer) return

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      innerConnect()
    }, 2500)
  }
}

export const connectGroupSocket = (token: string, cb: GroupSocketCallbacks) => {
  if (socket && currentToken && currentToken !== token) {
    socket.close()
    socket = null
  }

  currentToken = token
  callbacks = cb
  manualClose = false
  innerConnect()
}

export const updateGroupSubscriptions = (groupIds: string[]) => {
  desiredGroupIds = [...new Set(groupIds.filter(Boolean))]
  sendSubscribe()
}

export const closeGroupSocket = () => {
  manualClose = true
  clearReconnectTimer()

  if (socket) {
    socket.close()
    socket = null
  }
}

export const sendGroupSocket = (data: unknown) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false
  }

  socket.send(typeof data === 'string' ? data : JSON.stringify(data ?? {}))
  return true
}

export const isGroupSocketOpen = () => {
  return !!socket && socket.readyState === WebSocket.OPEN
}
