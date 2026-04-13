import React, { forwardRef } from 'react'
import { Platform, StyleProp, ViewStyle } from 'react-native'
import {
  KeyboardAvoidingView as ControllerKeyboardAvoidingView,
  KeyboardStickyView as ControllerKeyboardStickyView,
  KeyboardChatScrollView as ControllerKeyboardChatScrollView
} from 'react-native-keyboard-controller'
import type { KeyboardChatScrollViewProps } from 'react-native-keyboard-controller'

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

export const AppKeyboardChatScrollView = forwardRef<
  any,
  KeyboardChatScrollViewProps
>(
  (
    {
      children,
      style,
      keyboardDismissMode = Platform.OS === 'ios' ? 'interactive' : 'on-drag',
      keyboardShouldPersistTaps = 'handled',
      applyWorkaroundForContentInsetHitTestBug = Platform.OS === 'ios',
      ...props
    },
    ref
  ) => {
    return (
      <ControllerKeyboardChatScrollView
        ref={ref}
        style={style}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        applyWorkaroundForContentInsetHitTestBug={
          applyWorkaroundForContentInsetHitTestBug
        }
        {...props}
      >
        {children}
      </ControllerKeyboardChatScrollView>
    )
  }
)

AppKeyboardChatScrollView.displayName = 'AppKeyboardChatScrollView'
