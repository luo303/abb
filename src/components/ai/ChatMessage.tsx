import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { memo, useCallback, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import Markdown from 'react-native-markdown-display'

import { useMessage } from '../Message'
import { Message } from '../../types/AIchat'
import ImageViewing from 'react-native-image-viewing'

interface ChatMessageProps {
  message: Message
  isSpeaking: boolean
  onSpeak: (timestamp: number, text: string) => void
  isTyping?: boolean
}

function ChatMessage({
  message,
  isSpeaking,
  onSpeak,
  isTyping = false
}: ChatMessageProps) {
  const { showMessage } = useMessage()
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const previewImages = useMemo(() => {
    return message.images?.map(uri => ({ uri })) || []
  }, [message.images])

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false)
  }, [])

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(message.content)
    showMessage('复制成功')
  }, [message.content, showMessage])

  const handleSpeak = useCallback(() => {
    onSpeak(message.timestamp, message.content)
  }, [message.content, message.timestamp, onSpeak])

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
        {message.images && message.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageContainer}
            contentContainerStyle={styles.imageContentContainer}
          >
            {message.images.map((img, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setCurrentImageIndex(index)
                  setIsPreviewVisible(true)
                }}
                activeOpacity={0.9}
                style={styles.imageWrapper}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {(message.content || (message.role === 'assistant' && isTyping)) && (
          <View
            style={[
              styles.contentWrapper,
              message.role === 'user' ? styles.userBubble : styles.aiContent
            ]}
          >
            {message.role === 'user' ? (
              <Text style={[styles.text, styles.userText]}>
                {message.content}
              </Text>
            ) : message.content ? (
              isTyping ? (
                <Text style={[styles.text, styles.aiText]}>
                  {message.content}
                </Text>
              ) : (
                <Markdown
                  style={{
                    body: {
                      fontSize: 16,
                      color: '#333'
                    },
                    paragraph: {
                      marginVertical: 0
                    }
                  }}
                >
                  {message.content}
                </Markdown>
              )
            ) : (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="small" color="#1f99b0" />
                <Text style={styles.loadingText}>AI 正在思考...</Text>
              </View>
            )}
          </View>
        )}
        {message.role === 'assistant' && !isTyping && message.content ? (
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
        ) : null}
      </View>

      <ImageViewing
        images={previewImages}
        imageIndex={currentImageIndex}
        visible={isPreviewVisible}
        onRequestClose={closePreview}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        keyExtractor={(_, index) => `chat-message-preview-${index}`}
      />
    </View>
  )
}

export default memo(ChatMessage, (prev, next) => {
  return (
    prev.message === next.message &&
    prev.isSpeaking === next.isSpeaking &&
    prev.isTyping === next.isTyping &&
    prev.onSpeak === next.onSpeak
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
    paddingHorizontal: 4
  },
  imageContainer: {
    marginBottom: 8,
    maxHeight: 200
  },
  imageContentContainer: {
    paddingRight: 4
  },
  imageWrapper: {
    marginRight: 8
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 8
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
  },
  loadingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  loadingText: {
    marginLeft: 8,
    color: '#999',
    fontSize: 14
  }
})
