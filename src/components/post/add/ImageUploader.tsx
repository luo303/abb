import React from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface ImageItem {
  uri: string
  status: 'uploading' | 'done' | 'error'
  url?: string
}

interface ImageUploaderProps {
  images: string[]
  pendingImages: ImageItem[]
  onAddImage: () => void
  onRemoveImage: (index: number) => void
}

export default function ImageUploader({
  images,
  pendingImages,
  onAddImage,
  onRemoveImage
}: ImageUploaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {/* 显示待上传的图片 */}
        {pendingImages
          .filter(img => img.status === 'uploading')
          .map((img, index) => (
            <View key={`pending-${index}`} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#f43f5e" />
              </View>
            </View>
          ))}
        {/* 显示已上传的图片 */}
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onRemoveImage(index)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {/* 显示添加按钮 */}
        {images.length + pendingImages.length < 9 && (
          <TouchableOpacity onPress={onAddImage} activeOpacity={0.7}>
            <LinearGradient
              colors={['#fff1f2', '#ffe4e6']}
              style={styles.addButton}
            >
              <Ionicons name="camera-outline" size={32} color="#f43f5e" />
              <Text style={styles.addText}>添加照片</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center' // 改为居中对齐
  },
  imageWrapper: {
    width: 110,
    height: 110,
    position: 'relative'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#f5f5f5'
  },
  deleteButton: {
    position: 'absolute',
    top: -6, // 稍微突出一点，方便点击
    right: -6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 1
  },
  addButton: {
    width: 110, // 与图片尺寸一致
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderStyle: 'dashed'
  },
  addText: {
    fontSize: 12,
    color: '#f43f5e',
    marginTop: 4
  }
})
