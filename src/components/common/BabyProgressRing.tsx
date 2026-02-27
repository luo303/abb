import React from 'react'
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import Svg, { Circle, G, LinearGradient, Stop } from 'react-native-svg'

interface BabyProgressRingProps {
  percent: number
  color: string
  centerText: React.ReactNode
  size?: number
  strokeWidth?: number
  unfilledColor?: string
  style?: ViewStyle
  useGradient?: boolean
  gradientColors?: string[]
  backgroundColor?: string
}

export default function BabyProgressRing({
  percent,
  color,
  centerText,
  size = 100,
  strokeWidth = 8,
  unfilledColor = '#f0f0f0',
  style,
  useGradient = false,
  gradientColors = ['#f43f5e', '#ef4444'],
  backgroundColor = 'transparent'
}: BabyProgressRingProps) {
  // 计算圆环参数
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percent / 100) * circumference
  const center = size / 2

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* 背景圆 */}
      {backgroundColor !== 'transparent' && (
        <View
          style={[
            styles.backgroundCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor
            }
          ]}
        />
      )}
      <Svg width={size} height={size}>
        {/* 渐变色定义 */}
        {useGradient && (
          <LinearGradient
            id="progressGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            {gradientColors.map((gradientColor, index) => (
              <Stop
                key={index}
                offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                stopColor={gradientColor}
              />
            ))}
          </LinearGradient>
        )}
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* 背景圆环 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={unfilledColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* 进度圆环 */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={useGradient ? 'url(#progressGradient)' : color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {/* 中心内容 */}
      <View style={[styles.centerContent, { width: size, height: size }]}>
        {centerText}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backgroundCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
