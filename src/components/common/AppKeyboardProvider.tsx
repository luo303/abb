import React from 'react'
import { KeyboardProvider } from 'react-native-keyboard-controller'

type ProviderProps = {
  children: React.ReactNode
}

export default function AppKeyboardProvider({ children }: ProviderProps) {
  return <KeyboardProvider statusBarTranslucent>{children}</KeyboardProvider>
}
