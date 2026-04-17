import React, { forwardRef } from 'react'
import { Platform, StyleProp, ViewStyle } from 'react-native'
import {
  KeyboardAvoidingView as ControllerKeyboardAvoidingView,
  KeyboardGestureArea as ControllerKeyboardGestureArea,
  KeyboardStickyView as ControllerKeyboardStickyView,
  KeyboardAwareScrollView as ControllerKeyboardAwareScrollView
} from 'react-native-keyboard-controller'
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller'
import Animated, {
  useAnimatedStyle,
  type SharedValue
} from 'react-native-reanimated'

type Props = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  keyboardVerticalOffset?: number
  behavior?: 'height' | 'position' | 'padding'
}

type StickyProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  offset?: {
    closed?: number
    opened?: number
  }
}

type GestureAreaProps = React.ComponentProps<
  typeof ControllerKeyboardGestureArea
>

type KeyboardLiftBehavior = 'always' | 'never' | 'whenAtEnd'

export type AppKeyboardChatScrollViewProps = KeyboardAwareScrollViewProps & {
  children?: React.ReactNode
  extraContentPadding?: SharedValue<number>
  blankSpace?: SharedValue<number>
  offset?: number
  keyboardLiftBehavior?: KeyboardLiftBehavior
  applyWorkaroundForContentInsetHitTestBug?: boolean
}

export default function AppKeyboardAvoidingView({
  children,
  style,
  keyboardVerticalOffset = 0,
  behavior
}: Props) {
  const resolvedBehavior =
    behavior ?? (Platform.OS === 'ios' ? 'padding' : 'height')

  return (
    <ControllerKeyboardAvoidingView
      style={style}
      behavior={resolvedBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </ControllerKeyboardAvoidingView>
  )
}

export function AppKeyboardStickyView({
  children,
  style,
  offset = { closed: 0, opened: 0 }
}: StickyProps) {
  return (
    <ControllerKeyboardStickyView style={style} offset={offset}>
      {children}
    </ControllerKeyboardStickyView>
  )
}

export function AppKeyboardGestureArea(props: GestureAreaProps) {
  return <ControllerKeyboardGestureArea {...props} />
}

export const AppKeyboardChatScrollView = forwardRef<
  React.ElementRef<typeof ControllerKeyboardAwareScrollView>,
  AppKeyboardChatScrollViewProps
>(
  (
    {
      children,
      style,
      automaticallyAdjustContentInsets = false,
      contentInsetAdjustmentBehavior = 'never',
      keyboardDismissMode = Platform.OS === 'ios' ? 'interactive' : 'on-drag',
      keyboardShouldPersistTaps = 'handled',
      extraContentPadding,
      blankSpace,
      offset = 0,
      keyboardLiftBehavior: _keyboardLiftBehavior = 'whenAtEnd',
      applyWorkaroundForContentInsetHitTestBug:
        _applyWorkaroundForContentInsetHitTestBug = Platform.OS === 'ios',
      ...props
    },
    ref
  ) => {
    const spacerStyle = useAnimatedStyle(() => {
      const blankHeight = blankSpace?.value ?? 0
      const extraPadding = extraContentPadding?.value ?? 0

      return {
        height: Math.max(blankHeight + extraPadding, 0)
      }
    }, [blankSpace, extraContentPadding])

    return (
      <ControllerKeyboardAwareScrollView
        ref={ref}
        style={style}
        bottomOffset={offset}
        automaticallyAdjustContentInsets={automaticallyAdjustContentInsets}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        {...props}
      >
        {children}
        <Animated.View pointerEvents="none" style={spacerStyle} />
      </ControllerKeyboardAwareScrollView>
    )
  }
)

AppKeyboardChatScrollView.displayName = 'AppKeyboardChatScrollView'
