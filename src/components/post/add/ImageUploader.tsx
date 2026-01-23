import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ImageUploaderProps {
  images: string[]
  onAddImage: () => void
  onRemoveImage: (index: number) => void
}

export default function ImageUploader({
  images,
  onAddImage,
  onRemoveImage
}: ImageUploaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
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
        {images.length < 9 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddImage}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={32} color="#ccc" />
            <Text style={styles.addText}>添加照片</Text>
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
    borderRadius: 8,
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
  addButton: {
    width: 110, // 与图片尺寸一致
    height: 110,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed'
  },
  addText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  }
})
