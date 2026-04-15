import React, { memo, useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import ImageViewing from 'react-native-image-viewing'

import { uploadFile } from '@/api/upload'
import { useMessage } from '@/components/Message'

type ImageItem = {
  uri: string
  status: 'uploading' | 'done' | 'error'
  url?: string
}

type Props = {
  disabled?: boolean
  placeholder?: string
  onSend: (payload: { text: string; images: string[] }) => Promise<void> | void
}

function ChatComposer({
  disabled = false,
  placeholder = '发消息...',
  onSend
}: Props) {
  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()
  const [value, setValue] = useState('')
  const [images, setImages] = useState<ImageItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  const paddingBottom = useMemo(() => {
    return Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 12
  }, [insets.bottom])

  const hasUploadingImage = useMemo(() => {
    return images.some(item => item.status === 'uploading')
  }, [images])

  const readyImages = useMemo(() => {
    return images
      .filter(item => item.status === 'done' && item.url)
      .map(item => item.url!)
  }, [images])

  const canSend = useMemo(() => {
    return (
      !disabled &&
      !submitting &&
      !hasUploadingImage &&
      (value.trim().length > 0 || readyImages.length > 0)
    )
  }, [disabled, hasUploadingImage, readyImages.length, submitting, value])

  const previewImages = useMemo(() => {
    return images.map(item => ({ uri: item.url || item.uri }))
  }, [images])

  const handleRemoveImage = useCallback((uri: string) => {
    setImages(prev => prev.filter(item => item.uri !== uri))
  }, [])

  const handleAddImages = useCallback((uris: string[]) => {
    const nextItems: ImageItem[] = uris.map(uri => ({
      uri,
      status: 'uploading'
    }))

    setImages(prev => [...prev, ...nextItems])

    nextItems.forEach(async item => {
      try {
        const response = await uploadFile(item.uri)
        const url =
          typeof response.data === 'string'
            ? response.data
            : response.data && typeof response.data.url === 'string'
              ? response.data.url
              : ''

        if (!url) {
          throw new Error('Upload response missing url')
        }

        setImages(prev =>
          prev.map(current =>
            current.uri === item.uri
              ? {
                  ...current,
                  status: 'done',
                  url
                }
              : current
          )
        )
      } catch (error) {
        console.error('Chat image upload failed:', error)
        setImages(prev =>
          prev.map(current =>
            current.uri === item.uri
              ? {
                  ...current,
                  status: 'error'
                }
              : current
          )
        )
      }
    })
  }, [])

  const pickImages = useCallback(async () => {
    if (disabled || images.length >= 9) return

    const remainCount = 9 - images.length
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permission.status !== 'granted') {
      showMessage('需要相册权限才能选择图片')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      selectionLimit: remainCount,
      quality: 0.82
    })

    if (!result.canceled) {
      handleAddImages(result.assets.map(asset => asset.uri))
    }
  }, [disabled, handleAddImages, images.length, showMessage])

  const handleSubmit = useCallback(async () => {
    if (!canSend) return

    try {
      setSubmitting(true)
      await onSend({
        text: value.trim(),
        images: readyImages
      })
      setValue('')
      setImages([])
    } finally {
      setSubmitting(false)
    }
  }, [canSend, onSend, readyImages, value])

  return (
    <View style={[styles.container, { paddingBottom }]}>
      <View style={styles.card}>
        {images.length > 0 ? (
          <ScrollView
            horizontal
            style={styles.imageRow}
            contentContainerStyle={styles.imageRowContent}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((item, index) => (
              <View key={item.uri} style={styles.imageWrap}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setPreviewIndex(index)
                    setPreviewVisible(true)
                  }}
                >
                  <Image
                    source={{ uri: item.url || item.uri }}
                    style={[
                      styles.previewImage,
                      item.status === 'uploading' &&
                        styles.previewImageUploading
                    ]}
                  />
                  {item.status === 'uploading' ? (
                    <View style={styles.overlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  ) : null}
                  {item.status === 'error' ? (
                    <View style={styles.overlay}>
                      <Ionicons name="alert-circle" size={20} color="#fff" />
                    </View>
                  ) : null}
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => handleRemoveImage(item.uri)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.inputRow}>
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={disabled}
            onPress={pickImages}
            style={styles.actionButton}
          >
            <Ionicons name="add-circle-outline" size={22} color="#2F8F5B" />
          </TouchableOpacity>

          <TextInput
            multiline
            editable={!disabled}
            maxLength={1000}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#98A2B3"
            style={styles.input}
            value={value}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={!canSend}
            onPress={handleSubmit}
            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          >
            <Text style={styles.sendButtonText}>
              {submitting ? '发送中' : '发送'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ImageViewing
        images={previewImages}
        imageIndex={previewIndex}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      />
    </View>
  )
}

export default memo(ChatComposer)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: '#F8FBF8'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: '#E3EFE7',
    shadowColor: '#123524',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8
  },
  imageRow: {
    maxHeight: 102
  },
  imageRowContent: {
    paddingBottom: 10,
    paddingHorizontal: 4
  },
  imageWrap: {
    width: 82,
    height: 82,
    marginRight: 10
  },
  previewImage: {
    width: 82,
    height: 82,
    borderRadius: 20,
    backgroundColor: '#F2F4F7'
  },
  previewImageUploading: {
    opacity: 0.8
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: 'rgba(24,34,48,0.35)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeButton: {
    position: 'absolute',
    top: -7,
    right: -7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF8EF',
    marginBottom: 2
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#182230',
    textAlignVertical: 'top',
    backgroundColor: '#F6FAF7',
    borderRadius: 22,
    marginHorizontal: 10
  },
  sendButton: {
    minWidth: 72,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#32C76F',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 2
  },
  sendButtonDisabled: {
    backgroundColor: '#E4E7EC'
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2
  }
})
