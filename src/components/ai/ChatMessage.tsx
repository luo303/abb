import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'

import { useMessage } from '../Message'
export interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: number
}

interface ChatMessageProps {
  message: Message
  isSpeaking: boolean
  onSpeak: () => void
}

export default function ChatMessage({
  message,
  isSpeaking,
  onSpeak
}: ChatMessageProps) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)

  const { showMessage } = useMessage()
  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.text)
    showMessage('复制成功')
  }

  const handleLike = () => {
    setLiked(!liked)
    if (disliked) setDisliked(false)
  }

  const handleDislike = () => {
    setDisliked(!disliked)
    if (liked) setLiked(false)
  }

  const handleSpeak = () => {
    onSpeak()
  }

  return (
    <View
      style={[
        styles.container,
        message.isUser ? styles.userContainer : styles.aiContainer
      ]}
    >
      <View
        style={[
          styles.messageColumn,
          message.isUser ? styles.userColumn : styles.aiColumn
        ]}
      >
        <View
          style={[
            styles.contentWrapper,
            message.isUser ? styles.userBubble : styles.aiContent
          ]}
        >
          <Text
            style={[
              styles.text,
              message.isUser ? styles.userText : styles.aiText
            ]}
          >
            {message.text}
          </Text>
        </View>

        {!message.isUser && (
          <View style={styles.aiFooter}>
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="copy-outline" size={16} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLike}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name={liked ? 'thumbs-up' : 'thumbs-o-up'}
                size={16}
                color={liked ? '#ff4d4f' : '#999'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDislike}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name={disliked ? 'thumbs-down' : 'thumbs-o-down'}
                size={16}
                color={disliked ? '#ff4d4f' : '#999'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSpeak}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isSpeaking ? 'volume-high' : 'volume-high-outline'}
                size={16}
                color={isSpeaking ? '#1f99b0' : '#999'}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {message.isUser && (
        <Ionicons
          name="person-circle"
          size={40}
          color="#b1aea9ff"
          style={{ marginLeft: 8 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
    paddingHorizontal: 4
  },
  userContainer: {
    justifyContent: 'flex-end'
  },
  aiContainer: {
    justifyContent: 'flex-start'
  },
  messageColumn: {
    maxWidth: '100%'
  },
  userColumn: {
    alignItems: 'flex-end'
  },
  aiColumn: {
    alignItems: 'flex-start',
    flex: 1
  },
  contentWrapper: {
    padding: 12,
    minHeight: 24
  },
  userBubble: {
    backgroundColor: '#f0f0f0', // 极简浅灰背景
    borderRadius: 18, // 统一圆角
    paddingVertical: 10,
    paddingHorizontal: 14
    // 移除阴影和尖角，追求扁平化
  },
  aiContent: {
    // 无背景，无边框，仅文本区域
    paddingLeft: 0,
    paddingRight: 8
  },
  text: {
    fontSize: 16,
    lineHeight: 26
  },
  userText: {
    color: '#263238'
  },
  aiText: {
    color: '#333'
  },
  aiFooter: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 16,
    paddingLeft: 0
  },
  actionButton: {
    padding: 4
  }
})
