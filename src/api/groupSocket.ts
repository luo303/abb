import { GROUP_WS_BASE_URL } from '@/api/messenger'

type GroupSocketCallbacks = {
  onMessage: (raw: string) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (event: Event) => void
}

let socket: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let manualClose = false
let currentUrl = GROUP_WS_BASE_URL
let desiredGroupIds: string[] = []
let callbacks: GroupSocketCallbacks | null = null
let lastReceivedAt = 0

const HEARTBEAT_INTERVAL = 60000
const HEARTBEAT_TIMEOUT = 180000

const readyStateText = (state: number) => {
  switch (state) {
    case WebSocket.CONNECTING:
      return '连接中'
    case WebSocket.OPEN:
      return '已连接'
    case WebSocket.CLOSING:
      return '关闭中'
    case WebSocket.CLOSED:
      return '已关闭'
    default:
      return `未知状态(${state})`
  }
}

const sanitizeWsUrl = (url: string) => {
  try {
    const parsed = new URL(url)
    if (parsed.searchParams.has('token')) {
      parsed.searchParams.set('token', '***')
    }
    return parsed.toString()
  } catch {
    return url.replace(/token=[^&]+/gi, 'token=***')
  }
}

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

const sendSubscribe = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return
  if (desiredGroupIds.length === 0) return

  console.log(
    `[群聊WS] 发送订阅（count=${desiredGroupIds.length}）：${desiredGroupIds.join(', ')}`
  )
  socket.send(
    JSON.stringify({
      op: 'subscribe_many',
      group_ids: desiredGroupIds
    })
  )
}

const startHeartbeat = () => {
  clearHeartbeatTimer()
  lastReceivedAt = Date.now()
  console.log(
    `[群聊WS] 心跳已启动（间隔=${HEARTBEAT_INTERVAL}ms，超时=${HEARTBEAT_TIMEOUT}ms）`
  )
  heartbeatTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return

    if (Date.now() - lastReceivedAt > HEARTBEAT_TIMEOUT) {
      console.warn(
        `[群聊WS] 心跳超时（${Date.now() - lastReceivedAt}ms 未收到消息），准备重连`
      )
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

const buildGroupSocketUrl = (token: string) => {
  return `${GROUP_WS_BASE_URL}?token=${encodeURIComponent(token)}`
}

const innerConnect = () => {
  if (!currentUrl || !callbacks) return
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    console.log(
      `[群聊WS] 跳过连接：当前状态=${readyStateText(socket.readyState)}`
    )
    return
  }

  clearReconnectTimer()
  clearHeartbeatTimer()
  manualClose = false
  console.log(`[群聊WS] 开始连接：${sanitizeWsUrl(currentUrl)}`)
  socket = new WebSocket(currentUrl)

  socket.onopen = () => {
    lastReceivedAt = Date.now()
    console.log('[群聊WS] 连接成功')
    callbacks?.onOpen?.()
    startHeartbeat()
    sendSubscribe()
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
      payload?.type === 'heartbeat' ||
      payload?.op === 'pong' ||
      payload?.op === 'ping'
    ) {
      return
    }

    if (payload?.op === 'ack') {
      console.log(
        `[群聊WS] 收到 ACK（for=${payload?.for || '未知'}，ok=${String(payload?.ok)}，groupCount=${payload?.group_ids?.length || 0})`
      )
    } else {
      console.log(
        `[群聊WS] 收到业务消息（op=${payload?.op || '未知'}，groupId=${payload?.group_id || '无'}）`
      )
    }
    callbacks?.onMessage(rawText)
  }

  socket.onerror = event => {
    console.warn('[群聊WS] 连接异常', event)
    callbacks?.onError?.(event)
  }

  socket.onclose = event => {
    clearHeartbeatTimer()
    console.warn(
      `[群聊WS] 连接关闭（code=${(event as any)?.code ?? '未知'}, reason=${(event as any)?.reason ?? '未知'}, wasClean=${(event as any)?.wasClean ?? '未知'}, manualClose=${manualClose})`
    )
    callbacks?.onClose?.()
    socket = null

    if (manualClose || reconnectTimer) return

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      console.log('[群聊WS] 开始执行重连')
      innerConnect()
    }, 2500)
  }
}

export const connectGroupSocket = (token: string, cb: GroupSocketCallbacks) => {
  const nextUrl = buildGroupSocketUrl(token)
  console.log(`[群聊WS] 调用 connectGroupSocket：${sanitizeWsUrl(nextUrl)}`)

  if (socket && currentUrl !== nextUrl) {
    socket.close()
    socket = null
  }

  currentUrl = nextUrl
  callbacks = cb
  manualClose = false
  innerConnect()
}

export const updateGroupSubscriptions = (groupIds: string[]) => {
  desiredGroupIds = [...new Set(groupIds.filter(Boolean))]
  console.log(
    `[群聊WS] 更新订阅列表（count=${desiredGroupIds.length}）：${desiredGroupIds.join(', ')}`
  )
  sendSubscribe()
}

export const closeGroupSocket = () => {
  console.log('[群聊WS] 调用 closeGroupSocket')
  manualClose = true
  clearReconnectTimer()
  clearHeartbeatTimer()

  if (socket) {
    console.log(
      `[群聊WS] 主动关闭连接，当前状态=${readyStateText(socket.readyState)}`
    )
    socket.close()
    socket = null
  }
}

export const sendGroupSocket = (data: unknown) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn(
      `[群聊WS] 发送失败：连接未就绪（exists=${!!socket}, state=${socket ? readyStateText(socket.readyState) : '空'})`
    )
    return false
  }

  const payload = typeof data === 'string' ? data : JSON.stringify(data ?? {})
  console.log(`[群聊WS] 发送消息：${payload}`)
  socket.send(payload)
  return true
}

export const isGroupSocketOpen = () => {
  return !!socket && socket.readyState === WebSocket.OPEN
}
