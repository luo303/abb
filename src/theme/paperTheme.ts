import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native'
import { MD3LightTheme } from 'react-native-paper'

export const APP_COLORS = {
  background: '#fff7f9',
  backgroundSoft: '#fffafb',
  surface: '#ffffff',
  surfaceStrong: '#ffffff',
  surfaceVariant: '#fff1f2',
  surfaceSoft: '#ffe4e6',
  outline: '#fecdd3',
  outlineVariant: '#ffe4e6',
  primary: '#f43f5e',
  primaryStrong: '#ff1744',
  secondary: '#fb7185',
  secondaryStrong: '#fb7185',
  text: '#4b3140',
  textMuted: '#8b6a78',
  iconMuted: '#9d8b93',
  shadow: '#f43f5e',
  error: '#d76778',
  white: '#ffffff'
} as const

export const APP_GRADIENTS = {
  primary: ['#ff9a9e', '#fb7185', '#f43f5e'] as const,
  softSurface: ['#ffffff', '#fff1f2'] as const,
  auth: ['#fff1f2', '#ffe4e6', '#ffffff'] as const
} as const

export const appPaperTheme = {
  ...MD3LightTheme,
  roundness: 20,
  colors: {
    ...MD3LightTheme.colors,
    primary: APP_COLORS.primary,
    onPrimary: APP_COLORS.white,
    primaryContainer: APP_COLORS.surfaceVariant,
    onPrimaryContainer: APP_COLORS.text,
    secondary: APP_COLORS.secondary,
    onSecondary: APP_COLORS.white,
    secondaryContainer: APP_COLORS.surfaceVariant,
    onSecondaryContainer: APP_COLORS.text,
    tertiary: APP_COLORS.primaryStrong,
    error: APP_COLORS.error,
    background: APP_COLORS.background,
    surface: APP_COLORS.surface,
    surfaceDisabled: APP_COLORS.backgroundSoft,
    surfaceVariant: APP_COLORS.surfaceVariant,
    onSurface: APP_COLORS.text,
    onSurfaceVariant: APP_COLORS.textMuted,
    outline: APP_COLORS.outline,
    outlineVariant: APP_COLORS.outlineVariant,
    inversePrimary: APP_COLORS.primaryStrong
  }
}

export const appNavigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: APP_COLORS.primary,
    background: APP_COLORS.background,
    card: APP_COLORS.surface,
    text: APP_COLORS.text,
    border: APP_COLORS.outlineVariant,
    notification: APP_COLORS.primaryStrong
  }
}

export type AppPaperTheme = typeof appPaperTheme
