import React from 'react'

import PaperAvatar from '@/components/common/PaperAvatar'
import { chatPalette } from '@/components/chat/chatTheme'

type Props = {
  uri?: string | null
  label: string
  size?: number
  style?: any
  shape?: 'circle' | 'roundedSquare'
}

export default function ChatAvatar({
  uri,
  label,
  size = 54,
  style,
  shape = 'circle'
}: Props) {
  const borderRadius =
    shape === 'roundedSquare' ? Math.max(size * 0.26, 14) : size / 2

  return (
    <PaperAvatar
      accessibilityLabel={label}
      backgroundColor={chatPalette.surfaceSoftAlt}
      shape={shape}
      size={size}
      source={uri}
      style={[
        {
          borderRadius
        },
        style
      ]}
    />
  )
}
