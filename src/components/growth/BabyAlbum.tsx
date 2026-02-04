import React, { useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { NavigationProps } from '../../types/navigation'
import { LinearGradient } from 'expo-linear-gradient'

// 计算布局尺寸
const { width } = Dimensions.get('window')
// 这里的 PAGE_PADDING 是指除了 Card 自身 padding (16) 之外的额外边距
// 为了让图片变小，我们增加这个值
const EXTRA_PADDING = 10
const GAP = 8 // 图片间距

// Card 的 padding 是 16，左右各 16，共 32
// Card 的 margin 是 16 (假设)，但在 Card 组件内部我们只关心内容区域
// 假设 Card 占据了大部分屏幕宽度 (width - 32)
// Card 内容宽度 = width - 32 (Card margin) - 32 (Card padding) = width - 64
// 我们再减去 EXTRA_PADDING * 2，让 Carousel 更窄一点，图片也就更小
const CONTAINER_WIDTH = width - 64 - EXTRA_PADDING * 2

// 计算每个项目的宽度，使得正好放下3个
const ITEM_SIZE = CONTAINER_WIDTH / 3

interface BabyAlbumProps {
  images?: any[] // 图片数组，可选
}

export default function BabyAlbum({ images = [] }: BabyAlbumProps) {
  const navigation = useNavigation<NavigationProps>()

  // 展示图片
  const displayImages = useMemo(
    () =>
      images.length > 0
        ? images
        : [
            require('../../assets/testAvatar.png'), // 模拟图片
            require('../../assets/testAvatar.png'),
            require('../../assets/testAvatar.png'),
            require('../../assets/testAvatar.png'), // 增加图片数量以测试滚动
            require('../../assets/testAvatar.png')
          ],
    [images]
  )

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <AlbumItem item={item} navigation={navigation} />
    ),
    [navigation]
  )

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Album')}
      >
        <LinearGradient
          colors={['#ffffff', '#fff1f2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleWrapper}>
              <View style={styles.iconBox}>
                <Ionicons name="images-outline" size={20} color="#f43f5e" />
              </View>
              <Text style={styles.title}>宝宝相册</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>

          {/* 图片展示区域 - 使用 Carousel 实现 Normal 效果 */}
          <View style={styles.carouselContainer}>
            <Carousel
              loop={displayImages.length >= 3}
              width={ITEM_SIZE} // 设置为单个 Item 的宽度
              height={ITEM_SIZE - GAP} // 设置高度等于宽度减去间距，确保正方形
              style={{
                width: CONTAINER_WIDTH
                // 移除 justifyContent 和 alignItems，避免干扰布局
              }}
              autoPlay={false}
              data={displayImages}
              scrollAnimationDuration={800}
              renderItem={renderItem}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

// 独立的动画组件
const AlbumItem = ({ item, navigation }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Album')}
      style={styles.itemWrapper}
    >
      <Image style={styles.image} source={item} />
      <View style={styles.imageOverlay} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff'
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff1f2'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  carouselContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -GAP / 2 // 微调左侧间距，使第一张图对齐
  },
  itemWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#fff',
    marginHorizontal: GAP / 2 // 给每个 item 左右各一半间距
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)' // 极淡的遮罩增加质感
  }
})
