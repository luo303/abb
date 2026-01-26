import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: number
}

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <View
      style={[
        styles.container,
        message.isUser ? styles.userContainer : styles.aiContainer
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
  contentWrapper: {
    maxWidth: '100%',
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
  }
})
