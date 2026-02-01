import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'

import { useMessage } from '../Message'
import { Message } from '../../types/AIchat'
import ImagePreviewModal from '../common/ImagePreviewModal'

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
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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
                onPress={() => setPreviewImage(img)}
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
        {message.content && (
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
        )}
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

      <ImagePreviewModal
        visible={!!previewImage}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
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
    width: 200,
    height: 200,
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
  }
})
