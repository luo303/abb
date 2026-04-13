import { useCallback, useEffect, useRef, useState } from 'react'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

type ScrollHandle = {
  scrollToEnd?: (options?: { animated?: boolean }) => void
}

type UseChatAutoScrollOptions = {
  conversationKey?: string | null
  bottomThreshold?: number
  showButtonThreshold?: number
  enabled?: boolean
}

export default function useChatAutoScroll({
  conversationKey,
  bottomThreshold = 120,
  showButtonThreshold = 180,
  enabled = true
}: UseChatAutoScrollOptions) {
  const scrollRef = useRef<ScrollHandle | null>(null)
  const autoFollowRef = useRef(true)
  const [showScrollBottom, setShowScrollBottom] = useState(false)

  const syncScrollState = useCallback(
    (isAtBottom: boolean, distanceFromBottom = 0) => {
      autoFollowRef.current = isAtBottom
      setShowScrollBottom(
        enabled
          ? !isAtBottom && distanceFromBottom > showButtonThreshold
          : false
      )
    },
    [enabled, showButtonThreshold]
  )

  const scrollToBottom = useCallback(
    (animated: boolean) => {
      if (!enabled) return

      syncScrollState(true)
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd?.({ animated })
      })
    },
    [enabled, syncScrollState]
  )

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!enabled) return

      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent
      const distanceFromBottom = Math.max(
        contentSize.height - (contentOffset.y + layoutMeasurement.height),
        0
      )
      const isAtBottom = distanceFromBottom <= bottomThreshold

      syncScrollState(isAtBottom, distanceFromBottom)
    },
    [bottomThreshold, enabled, syncScrollState]
  )

  const handleContentSizeChange = useCallback(() => {
    if (!enabled) return

    if (autoFollowRef.current) {
      scrollToBottom(false)
    }
  }, [enabled, scrollToBottom])

  const handleListLoad = useCallback(() => {
    if (!enabled) return

    if (autoFollowRef.current) {
      scrollToBottom(false)
    }
  }, [enabled, scrollToBottom])

  useEffect(() => {
    autoFollowRef.current = true
    setShowScrollBottom(false)
  }, [conversationKey, enabled])

  return {
    scrollRef,
    showScrollBottom,
    scrollToBottom,
    handleScroll,
    handleContentSizeChange,
    handleListLoad,
    syncScrollState
  }
}
