import React, { useMemo, useState, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import BaseGrowthChart from './BaseGrowthChart'
import ViewShot from 'react-native-view-shot'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface CurveWeightChartProps {
  chartRef?: React.RefObject<ViewShot | null>
}

export default function CurveWeightChart({ chartRef }: CurveWeightChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const internalChartRef = useRef<ViewShot | null>(null)
  const activeChartRef = chartRef ?? internalChartRef
  const { growthCurve, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )

  const babyGrowthData = useMemo(() => {
    if (!currentBabyDetail || !growthCurve.weight.length) return []

    const origin = currentBabyDetail.birthday
    return growthCurve.weight
      .map(item => {
        const day = getDayDiff(origin, item.time)
        return {
          day: Math.max(0, day),
          value: item.value
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [growthCurve.weight, currentBabyDetail])

  const hasBabyHistory = babyGrowthData.length > 0

  const { standardData, babyData, xAxisName } = useMemo(() => {
    let xAxisName = '天'
    let baby: any[] = []

    if (!hasBabyHistory) {
      if (timeRange === 'day') {
        const standard = STANDARD_GROWTH_DATA.weight.map(item => ({
          label: item.day,
          value: item.male
        }))
        return { standardData: standard, babyData: [], xAxisName: '天' }
      }
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'
      const standard = STANDARD_GROWTH_DATA.weight
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

    const standard = STANDARD_GROWTH_DATA.weight
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
      return { yMin: 2.5, yMax: 5.0 }
    }
    let min = Math.min(...values)
    let max = Math.max(...values)
    if (min === max) {
      min -= 0.5
      max += 0.5
    }
    const padding = Math.max((max - min) * 0.1, 0.2)
    return {
      yMin: +(min - padding).toFixed(2),
      yMax: +(max + padding).toFixed(2)
    }
  }, [standardData, babyData])

  return (
    <>
      <View style={styles.headerContainer}>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </View>
      <ViewShot ref={activeChartRef} options={{ format: 'png', quality: 0.9 }}>
        <BaseGrowthChart
          title="体重发育曲线"
          unit="kg"
          xAxisName={xAxisName}
          standardData={standardData}
          babyData={babyData}
          yMin={yMin}
          yMax={yMax}
          // 使用默认颜色：标准数据蓝线，宝宝数据红线
        />
      </ViewShot>
      <DataDescription type="weight" />
    </>
  )
}

const DAY_MS = 24 * 60 * 60 * 1000

const getDayDiff = (startTime: number, endTime: number) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.floor((end.getTime() - start.getTime()) / DAY_MS)
}

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 6
  }
})
