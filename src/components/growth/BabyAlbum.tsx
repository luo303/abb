import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { NavigationProps } from '../../types/navigation'
import { Card } from '../common/Card'

// 计算布局尺寸
const { width } = Dimensions.get('window')
const PAGE_PADDING = 20 // 页面左右间距
const GAP = 12 // 图片间距
// 滚动容器的实际宽度 (屏幕宽 - 页面间距)
const CONTAINER_WIDTH = width - PAGE_PADDING * 2
// 实际可视内容宽度
const CONTENT_WIDTH = CONTAINER_WIDTH
// 计算每个项目的宽度，使得正好放下3个
const ITEM_SIZE = (CONTENT_WIDTH - 2 * GAP) / 3

interface BabyAlbumProps {
  images?: any[] // 图片数组，可选
}

export default function BabyAlbum({ images = [] }: BabyAlbumProps) {
  const navigation = useNavigation<NavigationProps>()
  const scrollX = useSharedValue(0)

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

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollX.value = event.contentOffset.x
  })

  return (
    <Card onPress={() => navigation.navigate('Album')} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="images-outline" size={20} color="#1f99b0" />
          </View>
          <Text style={styles.title}>宝宝相册</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>

      {/* 图片展示区域 - 使用 Reanimated 实现果冻效果 */}
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imageContainer}
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        snapToInterval={ITEM_SIZE + GAP} // 增加吸附效果
        decelerationRate="fast"
      >
        {displayImages.map((img, index) => {
          return (
            <AlbumItem
              key={index}
              index={index}
              img={img}
              scrollX={scrollX}
              navigation={navigation}
            />
          )
        })}
      </Animated.ScrollView>
    </Card>
  )
}

// 独立的动画组件
const AlbumItem = ({ index, img, scrollX, navigation }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (ITEM_SIZE + GAP),
      index * (ITEM_SIZE + GAP),
      (index + 1) * (ITEM_SIZE + GAP)
    ]

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1, 0.9], // 左右缩小，中间放大
      Extrapolation.CLAMP
    )

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    )

    return {
      transform: [{ scale }],
      opacity
    }
  })

  return (
    <Animated.View style={[styles.itemWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Album')}
        style={styles.touchableArea}
      >
        <Image style={styles.image} source={img} />
        <View style={styles.imageOverlay} />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
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
    backgroundColor: '#e0f2fe'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  scrollView: {
    marginHorizontal: -20, // 抵消页面的 padding
    paddingLeft: 20 // 恢复左侧 padding
  },
  imageContainer: {
    paddingRight: 40, // 右侧多留点空间
    gap: GAP,
    paddingBottom: 10
  },
  itemWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE * 1.2, // 长方形更像照片
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#fff'
  },
  touchableArea: {
    flex: 1
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
