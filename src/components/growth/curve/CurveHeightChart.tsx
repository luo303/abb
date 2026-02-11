import React from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { MOCK_GROWTH_DATA } from '../../../data/mock/homePosts'

export default function CurveHeightChart() {
  return (
    <BaseGrowthChart
      title="身高发育曲线"
      unit="cm"
      standardData={MOCK_GROWTH_DATA.height.standard}
      babyData={MOCK_GROWTH_DATA.height.baby}
      yMin={45}
      yMax={75}
      // 使用默认颜色：标准数据蓝线，宝宝数据红线
    />
  )
}
