import request from '../utils/request'
import { SleepSession, SleepRecord } from '../types/sleep'
import { getSleepRecords } from '../utils/sleepStorage'

/**
 * 开启睡眠记录
 * @param babyId 宝宝ID
 * @returns 睡眠会话信息
 */
export const startSleep = async (babyId: string): Promise<SleepSession> => {
  const response = await request.post(`/baby/${babyId}/daily/sleep/start`)
  console.log('startSleep原始response:', JSON.stringify(response))
  const data = response.data as unknown as SleepSession
  // 确保返回的时间戳是毫秒级的
  if (typeof data.started_at === 'number') {
    data.started_at = data.started_at * 1000
  }
  return data
}

/**
 * 查询当前睡眠状态
 * @param babyId 宝宝ID
 * @returns 睡眠会话信息
 */
export const getActiveSleep = async (babyId: string): Promise<SleepSession> => {
  const response = await request.get(`/baby/${babyId}/daily/sleep/active`)
  return response.data as unknown as SleepSession
}

/**
 * 结束睡眠记录
 * @param babyId 宝宝ID
 * @param session_id 睡眠会话ID
 * @returns 完整的睡眠记录
 */
export const endSleep = async (
  babyId: string,
  session_id: string
): Promise<SleepRecord> => {
  const response = await request.post(`/baby/${babyId}/daily/sleep/stop`, {
    session_id
  })
  return response.data as unknown as SleepRecord
}

/**
 * 根据日期获取睡眠记录列表
 * @param babyId 宝宝ID
 * @param date 日期，格式为 "YYYY-MM-DD"
 * @returns 睡眠记录数组
 */
export const getSleepByDate = async (
  babyId: string,
  date: string
): Promise<SleepRecord[]> => {
  const formattedDate = date.replace(/-/g, '')

  const response = await request.get(`/baby/${babyId}/daily/sleep/byDate`, {
    params: { date: formattedDate }
  })

  // 确保返回的时间戳是毫秒级的
  let items = []
  if (Array.isArray(response.data?.items)) {
    items = response.data.items
  } else if (response.data?.items === null) {
    // 当API返回null时，尝试从本地存储获取数据
    try {
      const localRecords = await getSleepRecords(babyId, date)
      return localRecords
    } catch (error) {
      console.error('Error getting local sleep records:', error)
      items = []
    }
  } else {
    items = []
  }

  return items.map((item: any) => {
    let startedAt = item.started_at
    let endedAt = item.ended_at

    // 处理字符串形式的时间戳
    if (typeof startedAt === 'string') {
      // 检查是否是 mock 数据格式
      if (startedAt.startsWith('@now(')) {
        // 对于 mock 数据，使用当前时间减去偏移量
        const match = startedAt.match(/@now\('timestamp', 'offset: ([^']+)'\)/)
        const now = Date.now()
        if (match) {
          const offset = match[1]
          // 解析偏移量
          if (offset.endsWith('h')) {
            const hours = parseInt(offset.replace('h', ''))
            startedAt = now - hours * 60 * 60 * 1000
          } else if (offset.endsWith('m')) {
            const minutes = parseInt(offset.replace('m', ''))
            startedAt = now - minutes * 60 * 1000
          } else {
            startedAt = now
          }
        } else {
          startedAt = now
        }
      } else {
        // 尝试解析为数字
        startedAt = parseInt(startedAt) || 0
      }
    } else if (typeof startedAt !== 'number') {
      startedAt = 0
    }

    // 处理 ended_at
    if (endedAt === null) {
      // 正在进行的睡眠，ended_at 为 null
    } else if (typeof endedAt === 'string') {
      // 检查是否是 mock 数据格式
      if (endedAt.startsWith('@now(')) {
        // 对于 mock 数据，使用当前时间减去偏移量
        const match = endedAt.match(/@now\('timestamp', 'offset: ([^']+)'\)/)
        const now = Date.now()
        if (match) {
          const offset = match[1]
          // 解析偏移量
          if (offset.endsWith('h')) {
            const hours = parseInt(offset.replace('h', ''))
            endedAt = now - hours * 60 * 60 * 1000
          } else if (offset.endsWith('m')) {
            const minutes = parseInt(offset.replace('m', ''))
            endedAt = now - minutes * 60 * 1000
          } else {
            endedAt = now
          }
        } else {
          endedAt = now
        }
      } else {
        // 尝试解析为数字
        endedAt = parseInt(endedAt) || 0
      }
    } else if (typeof endedAt !== 'number') {
      endedAt = 0
    }

    // 检查时间戳是否已经是毫秒级（大于1天的毫秒数）
    const isStartedAtMs = startedAt > 86400000
    const isEndedAtMs = endedAt > 86400000 && endedAt !== null

    return {
      ...item,
      started_at: isStartedAtMs ? startedAt : startedAt * 1000,
      ended_at: endedAt === null ? null : isEndedAtMs ? endedAt : endedAt * 1000
    }
  })
}
