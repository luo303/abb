import React, { useMemo, useState } from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import { BABY_GROWTH_SIMULATION_DATA } from '../../../data/mock/homePosts'
import TimeRangeSelector, { TimeRange } from './TimeRangeSelector'
import DataDescription from './DataDescription'

export default function CurveHeightChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')

  const { standardData, babyData, xAxisName } = useMemo(() => {
    let xAxisName = '天'
    let baby: any[] = []

    if (timeRange === 'day') {
      baby = BABY_GROWTH_SIMULATION_DATA.map(item => ({
        label: item.day.toString(),
        value: item.maleHeight,
        originalDay: item.day.toString()
      }))
    } else {
      // 周或月模式：需要对数据进行分组和取最后一天
      const period = timeRange === 'week' ? 7 : 30
      xAxisName = timeRange === 'week' ? '周' : '月'

      const maxDay = Math.max(...BABY_GROWTH_SIMULATION_DATA.map(d => d.day))
      const periodCount = Math.ceil(maxDay / period) || 1

      for (let i = 1; i <= periodCount; i++) {
        const startDay = (i - 1) * period
        const endDay = i * period

        // 找到该周期内所有的记录
        const recordsInPeriod = BABY_GROWTH_SIMULATION_DATA.filter(
          item => item.day > startDay && item.day <= endDay
        )

        if (recordsInPeriod.length > 0) {
          // 取最后一天的数据
          const lastRecord = recordsInPeriod[recordsInPeriod.length - 1]
          baby.push({
            label: i.toString(),
            value: lastRecord.maleHeight,
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
  }, [timeRange])

  return (
    <>
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      <BaseGrowthChart
        title="身高发育曲线"
        unit="cm"
        xAxisName={xAxisName}
        standardData={standardData}
        babyData={babyData}
        yMin={48} // 根据0-30天数据调整 (50cm - 56cm)
        yMax={58}
        // 使用默认颜色：标准数据蓝线，宝宝数据红线
      />
      <DataDescription type="height" />
    </>
  )
}
