import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { useState } from 'react'
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
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled,
  images = [],
  onAddImages,
  onRemoveImage
}: ChatInputProps) {
  const insets = useSafeAreaInsets()
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const pickImage = async () => {
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
  }

  const handleSend = () => {
    onSend()
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom:
            Platform.OS === 'android' ? 16 : Math.max(insets.bottom, 16)
        }
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.inputWrapper}>
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
                    setCurrentImageIndex(index)
                    setIsPreviewVisible(true)
                  }}
                >
                  <Image
                    source={{ uri: img.uri }}
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

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.plusButton} onPress={pickImage}>
            <Ionicons name="add" size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChangeText}
              placeholder="问问AI..."
              placeholderTextColor="#B0BEC5"
              multiline
              maxLength={1000}
            />
            {(value.trim().length > 0 || images.length > 0) && (
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (disabled ||
                    images.some(
                      img =>
                        img.status === 'uploading' || img.status === 'error'
                    )) &&
                    styles.sendButtonDisabled
                ]}
                onPress={handleSend}
                disabled={
                  disabled ||
                  images.some(
                    img => img.status === 'uploading' || img.status === 'error'
                  )
                }
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-up"
                  size={20}
                  color={
                    disabled ||
                    images.some(
                      img =>
                        img.status === 'uploading' || img.status === 'error'
                    )
                      ? '#CFD8DC'
                      : '#fff'
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <ImageViewing
        images={images.map(img => ({ uri: img.uri }))}
        imageIndex={currentImageIndex}
        visible={isPreviewVisible}
        onRequestClose={() => setIsPreviewVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        keyExtractor={(_, index) => `chat-input-preview-${index}`}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent'
  },
  inputWrapper: {
    width: '100%'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#37474F',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 8,
    maxHeight: 120
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 4
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0'
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
