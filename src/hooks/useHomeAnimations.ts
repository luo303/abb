import { useSharedValue } from 'react-native-reanimated'
import { useState, useCallback } from 'react'

export function useHomeAnimations() {
  // 滚动共享值
  const stickyProgress = useSharedValue(0)

  // 搜索栏高度和社区标题栏位置
  const [searchBarHeight, setSearchBarHeight] = useState(0)
  const [communityHeaderY, setCommunityHeaderY] = useState(0)

  // 处理滚动事件 —— 更新 stickyProgress
  const handleScroll = useCallback(
    (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y

      // 计算 Tab 栏吸顶进度：
      // 当 Tab 栏即将触碰搜索栏底部时开始过渡，40px 内完成
      // 调整阈值，使吸顶位置更高，与搜索栏下沿重合
      if (communityHeaderY > 0) {
        const threshold = communityHeaderY - searchBarHeight - 30
        const progress = Math.max(
          0,
          Math.min(1, (currentScrollY - threshold + 20) / 40)
        )
        stickyProgress.value = progress
      }
    },
    [communityHeaderY, searchBarHeight, stickyProgress]
  )

  // 测量搜索栏高度
  const measureSearchBar = useCallback((event: any) => {
    setSearchBarHeight(event.nativeEvent.layout.height)
  }, [])

  // 测量社区标题栏位置
  const measureCommunityHeader = useCallback((event: any) => {
    setCommunityHeaderY(event.nativeEvent.layout.y)
  }, [])

  return {
    stickyProgress,
    searchBarHeight,
    communityHeaderY,
    handleScroll,
    measureSearchBar,
    measureCommunityHeader
  }
}
