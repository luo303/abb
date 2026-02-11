import React from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { MOCK_GROWTH_DATA } from '../../../data/mock/homePosts'

export default function CurveWeightChart() {
  return (
    <BaseGrowthChart
      title="体重发育曲线"
      unit="kg"
      standardData={MOCK_GROWTH_DATA.weight.standard}
      babyData={MOCK_GROWTH_DATA.weight.baby}
      yMin={2}
      yMax={12}
      // 使用默认颜色：标准数据蓝线，宝宝数据红线
    />
  )
}
