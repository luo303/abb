// 日期处理工具

/**
 * 格式化日期为字符串
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | number,
  format: string = 'YYYY-MM-DD'
): string {
  const d = typeof date === 'number' ? new Date(date) : date

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 计算两个日期之间的天数差
 * @param start 开始日期
 * @param end 结束日期
 * @returns 天数差
 */
export function getDayDiff(start: Date | number, end: Date | number): number {
  const startDate = typeof start === 'number' ? new Date(start) : start
  const endDate = typeof end === 'number' ? new Date(end) : end

  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 计算宝宝年龄
 * @param birthday 出生日期
 * @returns 年龄字符串
 */
export function calculateBabyAge(birthday: number): string {
  const now = new Date()
  const birthDate = new Date(birthday)

  const years = now.getFullYear() - birthDate.getFullYear()
  const months = now.getMonth() - birthDate.getMonth()
  const days = now.getDate() - birthDate.getDate()

  if (years > 0) {
    return `${years}岁${months > 0 ? months + '个月' : ''}`
  } else if (months > 0) {
    return `${months}个月${days > 0 ? days + '天' : ''}`
  } else {
    return `${days}天`
  }
}

/**
 * 获取当前月份的开始和结束日期
 * @returns 包含开始和结束日期的对象
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)

  return {
    start: formatDate(start),
    end: formatDate(end)
  }
}

/**
 * 解析日期字符串为日期对象
 * @param dateString 日期字符串
 * @returns 日期对象
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString)
}
