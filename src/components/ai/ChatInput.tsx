import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text
} from 'react-native'
import { memo, useCallback, useMemo, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import ImageViewing from 'react-native-image-viewing'

export interface ImageItem {
  uri: string
  status: 'uploading' | 'done' | 'error'
  url?: string
}

interface ChatInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  disabled?: boolean
  images: ImageItem[]
  onAddImages: (uris: string[]) => void
  onRemoveImage: (index: number) => void
  privateKbEnabled?: boolean
  onTogglePrivateKb?: () => void
}

function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled,
  images = [],
  onAddImages,
  onRemoveImage,
  privateKbEnabled = false,
  onTogglePrivateKb
}: ChatInputProps) {
  const insets = useSafeAreaInsets()
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const paddingBottom = useMemo(() => {
    return Platform.OS === 'android' ? 16 : Math.max(insets.bottom, 16)
  }, [insets.bottom])

  const containerStyle = useMemo(() => {
    return [styles.container, { paddingBottom }]
  }, [paddingBottom])

  const previewImages = useMemo(() => {
    return images.map(img => ({ uri: img.uri }))
  }, [images])

  const hasBlockedImage = useMemo(() => {
    return images.some(
      img => img.status === 'uploading' || img.status === 'error'
    )
  }, [images])

  const isSendDisabled = useMemo(() => {
    return !!disabled || hasBlockedImage
  }, [disabled, hasBlockedImage])

  const canSend = useMemo(() => {
    if (isSendDisabled) return false
    return value.trim().length > 0
  }, [isSendDisabled, value])

  const openPreviewAtIndex = useCallback((index: number) => {
    setCurrentImageIndex(index)
    setIsPreviewVisible(true)
  }, [])

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false)
  }, [])

  const pickImage = useCallback(async () => {
    // 请求权限
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('需要权限', '需要访问相册权限以选择图片')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // 允许选择多张时通常不支持编辑
      quality: 0.8,
      allowsMultipleSelection: true, // 允许选择多张
      selectionLimit: 9 - images.length // 限制总数
    })

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri)
      onAddImages(newUris)
    }
  }, [images.length, onAddImages])

  const handleSend = useCallback(() => {
    if (value.trim().length === 0) return
    onSend()
  }, [onSend, value])

  return (
    <View style={containerStyle} pointerEvents="box-none">
      <View style={styles.card}>
        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageList}
            contentContainerStyle={styles.imageListContent}
          >
            {images.map((img, index) => (
              <View key={index} style={styles.imagePreview}>
                <TouchableOpacity
                  onPress={() => {
                    openPreviewAtIndex(index)
                  }}
                >
                  <Image
                    source={{ uri: img.url }}
                    style={[
                      styles.image,
                      img.status === 'uploading' && styles.uploadingImage
                    ]}
                  />
                  {img.status === 'uploading' && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                  {img.status === 'error' && (
                    <View style={styles.errorOverlay}>
                      <Ionicons name="alert-circle" size={20} color="#ff4444" />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => onRemoveImage(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="rgba(0,0,0,0.6)"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="问问小稚"
          placeholderTextColor="#B0B0B0"
          multiline
          maxLength={1000}
        />

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.pill, privateKbEnabled && styles.pillActive]}
            onPress={onTogglePrivateKb}
            activeOpacity={0.85}
            disabled={!onTogglePrivateKb}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={privateKbEnabled ? '#1890ff' : '#111'}
            />
            <Text
              style={[
                styles.pillText,
                privateKbEnabled && styles.pillTextActive
              ]}
            >
              私人知识库
            </Text>
          </TouchableOpacity>

          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={pickImage}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={28} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.85}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={!canSend ? '#CFD8DC' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ImageViewing
        images={previewImages}
        imageIndex={currentImageIndex}
        visible={isPreviewVisible}
        onRequestClose={closePreview}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        keyExtractor={(_, index) => `chat-input-preview-${index}`}
      />
    </View>
  )
}

export default memo(ChatInput, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.images === next.images &&
    prev.onChangeText === next.onChangeText &&
    prev.onSend === next.onSend &&
    prev.onAddImages === next.onAddImages &&
    prev.onRemoveImage === next.onRemoveImage &&
    prev.privateKbEnabled === next.privateKbEnabled &&
    prev.onTogglePrivateKb === next.onTogglePrivateKb
  )
})

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'transparent'
  },
  card: {
    width: '100%',
    backgroundColor: 'transparent'
  },
  input: {
    fontSize: 16,
    color: '#37474F',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 6,
    minHeight: 44,
    maxHeight: 120,
    textAlignVertical: 'top'
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F5',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    gap: 8
  },
  pillActive: {
    backgroundColor: '#E6F4FF'
  },
  pillText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600'
  },
  pillTextActive: {
    color: '#1890ff'
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9aa8ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E6EB'
  },
  imageList: {
    marginBottom: 8,
    maxHeight: 110,
    paddingTop: 8
  },
  imageListContent: {
    paddingHorizontal: 4
  },
  imagePreview: {
    marginRight: 8,
    position: 'relative',
    width: 80,
    height: 80
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  uploadingImage: {
    opacity: 0.8
  }
})
