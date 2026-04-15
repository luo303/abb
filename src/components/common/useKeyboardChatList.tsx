import React, { forwardRef, useCallback, useRef, useState } from 'react'
import type { LayoutChangeEvent, ScrollViewProps } from 'react-native'
import type { KeyboardChatScrollViewProps } from 'react-native-keyboard-controller'
import type { SharedValue } from 'react-native-reanimated'
import { useSharedValue } from 'react-native-reanimated'

import { AppKeyboardChatScrollView } from './AppKeyboardAvoidingView'

type KeyboardChatScrollViewRef = React.ElementRef<
  typeof AppKeyboardChatScrollView
>

type UseChatComposerMetricsOptions = {
  initialHeight: number
}

type VirtualizedKeyboardChatScrollViewProps = ScrollViewProps &
  KeyboardChatScrollViewProps & {
    chatScrollViewRef?: React.MutableRefObject<KeyboardChatScrollViewRef | null>
  }

type UseKeyboardChatScrollRendererOptions = {
  extraContentPadding: SharedValue<number>
  blankSpace?: SharedValue<number>
  offset?: number
  keyboardLiftBehavior?: NonNullable<
    KeyboardChatScrollViewProps['keyboardLiftBehavior']
  >
  chatScrollViewRef?: React.MutableRefObject<KeyboardChatScrollViewRef | null>
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref) {
    ref.current = value
  }
}

const VirtualizedKeyboardChatScrollView = forwardRef<
  KeyboardChatScrollViewRef,
  VirtualizedKeyboardChatScrollViewProps
>(({ chatScrollViewRef, ...props }, ref) => {
  const handleRef = useCallback(
    (instance: KeyboardChatScrollViewRef | null) => {
      assignRef(ref, instance)
      if (chatScrollViewRef) {
        chatScrollViewRef.current = instance
      }
    },
    [chatScrollViewRef, ref]
  )

  return <AppKeyboardChatScrollView ref={handleRef} {...props} />
})

VirtualizedKeyboardChatScrollView.displayName =
  'VirtualizedKeyboardChatScrollView'

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
  keyboardLiftBehavior = 'whenAtEnd',
  chatScrollViewRef
}: UseKeyboardChatScrollRendererOptions) {
  return useCallback(
    (props: ScrollViewProps) => (
      <VirtualizedKeyboardChatScrollView
        {...props}
        blankSpace={blankSpace}
        chatScrollViewRef={chatScrollViewRef}
        extraContentPadding={extraContentPadding}
        keyboardLiftBehavior={keyboardLiftBehavior}
        offset={offset}
      />
    ),
    [
      blankSpace,
      chatScrollViewRef,
      extraContentPadding,
      keyboardLiftBehavior,
      offset
    ]
  )
}
