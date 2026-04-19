import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator,
  Text
} from 'react-native'
import { memo, useCallback, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import ImageViewing from 'react-native-image-viewing'
import {
  Plus,
  ArrowUpSmall,
  Xmark,
  CheckCircle,
  ExclamationCircle
} from '@zappicon/react-native'

import { uploadFile } from '../../api/upload'
import { useMessage } from '../Message'

export interface ImageItem {
  uri: string
  status: 'uploading' | 'done' | 'error'
  url?: string
}

interface ChatInputProps {
  onSend: (text: string, images: string[]) => void
  disabled?: boolean
  privateKbEnabled?: boolean
  onTogglePrivateKb?: () => void
  inputNativeID?: string
}

function ChatInput({
  onSend,
  disabled,
  privateKbEnabled = false,
  onTogglePrivateKb,
  inputNativeID
}: ChatInputProps) {
  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()
  const [value, setValue] = useState('')
  const [images, setImages] = useState<ImageItem[]>([])
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 处理图片添加和自动上传
  const handleAddImages = useCallback((uris: string[]) => {
    const newImages: ImageItem[] = uris.map(uri => ({
      uri,
      status: 'uploading'
    }))
    setImages(prev => [...prev, ...newImages])

    // 对每个新图片进行上传
    newImages.forEach(async img => {
      try {
        const response = await uploadFile(img.uri)
        let url = ''
        if (typeof response.data === 'string') {
          url = response.data
        } else if (response.data && typeof response.data.url === 'string') {
          url = response.data.url
        }

        if (url) {
          setImages(prev =>
            prev.map(p =>
              p.uri === img.uri ? { ...p, status: 'done', url } : p
            )
          )
        } else {
          throw new Error('Invalid upload response')
        }
      } catch (error) {
        console.warn('Image upload failed:', error)
        setImages(prev =>
          prev.map(p => (p.uri === img.uri ? { ...p, status: 'error' } : p))
        )
      }
    })
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const paddingBottom = useMemo(() => {
    return Platform.OS === 'android' ? 16 : Math.max(insets.bottom, 16)
  }, [insets.bottom])

  const containerStyle = useMemo(() => {
    return [styles.container, { paddingBottom }]
  }, [paddingBottom])

  const previewImages = useMemo(() => {
    return images.map(img => ({ uri: img.uri }))
  }, [images])

  const hasUploadingImage = useMemo(() => {
    return images.some(img => img.status === 'uploading')
  }, [images])

  const isSendDisabled = useMemo(() => {
    return !!disabled || hasUploadingImage || value.trim().length === 0
  }, [disabled, hasUploadingImage, value])

  const isPickDisabled = useMemo(() => {
    return !!disabled || images.length >= 9
  }, [disabled, images.length])

  const openPreviewAtIndex = useCallback((index: number) => {
    setCurrentImageIndex(index)
    setIsPreviewVisible(true)
  }, [])

  const closePreview = useCallback(() => {
    setIsPreviewVisible(false)
  }, [])

  const pickImage = useCallback(async () => {
    if (isPickDisabled) return
    const remainCount = 9 - images.length
    if (remainCount <= 0) {
      showMessage('最多可添加9张图片')
      return
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      showMessage('需要访问相册权限以选择图片')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remainCount
    })

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri)
      handleAddImages(newUris)
    }
  }, [handleAddImages, images.length, isPickDisabled, showMessage])

  const handleSend = useCallback(() => {
    const text = value.trim()
    if (text.length === 0 || isSendDisabled) return

    const imagesToSend = images
      .filter(img => img.status === 'done' && img.url)
      .map(img => img.url!)

    onSend(text, imagesToSend)
    setValue('')
    setImages([])
  }, [onSend, value, images, isSendDisabled])

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
              <View key={img.uri} style={styles.imagePreview}>
                <TouchableOpacity
                  onPress={() => {
                    openPreviewAtIndex(index)
                  }}
                >
                  <Image
                    source={{ uri: img.url || img.uri }}
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
                      <ExclamationCircle
                        size={20}
                        color="#ff4444"
                        variant="filled"
                      />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveImage(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Xmark size={20} color="rgba(0,0,0,0.6)" variant="regular" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <TextInput
          nativeID={inputNativeID}
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="问问小稚"
          placeholderTextColor="#B0B0B0"
          multiline
          maxLength={1000}
          editable={!disabled}
        />

        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={[styles.pill, privateKbEnabled && styles.pillActive]}
            onPress={onTogglePrivateKb}
            activeOpacity={0.85}
            disabled={!onTogglePrivateKb}
          >
            <CheckCircle
              size={18}
              color={privateKbEnabled ? '#1890ff' : '#111'}
              variant={privateKbEnabled ? 'filled' : 'regular'}
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
              style={[
                styles.iconButton,
                isPickDisabled && styles.iconButtonDisabled
              ]}
              onPress={pickImage}
              activeOpacity={0.85}
              disabled={isPickDisabled}
            >
              <Plus
                size={28}
                color={isPickDisabled ? '#CFD8DC' : '#111'}
                variant="regular"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendButton,
                isSendDisabled && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={isSendDisabled}
              activeOpacity={0.85}
            >
              <ArrowUpSmall
                size={20}
                color={isSendDisabled ? '#CFD8DC' : '#fff'}
                variant="regular"
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

export default memo(ChatInput)

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
  iconButtonDisabled: {
    opacity: 0.7
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
