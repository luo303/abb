import React, { useCallback, useRef, useState } from 'react'
import type { LayoutChangeEvent, ScrollViewProps } from 'react-native'
import type { KeyboardChatScrollViewProps } from 'react-native-keyboard-controller'
import type { SharedValue } from 'react-native-reanimated'
import { useSharedValue } from 'react-native-reanimated'

import { AppKeyboardChatScrollView } from './AppKeyboardAvoidingView'

type UseChatComposerMetricsOptions = {
  initialHeight: number
}

type UseKeyboardChatScrollRendererOptions = {
  extraContentPadding: SharedValue<number>
  blankSpace?: SharedValue<number>
  offset?: number
  keyboardLiftBehavior?: NonNullable<
    KeyboardChatScrollViewProps['keyboardLiftBehavior']
  >
}

export function useChatComposerMetrics({
  initialHeight
}: UseChatComposerMetricsOptions) {
  const extraContentPadding = useSharedValue(0)
  const baseHeightRef = useRef(initialHeight)
  const hasMeasuredRef = useRef(false)
  const [baseHeight, setBaseHeight] = useState(initialHeight)
  const [currentHeight, setCurrentHeight] = useState(initialHeight)

  const handleComposerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextHeight = Math.ceil(event.nativeEvent.layout.height)
      if (nextHeight <= 0) return

      setCurrentHeight(prev => (prev === nextHeight ? prev : nextHeight))

      if (!hasMeasuredRef.current) {
        hasMeasuredRef.current = true
        baseHeightRef.current = nextHeight
        setBaseHeight(nextHeight)
        extraContentPadding.value = 0
        return
      }

      if (nextHeight < baseHeightRef.current) {
        baseHeightRef.current = nextHeight
        setBaseHeight(nextHeight)
      }

      extraContentPadding.value = Math.max(
        0,
        nextHeight - baseHeightRef.current
      )
    },
    [extraContentPadding]
  )

  return {
    baseHeight,
    currentHeight,
    extraContentPadding,
    handleComposerLayout
  }
}

export function useKeyboardChatScrollRenderer({
  extraContentPadding,
  blankSpace,
  offset = 0,
  keyboardLiftBehavior = 'whenAtEnd'
}: UseKeyboardChatScrollRendererOptions) {
  return useCallback(
    (props: ScrollViewProps) => (
      <AppKeyboardChatScrollView
        {...props}
        blankSpace={blankSpace}
        extraContentPadding={extraContentPadding}
        keyboardLiftBehavior={keyboardLiftBehavior}
        offset={offset}
      />
    ),
    [blankSpace, extraContentPadding, keyboardLiftBehavior, offset]
  )
}
