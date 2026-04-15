import React from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import ChatAvatar from '@/components/chat/ChatAvatar'
import { chatPalette, chatSoftShadow } from '@/components/chat/chatTheme'
import { MessengerMessage } from '@/store/modules/MessengerStore'

type Props = {
  message: MessengerMessage
  isMine: boolean
  avatar?: string | null
  senderLabel: string
  showSenderName?: boolean
  onPressImage?: (uri: string) => void
}

export default function ChatMessageBubble({
  message,
  isMine,
  avatar,
  senderLabel,
  showSenderName = false,
  onPressImage
}: Props) {
  return (
    <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
      {!isMine ? (
        <ChatAvatar
          uri={avatar}
          label={senderLabel}
          size={38}
          shape="roundedSquare"
        />
      ) : null}

      <View
        style={[
          styles.bubbleColumn,
          isMine ? styles.bubbleColumnRight : styles.bubbleColumnLeft
        ]}
      >
        {showSenderName && !isMine ? (
          <Text style={styles.senderName}>{senderLabel}</Text>
        ) : null}

        {message.type === 'image' ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPressImage?.(message.content)}
            style={[
              styles.imageBubble,
              isMine ? styles.imageBubbleRight : styles.imageBubbleLeft
            ]}
          >
            <Image source={{ uri: message.content }} style={styles.image} />
            {message.localStatus === 'uploading' ? (
              <View style={styles.imageOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : null}
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.textBubble,
              isMine ? styles.textBubbleRight : styles.textBubbleLeft
            ]}
          >
            <Text
              style={[styles.text, isMine ? styles.textRight : styles.textLeft]}
            >
              {message.content}
            </Text>
          </View>
        )}
      </View>

      {isMine ? (
        <ChatAvatar
          uri={avatar}
          label={senderLabel}
          size={38}
          shape="roundedSquare"
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  rowLeft: {
    justifyContent: 'flex-start'
  },
  rowRight: {
    justifyContent: 'flex-end'
  },
  bubbleColumn: {
    maxWidth: '76%'
  },
  bubbleColumnLeft: {
    marginLeft: 10
  },
  bubbleColumnRight: {
    marginRight: 10
  },
  senderName: {
    fontSize: 11,
    color: chatPalette.textMuted,
    marginBottom: 6,
    marginLeft: 4
  },
  textBubble: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20
  },
  textBubbleLeft: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 9,
    borderWidth: 1,
    borderColor: chatPalette.border,
    ...chatSoftShadow
  },
  textBubbleRight: {
    backgroundColor: chatPalette.accent,
    borderTopRightRadius: 9
  },
  text: {
    fontSize: 15,
    lineHeight: 22
  },
  textLeft: {
    color: chatPalette.text
  },
  textRight: {
    color: '#fff'
  },
  imageBubble: {
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: chatPalette.border
  },
  imageBubbleLeft: {
    borderTopLeftRadius: 10
  },
  imageBubbleRight: {
    borderTopRightRadius: 10
  },
  image: {
    width: 188,
    height: 188,
    backgroundColor: chatPalette.surfaceSoftAlt
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
