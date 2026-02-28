import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, ViewStyle, Animated } from 'react-native'
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
  const center = size / 2

  // 创建动画值
  const animatedValue = useRef(new Animated.Value(0)).current

  // 当组件挂载或 percent 变化时，启动动画
  useEffect(() => {
    // 先将动画值设置为0
    animatedValue.setValue(0)
    // 然后启动动画到目标值
    const animation = Animated.timing(animatedValue, {
      toValue: percent,
      duration: 1000,
      useNativeDriver: false
    })

    animation.start()

    // 清理函数，确保组件卸载时动画被停止
    return () => {
      animation.stop()
    }
  }, [percent, animatedValue])

  // 计算动画的 strokeDashoffset
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [
      circumference,
      circumference - (percent / 100) * circumference
    ]
  })

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
          <AnimatedCircle
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

// 创建 AnimatedCircle 组件
const AnimatedCircle = Animated.createAnimatedComponent(Circle)

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
