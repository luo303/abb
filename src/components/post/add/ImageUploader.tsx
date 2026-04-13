import React from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')
const GAP = 10
const PARENT_PADDING = 30 // AddMilestone 的 padding 15*2
const INNER_PADDING = 24 // ImageUploader 的 padding 12*2
const AVAILABLE_WIDTH = width - PARENT_PADDING - INNER_PADDING - 2 // 减去 2px 误差
const ITEM_WIDTH = Math.floor((AVAILABLE_WIDTH - GAP * 2) / 3)

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
  const uploadingCount = pendingImages.filter(
    img => img.status === 'uploading'
  ).length
  const totalImages = images.length + uploadingCount
  const hasImages = totalImages > 0

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.grid,
          !hasImages && { justifyContent: 'center' } // 无图片时居中
        ]}
      >
        {/* 显示待上传的图片 */}
        {pendingImages
          .filter(img => img.status === 'uploading')
          .map(img => (
            <View key={img.uri} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#f43f5e" />
              </View>
            </View>
          ))}
        {/* 显示已上传的图片 */}
        {images.map((uri, index) => (
          <View key={uri} style={styles.imageWrapper}>
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
        {totalImages < 9 && (
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
    paddingHorizontal: 12,
    paddingBottom: 20
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // 兼容 gap
    gap: GAP
  },
  // 如果不支持 gap，可以用 marginRight 模拟，这里为了稳妥起见，保留 gap，但确保计算准确
  imageWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    position: 'relative',
    // 兜底方案：如果是每行最后一个元素，需要自行处理 margin，但 flex gap 更好
    // 这里我们相信 flex gap 在现代 RN 中表现良好
    marginBottom: GAP
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#f5f5f5'
  },
  deleteButton: {
    position: 'absolute',
    top: -6,
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
    borderRadius: 16,
    zIndex: 1
  },
  addButton: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderStyle: 'dashed'
  },
  addText: {
    fontSize: 12,
    color: '#f43f5e',
    marginTop: 4
  },
  centerAddContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  centerAddButton: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderStyle: 'dashed'
  },
  centerIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  centerAddText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f43f5e',
    marginBottom: 2
  },
  centerAddSubText: {
    fontSize: 12,
    color: '#fb7185'
  }
})
