import { Platform } from 'react-native'
import { APP_COLORS } from '@/theme/paperTheme'

export const composerTheme = {
  footerBackground: APP_COLORS.surfaceStrong,
  footerBorder: APP_COLORS.outlineVariant,
  shellBackground: APP_COLORS.backgroundSoft,
  shellBackgroundFocused: APP_COLORS.surfaceStrong,
  shellBorder: APP_COLORS.outlineVariant,
  shellBorderFocused: APP_COLORS.secondaryStrong,
  text: APP_COLORS.text,
  placeholder: '#baa4ab',
  muted: APP_COLORS.textMuted,
  accent: APP_COLORS.primary,
  accentDisabled: APP_COLORS.surfaceSoft,
  accentText: APP_COLORS.white
}

export const composerFooterShadow =
  Platform.select({
    ios: {
      shadowColor: APP_COLORS.shadow,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.05,
      shadowRadius: 8
    },
    android: {
      elevation: 2
    }
  }) ?? {}

export const composerFieldShadow =
  Platform.select({
    ios: {
      shadowColor: APP_COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6
    },
    android: {
      elevation: 1
    }
  }) ?? {}

export const composerFieldFocusShadow =
  Platform.select({
    ios: {
      shadowColor: APP_COLORS.secondaryStrong,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10
    },
    android: {
      elevation: 2
    }
  }) ?? {}

export const composerSendShadow =
  Platform.select({
    ios: {
      shadowColor: APP_COLORS.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 6
    },
    android: {
      elevation: 2
    }
  }) ?? {}
