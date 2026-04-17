import React, { useEffect, useMemo, useState } from 'react'
import {
  Image,
  ImageResizeMode,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  ViewStyle
} from 'react-native'
import { Avatar } from 'react-native-paper'

export const DEFAULT_AVATAR_SOURCE = require('@/assets/testAvatar.png')

type AvatarSource = string | ImageSourcePropType | null | undefined

interface PaperAvatarProps {
  source?: AvatarSource
  size?: number
  shape?: 'circle' | 'roundedSquare'
  style?: StyleProp<ViewStyle>
  backgroundColor?: string
  resizeMode?: ImageResizeMode
  accessibilityLabel?: string
}

const resolveSource = (source?: AvatarSource) => {
  if (typeof source === 'string') {
    const trimmedSource = source.trim()
    return trimmedSource ? { uri: trimmedSource } : DEFAULT_AVATAR_SOURCE
  }

  return source || DEFAULT_AVATAR_SOURCE
}

export default function PaperAvatar({
  source,
  size = 40,
  shape = 'circle',
  style,
  backgroundColor = '#f3f4f6',
  resizeMode = 'cover',
  accessibilityLabel
}: PaperAvatarProps) {
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    setLoadError(false)
  }, [source])

  const borderRadius =
    shape === 'roundedSquare' ? Math.max(size * 0.26, 14) : size / 2
  const finalSource = useMemo(() => {
    return loadError ? DEFAULT_AVATAR_SOURCE : resolveSource(source)
  }, [loadError, source])

  return (
    <Avatar.Image
      accessibilityLabel={accessibilityLabel}
      size={size}
      source={({ size: currentSize }) => (
        <Image
          accessibilityIgnoresInvertColors
          onError={() => setLoadError(true)}
          resizeMode={resizeMode}
          source={finalSource}
          style={[
            styles.image,
            {
              width: currentSize,
              height: currentSize,
              borderRadius,
              backgroundColor
            }
          ]}
        />
      )}
      style={[
        styles.container,
        {
          borderRadius,
          backgroundColor
        },
        style
      ]}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden'
  },
  image: {
    overflow: 'hidden'
  }
})
