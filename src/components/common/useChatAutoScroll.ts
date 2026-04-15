import { useCallback, useEffect, useRef, useState } from 'react'
import { Keyboard } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

type ScrollHandle = {
  scrollToEnd?: (options?: { animated?: boolean }) => void
  scrollToOffset?: (options: { animated?: boolean; offset: number }) => void
}

type UseChatAutoScrollOptions = {
  conversationKey?: string | null
  bottomThreshold?: number
  showButtonThreshold?: number
  enabled?: boolean
  inverted?: boolean
}

export default function useChatAutoScroll({
  conversationKey,
  bottomThreshold = 120,
  showButtonThreshold = 180,
  enabled = true,
  inverted = false
}: UseChatAutoScrollOptions) {
  const scrollRef = useRef<ScrollHandle | null>(null)
  const chatScrollViewRef = useRef<ScrollHandle | null>(null)
  const autoFollowRef = useRef(true)
  const lastScrollOffsetRef = useRef(0)
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

  const runScrollToEnd = useCallback(
    (animated: boolean) => {
      requestAnimationFrame(() => {
        const scrollTarget = chatScrollViewRef.current ?? scrollRef.current
        if (inverted) {
          scrollTarget?.scrollToOffset?.({
            animated,
            offset: 0
          })
          return
        }

        scrollTarget?.scrollToEnd?.({ animated })
      })
    },
    [inverted]
  )

  const stopCurrentScroll = useCallback(() => {
    const offset = Math.max(lastScrollOffsetRef.current, 0)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToOffset?.({
        animated: false,
        offset
      })
    })
  }, [])

  const scrollToBottom = useCallback(
    (animated: boolean) => {
      if (!enabled) return

      syncScrollState(true)
      runScrollToEnd(animated)
    },
    [enabled, runScrollToEnd, syncScrollState]
  )

  const scrollToBottomIfNeeded = useCallback(
    (animated: boolean) => {
      if (!enabled || !autoFollowRef.current) return

      scrollToBottom(animated)
    },
    [enabled, scrollToBottom]
  )

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!enabled) return

      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent
      lastScrollOffsetRef.current = contentOffset.y
      const distanceFromBottom = inverted
        ? Math.max(contentOffset.y, 0)
        : Math.max(
            contentSize.height - (contentOffset.y + layoutMeasurement.height),
            0
          )
      const isAtBottom = distanceFromBottom <= bottomThreshold

      syncScrollState(isAtBottom, distanceFromBottom)
    },
    [bottomThreshold, enabled, inverted, syncScrollState]
  )

  const handleContentSizeChange = useCallback(() => {
    scrollToBottomIfNeeded(false)
  }, [scrollToBottomIfNeeded])

  const handleListLoad = useCallback(() => {
    scrollToBottomIfNeeded(false)
  }, [scrollToBottomIfNeeded])

  useEffect(() => {
    autoFollowRef.current = true
    lastScrollOffsetRef.current = 0
    setShowScrollBottom(false)
  }, [conversationKey, enabled])

  useEffect(() => {
    if (!enabled) return

    const stopScrolling = () => {
      stopCurrentScroll()
    }

    const subscriptions = [
      Keyboard.addListener('keyboardWillShow', stopScrolling),
      Keyboard.addListener('keyboardWillHide', stopScrolling),
      Keyboard.addListener('keyboardDidShow', stopScrolling),
      Keyboard.addListener('keyboardDidHide', stopScrolling)
    ]

    return () => {
      subscriptions.forEach(subscription => subscription.remove())
    }
  }, [enabled, stopCurrentScroll])

  return {
    scrollRef,
    chatScrollViewRef,
    showScrollBottom,
    scrollToBottom,
    scrollToBottomIfNeeded,
    handleScroll,
    handleContentSizeChange,
    handleListLoad,
    syncScrollState,
    stopCurrentScroll
  }
}
