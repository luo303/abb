import React from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { AppKeyboardStickyView } from './AppKeyboardAvoidingView'

type Props = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  offset?: {
    closed?: number
    opened?: number
  }
}

export default function KeyboardStickyFooter({
  children,
  style,
  offset = { closed: 0, opened: 0 }
}: Props) {
  return (
    <AppKeyboardStickyView offset={offset} style={[styles.footer, style]}>
      {children}
    </AppKeyboardStickyView>
  )
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20
  }
})
