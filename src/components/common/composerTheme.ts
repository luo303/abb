import { Platform } from 'react-native'

export const composerTheme = {
  footerBackground: '#FFFDFE',
  footerBorder: '#F1EAEE',
  shellBackground: '#FAF6F8',
  shellBackgroundFocused: '#FFFFFF',
  shellBorder: '#E8DDE2',
  shellBorderFocused: '#E7A6B8',
  text: '#4C4247',
  placeholder: '#B6A5AD',
  muted: '#9D8B93',
  accent: '#F05B78',
  accentDisabled: '#F4D6DE',
  accentText: '#FFFFFF'
}

export const composerFooterShadow =
  Platform.select({
    ios: {
      shadowColor: '#D9CCD2',
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
      shadowColor: '#D8CBD0',
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
      shadowColor: '#E79AAD',
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
      shadowColor: '#EE8EA5',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 6
    },
    android: {
      elevation: 2
    }
  }) ?? {}
