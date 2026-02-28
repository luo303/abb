import React, { useMemo, useState } from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

export default function CurveHeadChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const { growthCurve, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )

  const babyGrowthData = useMemo(() => {
    if (!currentBabyDetail || !growthCurve.head.length) return []

    const origin = currentBabyDetail.birthday
    return growthCurve.head
      .map(item => {
        const diffTime = item.time - origin
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return {
          day: Math.max(0, day),
          value: item.value
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [growthCurve.head, currentBabyDetail])

  const hasBabyHistory = babyGrowthData.length > 0

  const { standardData, babyData, xAxisName } = useMemo(() => {
    let xAxisName = '天'
    let baby: any[] = []

    if (!hasBabyHistory) {
      if (timeRange === 'day') {
        const standard = STANDARD_GROWTH_DATA.head.map(item => ({
          label: item.day,
          value: item.male
        }))
        return { standardData: standard, babyData: [], xAxisName: '天' }
      }
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'
      const standard = STANDARD_GROWTH_DATA.head
        .filter(item => {
          const day = Number(item.day)
          return day >= period && day % period === 0
        })
        .map(item => ({
          label: (Number(item.day) / period).toString(),
          value: item.male
        }))
      return { standardData: standard, babyData: [], xAxisName }
    }

    if (timeRange === 'day') {
      baby = babyGrowthData.map(item => ({
        label: item.day.toString(),
        value: item.value,
        originalDay: item.day.toString()
      }))
    } else {
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'

      const maxDay = Math.max(...babyGrowthData.map(d => d.day))
      const periodCount = Math.ceil(maxDay / period) || 1

      for (let i = 1; i <= periodCount; i++) {
        const startDay = (i - 1) * period
        const endDay = i * period

        const recordsInPeriod = babyGrowthData.filter(
          item => item.day > startDay && item.day <= endDay
        )

        if (recordsInPeriod.length > 0) {
          const lastRecord = recordsInPeriod[recordsInPeriod.length - 1]
          baby.push({
            label: i.toString(),
            value: lastRecord.value,
            originalDay: lastRecord.day.toString()
          })
        }
      }
    }

    const babyDays = new Set(baby.map(item => item.originalDay))

    const standard = STANDARD_GROWTH_DATA.head
      .filter(item => babyDays.has(item.day))
      .map(item => {
        const babyItem = baby.find(b => b.originalDay === item.day)
        return {
          label: babyItem ? babyItem.label : item.day,
          value: item.male
        }
      })

    return { standardData: standard, babyData: baby, xAxisName }
  }, [timeRange, babyGrowthData, hasBabyHistory])

  const { yMin, yMax } = useMemo(() => {
    const values = [
      ...standardData.map(d => d.value),
      ...babyData.map(d => d.value)
    ].filter(v => typeof v === 'number' && !Number.isNaN(v)) as number[]

    if (values.length === 0) {
      return { yMin: 32, yMax: 42 }
    }
    let min = Math.min(...values)
    let max = Math.max(...values)
    if (min === max) {
      min -= 1
      max += 1
    }
    const padding = Math.max((max - min) * 0.1, 0.5)
    return { yMin: Math.floor(min - padding), yMax: Math.ceil(max + padding) }
  }, [standardData, babyData])

  return (
    <>
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      <BaseGrowthChart
        title="头围发育曲线"
        unit="cm"
        xAxisName={xAxisName}
        standardData={standardData}
        babyData={babyData}
        yMin={yMin}
        yMax={yMax}
        // 使用默认颜色：标准数据蓝线，宝宝数据红线
      />
      <DataDescription type="head" />
    </>
  )
}
