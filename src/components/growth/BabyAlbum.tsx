import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Card from '../common/Card'
import { NavigationProps } from '../../types/navigation'

// 定义接受的数据格式
interface BabyAlbumProps {
  images?: any[] // 图片数组，可选
}

export default function BabyAlbum({ images = [] }: BabyAlbumProps) {
  const navigation = useNavigation<NavigationProps>()

  // 展示图片
  const displayImages =
    images.length > 0
      ? images
      : [
          require('../../assets/testAvatar.png'), // 模拟图片
          require('../../assets/testAvatar.png'),
          require('../../assets/testAvatar.png'),
          require('../../assets/testAvatar.png'), // 增加图片数量以测试滚动
          require('../../assets/testAvatar.png')
        ]
  return (
    <Card onPress={() => navigation.navigate('Album')}>
      <View style={styles.header}>
        <Text style={styles.title}>宝宝相册</Text>
      </View>

      {/* 图片展示区域 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false} // 隐藏默认滚动条，使用自定义样式或保持简洁
        contentContainerStyle={styles.imageContainer}
        style={styles.scrollView}
      >
        {displayImages.map((img, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Album')}
          >
            <Image style={styles.image} source={img} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  scrollView: {
    marginHorizontal: -15 // 抵消 Card 的 padding，让滚动区域占满宽度
  },
  imageContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15, // 在滚动内容内部补回 padding
    gap: 10
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  }
})
