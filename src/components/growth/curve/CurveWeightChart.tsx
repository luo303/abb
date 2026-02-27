import React, { useMemo, useState, useEffect } from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { fetchGrowthCurve } from '../../../store/modules/BabyStore'

export default function CurveWeightChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const dispatch = useDispatch<any>()
  const { growthCurve, currentBabyId, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )

  useEffect(() => {
    if (currentBabyId && growthCurve.weight.length === 0) {
      dispatch(
        fetchGrowthCurve({
          baby_id: currentBabyId,
          metric: 'weight',
          group_by: 'day'
        })
      )
    }
  }, [dispatch, currentBabyId, growthCurve.weight.length])

  const babyGrowthData = useMemo(() => {
    if (!currentBabyDetail || !growthCurve.weight.length) return []

    const origin = currentBabyDetail.birthday
    return growthCurve.weight
      .map(item => {
        const diffTime = item.time - origin
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return {
          day: Math.max(0, day),
          value: item.value
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [growthCurve.weight, currentBabyDetail])

  const { standardData, babyData, xAxisName } = useMemo(() => {
    let xAxisName = '天'
    let baby: any[] = []

    if (babyGrowthData.length === 0) {
      return { standardData: [], babyData: [], xAxisName }
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
  }, [timeRange, babyGrowthData])

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
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
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
      <DataDescription type="weight" />
    </>
  )
}
