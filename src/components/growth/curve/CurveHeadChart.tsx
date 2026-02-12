import React, { useMemo } from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { STANDARD_GROWTH_DATA } from '../../../data/mock/standard'
import { BABY_GROWTH_SIMULATION_DATA } from '../../../data/mock/homePosts'

export default function CurveHeadChart() {
  const { standardData, babyData } = useMemo(() => {
    // 处理宝宝数据：转换为 { label, value } 格式
    // 默认展示男宝数据
    const baby = BABY_GROWTH_SIMULATION_DATA.map(item => ({
      label: item.day.toString(),
      value: item.maleHeadCircumference
    }))

    // 获取宝宝数据中存在的天数
    const babyDays = new Set(baby.map(item => item.label))

    // 处理标准数据：过滤出宝宝数据中存在的天数
    const standard = STANDARD_GROWTH_DATA.head
      .filter(item => babyDays.has(item.day))
      .map(item => ({
        label: item.day,
        value: item.male // 默认展示男宝标准
      }))

    return { standardData: standard, babyData: baby }
  }, [])

  return (
    <BaseGrowthChart
      title="头围发育曲线"
      unit="cm"
      xAxisName="天"
      standardData={standardData}
      babyData={babyData}
      yMin={32}
      yMax={42}
      // 使用默认颜色：标准数据蓝线，宝宝数据红线
    />
  )
}
