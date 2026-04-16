import { MD3LightTheme } from 'react-native-paper'

export const appPaperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#f43f5e',
    secondary: '#fb7185',
    error: '#ef4444',
    surface: '#ffffff',
    surfaceVariant: '#fff1f2',
    outline: '#fecdd3',
    outlineVariant: '#ffe4e6',
    secondaryContainer: '#ffe4e6'
  }
}

export type AppPaperTheme = typeof appPaperTheme
