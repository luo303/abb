import React from 'react'
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'

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
// 计算网格中每个图片的大小（3列）
const imageSize = (width - contentPadding * 2 - imageGap * 2) / 3

export default function PostBody({
  title,
  content,
  tags = [],
  images = [],
  publishTime,
  location
}: PostBodyProps) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <Text style={styles.content}>{content}</Text>

      {tags && tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
      )}

      {images.length > 0 && (
        <View style={styles.imageGrid}>
          {images.map((img, index) => (
            <Image
              key={index}
              source={typeof img === 'string' ? { uri: img } : img}
              style={[
                styles.image,
                {
                  width: imageSize,
                  height: imageSize,
                  marginBottom: imageGap,
                  marginRight: (index + 1) % 3 === 0 ? 0 : imageGap
                }
              ]}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

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
    gap: 8,
    marginBottom: 12
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  image: {
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  metaInfo: {
    marginTop: 4
  },
  metaText: {
    fontSize: 12,
    color: '#999'
  }
})
