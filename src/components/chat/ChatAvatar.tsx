import React from 'react'
import { Image, StyleSheet, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import {
  chatGradients,
  chatPalette,
  chatSoftShadow
} from '@/components/chat/chatTheme'

type Props = {
  uri?: string | null
  label: string
  size?: number
  style?: any
  shape?: 'circle' | 'roundedSquare'
}

const getInitials = (label: string) => {
  const normalized = label.trim()
  if (!normalized) return '聊'
  return normalized.slice(0, 1).toUpperCase()
}

export default function ChatAvatar({
  uri,
  label,
  size = 54,
  style,
  shape = 'circle'
}: Props) {
  const radius =
    shape === 'roundedSquare' ? Math.max(size * 0.26, 14) : size / 2

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: radius
          },
          style
        ]}
      />
    )
  }

  return (
    <LinearGradient
      colors={chatGradients.avatar}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: radius
        },
        style
      ]}
    >
      <Text
        style={[styles.fallbackText, { fontSize: Math.max(size * 0.34, 14) }]}
      >
        {getInitials(label)}
      </Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: chatPalette.surfaceSoftAlt
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    ...chatSoftShadow
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '800'
  }
})
