import React, { memo, useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMappingHelper } from '@shopify/flash-list'
import * as Clipboard from 'expo-clipboard'
import Markdown from 'react-native-markdown-display'
import ImageViewing from 'react-native-image-viewing'

import { useMessage } from '../Message'
import { Message } from '../../types/AIchat'

interface ChatMessageProps {
  message: Message
  isSpeaking: boolean
  onSpeak: (timestamp: number, text: string) => void
  isTyping?: boolean
  onLayout?: (event: LayoutChangeEvent) => void
}

function ChatMessage({
  message,
  isSpeaking = false,
  onSpeak,
  isTyping = false,
  onLayout
}: ChatMessageProps) {
  const { showMessage } = useMessage()
  const { getMappingKey } = useMappingHelper()
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const previewImages = useMemo(() => {
    return message.images?.map(uri => ({ uri })) || []
  }, [message.images])

  const markdownStyle = useMemo<any>(() => {
    return {
      body: {
        width: '100%',
        color: '#333'
      },
      text: {
        fontSize: 16,
        lineHeight: 26,
        color: '#333'
      },
      paragraph: {
        width: '100%',
        marginTop: 0,
        marginBottom: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      },
      ordered_list: {
        width: '100%',
        marginVertical: 0
      },
      bullet_list: {
        width: '100%',
        marginVertical: 0
      },
      list_item: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6
      },
      ordered_list_icon: {
        width: 28,
        marginLeft: 0,
        marginRight: 6,
        lineHeight: 26,
        color: '#333'
      },
      ordered_list_content: {
        flex: 1,
        flexShrink: 1
      },
      bullet_list_icon: {
        width: 22,
        marginLeft: 0,
        marginRight: 6,
        lineHeight: 26,
        color: '#333'
      },
      bullet_list_content: {
        flex: 1,
        flexShrink: 1
      },
      heading1: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '700',
        marginBottom: 10,
        color: '#222'
      },
      heading2: {
        fontSize: 22,
        lineHeight: 30,
        fontWeight: '700',
        marginBottom: 10,
        color: '#222'
      },
      heading3: {
        fontSize: 19,
        lineHeight: 28,
        fontWeight: '700',
        marginBottom: 8,
        color: '#222'
      },
      strong: {
        fontWeight: '700',
        color: '#222'
      },
      blockquote: {
        marginVertical: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#D8E3EA',
        backgroundColor: '#F7FAFC'
      },
      code_inline: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F5F7FA',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 3,
        color: '#334155'
      },
      code_block: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        padding: 12,
        color: '#334155'
      },
      fence: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        padding: 12,
        color: '#334155'
      }
    }
  }, [])

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false)
  }, [])

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(message.content)
    showMessage('复制成功')
  }, [message.content, showMessage])

  const handleSpeakPress = useCallback(() => {
    onSpeak(message.timestamp, message.content)
  }, [message.content, message.timestamp, onSpeak])

  const shouldShowThinking =
    message.role === 'assistant' && isTyping && !message.content
  const shouldRenderMarkdown = message.role === 'assistant' && !!message.content

  return (
    <View
      onLayout={onLayout}
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
                key={getMappingKey(img, index)}
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
            ) : shouldShowThinking ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="small" color="#1f99b0" />
                <Text style={styles.loadingText}>AI 正在思考...</Text>
              </View>
            ) : shouldRenderMarkdown ? (
              <View style={styles.markdownHost}>
                <Markdown style={markdownStyle}>{message.content}</Markdown>
              </View>
            ) : (
              <Text style={[styles.text, styles.aiText]}>
                {message.content}
              </Text>
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
              onPress={handleSpeakPress}
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
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        keyExtractor={item =>
          item &&
          typeof item === 'object' &&
          'uri' in item &&
          typeof item.uri === 'string'
            ? item.uri
            : String(item)
        }
      />
    </View>
  )
}

const MemoChatMessage = memo(ChatMessage, (prev, next) => {
  const prevImages = prev.message.images || []
  const nextImages = next.message.images || []

  return (
    prev.isSpeaking === next.isSpeaking &&
    prev.isTyping === next.isTyping &&
    prev.onLayout === next.onLayout &&
    prev.message.role === next.message.role &&
    prev.message.content === next.message.content &&
    prev.message.timestamp === next.message.timestamp &&
    prevImages.length === nextImages.length &&
    prevImages.every((img, index) => img === nextImages[index])
  )
})

MemoChatMessage.displayName = 'ChatMessage'
export default MemoChatMessage

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
    width: '100%',
    flexShrink: 1
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
  contentWrapper: {
    minHeight: 24
  },
  userBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  aiContent: {
    width: '100%',
    paddingRight: 8
  },
  markdownHost: {
    width: '100%',
    flexShrink: 1
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
    marginTop: 6,
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
