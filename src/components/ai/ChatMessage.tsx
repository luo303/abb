import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'

import { useMessage } from '../Message'
import { Message } from '../../types/AIchat'

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
  const { showMessage } = useMessage()
  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content)
    showMessage('复制成功')
  }

  const handleSpeak = () => {
    onSpeak()
  }

  return (
    <View
      style={[
        styles.container,
        message.role === 'user' ? styles.userContainer : styles.aiContainer
      ]}
    >
      <View
        style={[
          styles.messageColumn,
          message.role === 'user' ? styles.userColumn : styles.aiColumn
        ]}
      >
        <View
          style={[
            styles.contentWrapper,
            message.role === 'user' ? styles.userBubble : styles.aiContent
          ]}
        >
          <Text
            style={[
              styles.text,
              message.role === 'user' ? styles.userText : styles.aiText
            ]}
          >
            {message.content}
          </Text>
        </View>

        {message.role === 'assistant' && (
          <View style={styles.aiFooter}>
            <TouchableOpacity
              onPress={handleCopy}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="copy-outline" size={16} color="#999" />
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

      {message.role === 'user' && (
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
    alignItems: 'flex-end',
    maxWidth: '85%'
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
