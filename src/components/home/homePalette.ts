import { APP_COLORS } from '@/theme/paperTheme'

export type HomeTone = 'default' | 'pink'

export const HOME_PINK_THEME = {
  background: APP_COLORS.background,
  backgroundSoft: APP_COLORS.backgroundSoft,
  surface: APP_COLORS.surface,
  surfaceSoft: APP_COLORS.surfaceSoft,
  border: APP_COLORS.outline,
  primary: APP_COLORS.primary,
  primaryStrong: APP_COLORS.primaryStrong,
  primarySoft: APP_COLORS.secondary,
  text: APP_COLORS.text,
  textMuted: APP_COLORS.textMuted,
  iconMuted: APP_COLORS.iconMuted,
  shadow: APP_COLORS.shadow,
  overlay: 'rgba(93, 71, 77, 0.24)',
  white: APP_COLORS.white
} as const
