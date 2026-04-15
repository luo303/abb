// 成长曲线数据处理工具

import { STANDARD_GROWTH_DATA, StandardDataPoint } from '../data/mock/standard'

/**
 * 成长指标类型
 */
export type GrowthMetric = 'height' | 'weight' | 'head'

/**
 * 性别类型
 */
export type Gender = 'male' | 'female'

/**
 * 成长数据点
 */
export interface GrowthDataPoint {
  day: number
  value: number
}

/**
 * 成长数据带百分位
 */
export interface GrowthDataWithPercentile extends GrowthDataPoint {
  percentile: number
}

/**
 * 从标准数据中获取指定天数和性别的标准值
 * @param metric 成长指标
 * @param day 天数
 * @param gender 性别
 * @returns 标准值
 */
export function getStandardValue(
  metric: GrowthMetric,
  day: number,
  gender: Gender
): number {
  const standardData = STANDARD_GROWTH_DATA[metric]

  // 查找对应天数的数据点
  const exactMatch = standardData.find(item => Number(item.day) === day)
  if (exactMatch) {
    return exactMatch[gender]
  }

  // 如果没有精确匹配，进行线性插值
  let lowerBound: StandardDataPoint | null = null
  let upperBound: StandardDataPoint | null = null

  for (const item of standardData) {
    const itemDay = Number(item.day)
    if (itemDay <= day) {
      lowerBound = item
    }
    if (itemDay >= day && !upperBound) {
      upperBound = item
      break
    }
  }

  // 如果找不到边界值，返回默认值
  if (!lowerBound || !upperBound) {
    return lowerBound ? lowerBound[gender] : upperBound ? upperBound[gender] : 0
  }

  // 线性插值
  const lowerDay = Number(lowerBound.day)
  const upperDay = Number(upperBound.day)
  const lowerValue = lowerBound[gender]
  const upperValue = upperBound[gender]

  if (lowerDay === upperDay) {
    return lowerValue
  }

  const ratio = (day - lowerDay) / (upperDay - lowerDay)
  return lowerValue + (upperValue - lowerValue) * ratio
}

/**
 * 计算百分位
 * @param metric 成长指标
 * @param value 实际值
 * @param day 天数
 * @param gender 性别
 * @returns 百分位 (0-100)
 */
export function calculatePercentile(
  metric: GrowthMetric,
  value: number,
  day: number,
  gender: Gender
): number {
  const standardData = STANDARD_GROWTH_DATA[metric]

  // 找到对应天数的标准数据范围
  let relevantData: number[] = []

  // 对于当前天数，收集前后一段时间的标准数据作为参考
  const windowSize = 7 // 前后7天的数据

  for (const item of standardData) {
    const itemDay = Number(item.day)
    if (Math.abs(itemDay - day) <= windowSize) {
      relevantData.push(item[gender])
    }
  }

  if (relevantData.length === 0) {
    return 50 // 默认返回50百分位
  }

  // 排序数据
  relevantData.sort((a, b) => a - b)

  // 计算百分位
  let percentile = 0
  for (let i = 0; i < relevantData.length; i++) {
    if (value <= relevantData[i]) {
      percentile = (i / relevantData.length) * 100
      break
    }
  }

  // 如果值大于所有标准值，返回99百分位
  if (percentile === 0 && value > relevantData[relevantData.length - 1]) {
    percentile = 99
  }

  return Math.round(percentile)
}

/**
 * 格式化成长数据，添加百分位信息
 * @param metric 成长指标
 * @param data 原始成长数据
 * @param gender 性别
 * @returns 带百分位的成长数据
 */
export function formatGrowthDataWithPercentile(
  metric: GrowthMetric,
  data: GrowthDataPoint[],
  gender: Gender
): GrowthDataWithPercentile[] {
  return data.map(item => ({
    ...item,
    percentile: calculatePercentile(metric, item.value, item.day, gender)
  }))
}

/**
 * 按时间范围分组成长数据
 * @param data 成长数据
 * @param range 时间范围 ('day' | 'week' | 'month')
 * @returns 分组后的数据
 */
export function groupGrowthDataByRange(
  data: GrowthDataPoint[],
  range: 'day' | 'week' | 'month'
): GrowthDataPoint[] {
  if (range === 'day') {
    return data
  }

  const groupSize = range === 'week' ? 7 : 30
  const groupedData: GrowthDataPoint[] = []
  const groups: Record<number, number[]> = {}

  // 按组分组数据
  data.forEach(item => {
    const groupKey = Math.floor(item.day / groupSize)
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(item.value)
  })

  // 计算每组的平均值
  Object.entries(groups).forEach(([key, values]) => {
    const groupDay = Number(key) * groupSize
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length
    groupedData.push({
      day: groupDay,
      value: parseFloat(avgValue.toFixed(2))
    })
  })

  // 按天数排序
  return groupedData.sort((a, b) => a.day - b.day)
}

/**
 * 获取成长数据的统计信息
 * @param data 成长数据
 * @returns 统计信息
 */
export function getGrowthDataStats(data: GrowthDataPoint[]) {
  if (data.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      latest: 0
    }
  }

  const values = data.map(item => item.value)
  const sortedData = [...data].sort((a, b) => a.day - b.day)

  return {
    count: data.length,
    average: parseFloat(
      (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2)
    ),
    min: Math.min(...values),
    max: Math.max(...values),
    latest: sortedData[sortedData.length - 1].value
  }
}

/**
 * 计算两个成长数据点之间的增长率
 * @param start 开始数据点
 * @param end 结束数据点
 * @returns 增长率（百分比）
 */
export function calculateGrowthRate(
  start: GrowthDataPoint,
  end: GrowthDataPoint
): number {
  if (start.value === 0) {
    return 0
  }

  const rate = ((end.value - start.value) / start.value) * 100
  return parseFloat(rate.toFixed(2))
}

/**
 * 生成标准成长曲线数据
 * @param metric 成长指标
 * @param gender 性别
 * @param days 天数范围
 * @returns 标准成长曲线数据
 */
export function generateStandardGrowthCurve(
  metric: GrowthMetric,
  gender: Gender,
  days: number
): GrowthDataPoint[] {
  const data: GrowthDataPoint[] = []

  for (let day = 0; day <= days; day += 7) {
    // 每7天一个数据点
    data.push({
      day,
      value: getStandardValue(metric, day, gender)
    })
  }

  return data
}
