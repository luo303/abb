import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { useState, useCallback } from 'react'

export function useHomeAnimations() {
  // 滚动共享值
  const scrollY = useSharedValue(0)
  const stickyProgress = useSharedValue(0)

  // 搜索栏高度和社区标题栏位置
  const [searchBarHeight, setSearchBarHeight] = useState(0)
  const [communityHeaderY, setCommunityHeaderY] = useState(0)

  // 处理滚动事件
  const handleScroll = useCallback(
    (event: any) => {
      const scrollY = event.nativeEvent.contentOffset.y

      // 计算滚动进度，用于平滑过渡
      if (communityHeaderY > 0) {
        const threshold = communityHeaderY - searchBarHeight
        const progress = Math.max(
          0,
          Math.min(1, (scrollY - threshold + 20) / 40)
        )
        stickyProgress.value = progress
      }
    },
    [communityHeaderY, searchBarHeight]
  )

  // 计算吸顶标题栏的样式
  const stickyHeaderAnimatedStyle = useAnimatedStyle(() => {
    // 根据滚动进度计算透明度和位置
    const opacity = stickyProgress.value
    const translateY = stickyProgress.value * (searchBarHeight + 10)

    return {
      opacity,
      transform: [{ translateY }],
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99
    }
  })

  // 计算滚动标题栏的样式
  const scrollHeaderAnimatedStyle = useAnimatedStyle(() => {
    // 根据滚动进度计算透明度
    const opacity = 1 - stickyProgress.value

    return {
      opacity
    }
  })

  // 计算顶部背景动画样式
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const triggerPoint =
      communityHeaderY > 0 ? communityHeaderY - searchBarHeight - 50 : 300
    const opacity = interpolate(
      scrollY.value,
      [triggerPoint - 100, triggerPoint],
      [0, 1],
      Extrapolation.CLAMP
    )
    return { opacity }
  })

  // 测量搜索栏高度
  const measureSearchBar = useCallback((event: any) => {
    setSearchBarHeight(event.nativeEvent.layout.height)
  }, [])

  // 测量社区标题栏位置
  const measureCommunityHeader = useCallback((event: any) => {
    setCommunityHeaderY(event.nativeEvent.layout.y)
  }, [])

  return {
    scrollY,
    stickyProgress,
    searchBarHeight,
    communityHeaderY,
    handleScroll,
    stickyHeaderAnimatedStyle,
    scrollHeaderAnimatedStyle,
    headerBackgroundStyle,
    measureSearchBar,
    measureCommunityHeader
  }
}
