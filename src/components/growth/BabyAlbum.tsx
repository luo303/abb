import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

// 定义接受的数据格式
interface BabyAlbumProps {
  images?: any[] // 图片数组，可选
}

export default function BabyAlbum({ images = [] }) {
  // 展示图片
  const displayImages =
    images.length > 0
      ? images
      : [
          require('../../assets/testAvatar.png'), // 模拟图片
          require('../../assets/testAvatar.png'),
          require('../../assets/testAvatar.png')
        ]
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>宝宝相册</Text>
      </View>

      {/* 图片展示区域 */}
      <View style={styles.imageContainer}>
        {displayImages.map((img, index) => (
          <TouchableOpacity key={index} activeOpacity={0.8}>
            <Image style={styles.image} source={img} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 15
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  }
})
