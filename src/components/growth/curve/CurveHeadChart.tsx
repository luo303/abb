import React from 'react'
import BaseGrowthChart from './BaseGrowthChart'
import { MOCK_GROWTH_DATA } from '../../../data/mock/homePosts'

export default function CurveHeadChart() {
  return (
    <BaseGrowthChart
      title="头围发育曲线"
      unit="cm"
      standardData={MOCK_GROWTH_DATA.head.standard}
      babyData={MOCK_GROWTH_DATA.head.baby}
      yMin={30}
      yMax={50}
      standardColor="#E9D8FF"
      babyColor="#9F7AEA"
    />
  )
}
