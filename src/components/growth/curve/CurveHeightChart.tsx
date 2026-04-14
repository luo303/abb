import React, { useMemo, useState, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import BaseGrowthChart from './BaseGrowthChart'
import ViewShot from 'react-native-view-shot'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'
import ExportButton from '../../export/ExportButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

interface CurveHeightChartProps {
  compact?: boolean
  initialRange?: TimeRange
  headlineValue?: number
  showStandardWhenNoHistory?: boolean
}

export default function CurveHeightChart({
  compact = false,
  initialRange = 'day',
  headlineValue,
  showStandardWhenNoHistory = true
}: CurveHeightChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange)
  const chartRef = useRef<ViewShot>(null)
  const { growthCurve, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )

  const babyGrowthData = useMemo(() => {
    if (!currentBabyDetail || !growthCurve.height.length) return []

    const origin = currentBabyDetail.birthday
    return growthCurve.height
      .map(item => {
        const day = getDayDiff(origin, item.time)
        return {
          day: Math.max(0, day),
          value: item.value
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [growthCurve.height, currentBabyDetail])

  const hasBabyHistory = babyGrowthData.length > 0

  const { standardData, babyData, xAxisName } = useMemo(() => {
    let xAxisName = '天'
    let baby: any[] = []

    if (!hasBabyHistory) {
      if (!showStandardWhenNoHistory) {
        return { standardData: [], babyData: [], xAxisName }
      }
      if (timeRange === 'day') {
        const standard = STANDARD_GROWTH_DATA.height.map(item => ({
          label: item.day,
          value: item.male
        }))
        return { standardData: standard, babyData: [], xAxisName: '天' }
      }
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'
      const standard = STANDARD_GROWTH_DATA.height
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
      // 周或月模式：需要对数据进行分组和取最后一天
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'

      const maxDay = Math.max(...babyGrowthData.map(d => d.day))
      const periodCount = Math.ceil(maxDay / period) || 1

      for (let i = 1; i <= periodCount; i++) {
        const startDay = (i - 1) * period
        const endDay = i * period

        // 找到该周期内所有的记录
        const recordsInPeriod = babyGrowthData.filter(
          item => item.day > startDay && item.day <= endDay
        )

        if (recordsInPeriod.length > 0) {
          // 取最后一天的数据
          const lastRecord = recordsInPeriod[recordsInPeriod.length - 1]
          baby.push({
            label: i.toString(),
            value: lastRecord.value,
            originalDay: lastRecord.day.toString() // 用于匹配标准数据
          })
        }
      }
    }

    // 获取宝宝数据中存在的天数（原始天数）
    const babyDays = new Set(baby.map(item => item.originalDay))

    const standard = STANDARD_GROWTH_DATA.height
      .filter(item => babyDays.has(item.day))
      .map(item => {
        // 找到对应的宝宝数据，获取其 label (周数/月数)
        const babyItem = baby.find(b => b.originalDay === item.day)
        return {
          label: babyItem ? babyItem.label : item.day,
          value: item.male
        }
      })

    return { standardData: standard, babyData: baby, xAxisName }
  }, [timeRange, babyGrowthData, hasBabyHistory, showStandardWhenNoHistory])

  const { yMin, yMax } = useMemo(() => {
    const values = [
      ...standardData.map(d => d.value),
      ...babyData.map(d => d.value)
    ].filter(v => typeof v === 'number' && !Number.isNaN(v)) as number[]

    if (values.length === 0) {
      return { yMin: 48, yMax: 58 }
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
      {!compact && (
        <View style={styles.headerContainer}>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <ExportButton
            recordType="growth"
            data={{
              babyInfo: {
                name: currentBabyDetail?.name || '',
                gender: currentBabyDetail?.gender || 'male',
                birthday: currentBabyDetail?.birthday || Date.now()
              },
              heightData: growthCurve.height,
              weightData: growthCurve.weight,
              headData: growthCurve.head
            }}
            viewRef={chartRef}
            style={styles.exportButtonContainer}
          />
        </View>
      )}
      <ViewShot ref={chartRef} options={{ format: 'png', quality: 0.9 }}>
        <BaseGrowthChart
          title="身高发育曲线"
          unit="cm"
          xAxisName={xAxisName}
          standardData={standardData}
          babyData={babyData}
          headlineValue={headlineValue}
          yMin={yMin}
          yMax={yMax}
          showDataZoomSlider={!compact}
          // 使用默认颜色：标准数据蓝线，宝宝数据红线
        />
      </ViewShot>
      {!compact && <DataDescription type="height" />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10
  },
  exportButtonContainer: {
    position: 'relative',
    bottom: 0,
    right: 0,
    zIndex: 100
  }
})
