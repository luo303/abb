import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'

import { useMessage } from '../Message'
import { Message } from '../../types/AIchat'

interface ChatMessageProps {
  message: Message
  isSpeaking: boolean
  onSpeak: () => void
  onWonderPress?: (text: string) => void
  isLatest?: boolean
}

export default function ChatMessage({
  message,
  isSpeaking,
  onSpeak,
  onWonderPress,
  isLatest = false
}: ChatMessageProps) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)

  const { showMessage } = useMessage()
  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content)
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
            {message.content}
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

        {/* 猜你想问列表 - 仅在最新一条消息显示 */}
        {!message.isUser &&
          isLatest &&
          message.wonder &&
          message.wonder.length > 0 && (
            <View style={styles.wonderContainer}>
              <View style={styles.wonderHeader}>
                <Ionicons name="sparkles-outline" size={14} color="#1f99b0" />
                <Text style={styles.wonderTitle}>猜你想问</Text>
              </View>
              {message.wonder.map((content, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.wonderItem}
                  onPress={() => onWonderPress?.(content)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.wonderText}>{content}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              ))}
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
  },
  wonderContainer: {
    marginTop: 16,
    width: '100%'
  },
  wonderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  wonderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f99b0',
    marginLeft: 6
  },
  wonderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fcfd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e1f5f8'
  },
  wonderText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
    lineHeight: 20
  }
})
