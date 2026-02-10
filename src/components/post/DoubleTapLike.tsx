import React, { useState, useCallback } from 'react'
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import {
  TapGestureHandler,
  TapGestureHandlerStateChangeEvent,
  State
} from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

interface DoubleTapLikeProps {
  children: React.ReactNode
  onLike: () => void
  style?: StyleProp<ViewStyle>
}

interface Heart {
  id: number
  x: number
  y: number
  angle: number // 增加随机旋转角度
}

const AnimatedHeart = ({
  x,
  y,
  angle,
  onFinish
}: {
  x: number
  y: number
  angle: number
  onFinish: () => void
}) => {
  const scale = useSharedValue(0)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: Math.max(0, scale.value) },
        { rotate: `${angle}deg` }
      ],
      opacity: opacity.value,
      position: 'absolute',
      left: x - 50, // Center the heart (assuming size 100)
      top: y - 50,
      // 增加阴影，更有质感
      shadowColor: '#ff4d4f',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5
    }
  })

  React.useEffect(() => {
    // 1. 负责缩放（弹起）
    scale.value = withSpring(1.2, { damping: 10, stiffness: 500 })

    // 2. 负责透明度（消失）- 独立执行，不等待 Spring 结束
    opacity.value = withDelay(
      150, // 弹起动作大概持续 100-150ms，我们在 150ms 后强制开始淡出
      withTiming(0, { duration: 1000 }, finished => {
        if (finished) {
          runOnJS(onFinish)()
        }
      })
    )
  }, []) // 仅在挂载时执行一次

  return (
    <Animated.View style={[animatedStyle, { pointerEvents: 'none' }]}>
      {/* 使用实心红心，配合阴影 */}
      <Ionicons name="heart" size={100} color="#ff4d4f" />
    </Animated.View>
  )
}

export default function DoubleTapLike({
  children,
  onLike,
  style
}: DoubleTapLikeProps) {
  const [hearts, setHearts] = useState<Heart[]>([])

  const counterRef = React.useRef(0)

  const removeHeart = useCallback((id: number) => {
    setHearts(prev => prev.filter(heart => heart.id !== id))
  }, [])

  const onDoubleTap = useCallback(
    (event: TapGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.state === State.ACTIVE) {
        const { x, y } = event.nativeEvent
        counterRef.current += 1
        // 使用更复杂的 ID 生成策略，避免快速点击或重置时重复
        const id = counterRef.current + Math.random()
        // 生成 -15 到 15 度的随机旋转
        const angle = Math.random() * 30 - 15

        setHearts(prev => [...prev, { id, x, y, angle }])
        onLike()
      }
    },
    [onLike]
  )

  return (
    <View style={style}>
      <TapGestureHandler
        onHandlerStateChange={onDoubleTap}
        numberOfTaps={2}
        maxDelayMs={300}
      >
        <Animated.View style={{ width: '100%' }}>{children}</Animated.View>
      </TapGestureHandler>

      {/* 渲染爱心层 - 确保层级最高 */}
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}
        pointerEvents="none"
      >
        {hearts.map(heart => (
          <AnimatedHeart
            key={heart.id}
            x={heart.x}
            y={heart.y}
            angle={heart.angle}
            onFinish={() => removeHeart(heart.id)}
          />
        ))}
      </View>
    </View>
  )
}
