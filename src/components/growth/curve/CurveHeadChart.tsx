import React, { useMemo, useState } from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import { BABY_GROWTH_SIMULATION_DATA } from '../../../data/mock/homePosts'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'

export default function CurveHeadChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')

  const { standardData, babyData, xAxisName } = useMemo(() => {
    let xAxisName = '天'
    let baby: any[] = []

    if (timeRange === 'day') {
      baby = BABY_GROWTH_SIMULATION_DATA.map(item => ({
        label: item.day.toString(),
        value: item.maleHeadCircumference,
        originalDay: item.day.toString()
      }))
    } else {
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'

      const maxDay = Math.max(...BABY_GROWTH_SIMULATION_DATA.map(d => d.day))
      const periodCount = Math.ceil(maxDay / period) || 1

      for (let i = 1; i <= periodCount; i++) {
        const startDay = (i - 1) * period
        const endDay = i * period

        const recordsInPeriod = BABY_GROWTH_SIMULATION_DATA.filter(
          item => item.day > startDay && item.day <= endDay
        )

        if (recordsInPeriod.length > 0) {
          const lastRecord = recordsInPeriod[recordsInPeriod.length - 1]
          baby.push({
            label: i.toString(),
            value: lastRecord.maleHeadCircumference,
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
  }, [timeRange])

  return (
    <>
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      <BaseGrowthChart
        title="头围发育曲线"
        unit="cm"
        xAxisName={xAxisName}
        standardData={standardData}
        babyData={babyData}
        yMin={32}
        yMax={42}
        // 使用默认颜色：标准数据蓝线，宝宝数据红线
      />
      <DataDescription type="head" />
    </>
  )
}
