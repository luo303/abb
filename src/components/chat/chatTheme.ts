import { APP_COLORS, APP_GRADIENTS } from '@/theme/paperTheme'

export const chatPalette = {
  page: APP_COLORS.background,
  shell: APP_COLORS.backgroundSoft,
  header: APP_COLORS.surfaceVariant,
  surface: APP_COLORS.surfaceStrong,
  surfaceSoft: APP_COLORS.surface,
  surfaceSoftAlt: APP_COLORS.surfaceSoft,
  border: APP_COLORS.outlineVariant,
  borderStrong: APP_COLORS.outline,
  accent: APP_COLORS.primary,
  accentStrong: APP_COLORS.primaryStrong,
  accentSoft: APP_COLORS.surfaceVariant,
  accentMuted: APP_COLORS.secondary,
  peach: '#f4c8ce',
  peachSoft: APP_COLORS.backgroundSoft,
  text: APP_COLORS.text,
  textStrong: '#47343a',
  textMuted: APP_COLORS.textMuted,
  badge: APP_COLORS.primaryStrong,
  online: APP_COLORS.secondary,
  overlay: 'rgba(67, 38, 46, 0.38)'
} as const

export const chatGradients = {
  page: [APP_COLORS.surfaceSoft, APP_COLORS.backgroundSoft, '#fffdfd'] as const,
  hero: [
    APP_COLORS.surfaceSoft,
    APP_COLORS.surfaceVariant,
    APP_COLORS.surface
  ] as const,
  accent: APP_GRADIENTS.primary,
  peach: ['#f5d1d7', '#efb5c0'] as const,
  avatar: ['#f1bcc7', APP_COLORS.primary] as const
} as const

export const chatCardShadow = {
  shadowColor: APP_COLORS.shadow,
  shadowOffset: {
    width: 0,
    height: 12
  },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 5
} as const

export const chatSoftShadow = {
  shadowColor: APP_COLORS.shadow,
  shadowOffset: {
    width: 0,
    height: 8
  },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 3
} as const
