import React, { useMemo, useState, useEffect } from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { fetchGrowthCurve } from '../../../store/modules/BabyStore'

export default function CurveHeightChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const dispatch = useDispatch<any>()
  const { growthCurve, currentBabyId, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )

  useEffect(() => {
    if (currentBabyId && growthCurve.height.length === 0) {
      dispatch(
        fetchGrowthCurve({
          baby_id: currentBabyId,
          metric: 'height',
          group_by: 'day'
        })
      )
    }
  }, [dispatch, currentBabyId, growthCurve.height.length])

  const babyGrowthData = useMemo(() => {
    if (!currentBabyDetail || !growthCurve.height.length) return []

    const origin = currentBabyDetail.birthday
    return growthCurve.height
      .map(item => {
        const diffTime = item.time - origin
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return {
          day: Math.max(0, day),
          value: item.value
        }
      })
      .sort((a, b) => a.day - b.day)
  }, [growthCurve.height, currentBabyDetail])

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
  }, [timeRange, babyGrowthData])

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
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      <BaseGrowthChart
        title="身高发育曲线"
        unit="cm"
        xAxisName={xAxisName}
        standardData={standardData}
        babyData={babyData}
        yMin={yMin}
        yMax={yMax}
        // 使用默认颜色：标准数据蓝线，宝宝数据红线
      />
      <DataDescription type="height" />
    </>
  )
}
