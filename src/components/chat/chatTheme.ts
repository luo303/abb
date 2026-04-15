export const chatPalette = {
  page: '#FFF7F9',
  shell: '#FFF2F6',
  header: '#FFF1F5',
  surface: '#FFFFFF',
  surfaceSoft: '#FFF2F5',
  surfaceSoftAlt: '#FFE7EE',
  border: '#F6D8E1',
  borderStrong: '#EDB8C8',
  accent: '#F26D91',
  accentStrong: '#E4527E',
  accentSoft: '#FFD6E2',
  accentMuted: '#F9A4B9',
  peach: '#FFD8C8',
  peachSoft: '#FFF1EA',
  text: '#4B3140',
  textStrong: '#341F2C',
  textMuted: '#8B6A78',
  badge: '#FF5D8D',
  online: '#FF9CB2',
  overlay: 'rgba(58, 22, 38, 0.38)'
} as const

export const chatGradients = {
  page: ['#FFE5EC', '#FFF5F7', '#FFFDFC'] as const,
  hero: ['#FFE0E9', '#FFF1F5', '#FFF9FA'] as const,
  accent: ['#FF9FB5', '#F26D91'] as const,
  peach: ['#FFD9CC', '#FFC2C9'] as const,
  avatar: ['#FFB0A0', '#F56E90'] as const
} as const

export const chatCardShadow = {
  shadowColor: '#DC7E9C',
  shadowOffset: {
    width: 0,
    height: 12
  },
  shadowOpacity: 0.08,
  shadowRadius: 24,
  elevation: 5
} as const

export const chatSoftShadow = {
  shadowColor: '#E39AB4',
  shadowOffset: {
    width: 0,
    height: 8
  },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 3
} as const
