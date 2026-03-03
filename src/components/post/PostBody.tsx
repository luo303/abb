import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import ImageViewing from 'react-native-image-viewing'

interface PostBodyProps {
  title?: string
  content: string
  tags?: string[]
  images?: any[]
  publishTime?: string
  location?: string
}

const { width } = Dimensions.get('window')
const contentPadding = 16
const imageGap = 8
const imageWidth = width - contentPadding * 2
// 计算网格中每个图片的大小（3列）
const gridImageSize = (imageWidth - imageGap * 2) / 3

export default function PostBody({
  title,
  content,
  tags = [],
  images = [],
  publishTime,
  location
}: PostBodyProps) {
  const [visible, setIsVisible] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 处理content，确保获取到正确的text和images
  const getContentText = () => {
    // 尝试解析字符串形式的 JSON
    try {
      if (typeof content === 'string') {
        const parsed = JSON.parse(content)
        if (parsed && typeof parsed === 'object' && 'text' in parsed) {
          return parsed.text || ''
        }
      }
    } catch (error) {
      // 解析失败，返回原始字符串
    }
    return content || ''
  }

  const getContentImages = () => {
    // 尝试解析字符串形式的 JSON
    try {
      if (typeof content === 'string') {
        const parsed = JSON.parse(content)
        if (
          parsed &&
          typeof parsed === 'object' &&
          'images' in parsed &&
          Array.isArray(parsed.images) &&
          parsed.images.length > 0
        ) {
          return parsed.images
        }
      }
    } catch (error) {
      // 解析失败，返回传入的 images
    }
    return images
  }

  const displayContent = getContentText()
  const displayImages: (string | any)[] = getContentImages()

  // 格式化图片数据供 ImageViewing 使用
  const formattedImages = displayImages.map(img =>
    typeof img === 'string' ? { uri: img } : img
  )

  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index)
    setIsVisible(true)
  }

  // 图片加载失败处理
  const handleImageError = (error: any) => {
    // 静默处理图片加载错误
  }

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <Text style={styles.content}>{displayContent}</Text>

      {tags && tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={`tag-${index}`} style={styles.tagWrapper}>
              <Text style={styles.tag}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {displayImages.length > 0 && (
        <View style={styles.imageContainer}>
          {displayImages.length === 1 ? (
            // 单张图片大图显示
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleImagePress(0)}
              style={styles.singleImageWrapper}
            >
              <Image
                source={
                  typeof displayImages[0] === 'string'
                    ? { uri: displayImages[0] }
                    : displayImages[0]
                }
                style={styles.singleImage}
                resizeMode="cover"
                onError={handleImageError}
              />
            </TouchableOpacity>
          ) : (
            // 多张图片网格显示
            <View style={styles.imageGrid}>
              {displayImages.map((img, index) => (
                <TouchableOpacity
                  key={`img-${index}`}
                  activeOpacity={0.9}
                  onPress={() => handleImagePress(index)}
                  style={[
                    styles.gridImageWrapper,
                    {
                      marginRight: (index + 1) % 3 === 0 ? 0 : imageGap,
                      marginBottom: imageGap
                    }
                  ]}
                >
                  <Image
                    source={typeof img === 'string' ? { uri: img } : img}
                    style={styles.gridImage}
                    resizeMode="cover"
                    onError={handleImageError}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 图片预览组件 */}
      <ImageViewing
        images={formattedImages}
        imageIndex={currentImageIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        keyExtractor={(_, index) => `preview-img-${index}`}
      />

      <View style={styles.metaInfo}>
        <Text style={styles.metaText}>
          {publishTime} {location}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    width: '100%'
  },
  tagWrapper: {
    marginRight: 8,
    marginBottom: 8
  },
  tag: {
    fontSize: 14,
    color: '#f43f5e',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden'
  },
  imageContainer: {
    marginBottom: 12,
    width: '100%'
  },
  singleImageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    marginBottom: imageGap
  },
  singleImage: {
    width: imageWidth,
    height: imageWidth,
    borderRadius: 8
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%'
  },
  gridImageWrapper: {
    width: gridImageSize,
    height: gridImageSize,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  metaInfo: {
    marginTop: 4
  },
  metaText: {
    fontSize: 12,
    color: '#999'
  }
})
