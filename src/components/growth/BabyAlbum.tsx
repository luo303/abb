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
import Card from '../common/Card'
import { NavigationProps } from '../../types/navigation'

// 计算布局尺寸
const { width } = Dimensions.get('window')
const PAGE_PADDING = 20 // 页面左右间距
const CARD_PADDING = 16 // 卡片内部padding
const GAP = 12 // 图片间距
// 滚动容器的实际宽度 (屏幕宽 - 页面间距)
const CONTAINER_WIDTH = width - PAGE_PADDING * 2
// 实际可视内容宽度 (容器宽 - 卡片内边距)
const CONTENT_WIDTH = CONTAINER_WIDTH - CARD_PADDING * 2
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
        <TouchableOpacity onPress={() => navigation.navigate('Album')}>
          <Text style={styles.moreText}>全部 &gt;</Text>
        </TouchableOpacity>
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
    // 计算当前项的输入范围
    // 考虑到 paddingHorizontal: 16，第一个项的偏移是 0 (相对于内容区域)
    // 但是 scrollX 是从 0 开始的
    const itemOffset = index * (ITEM_SIZE + GAP)

    // 视口中心点 (相对于 contentOffset)
    // 我们希望当 item 在视口中间时放大
    // 视口宽度约为 CONTENT_WIDTH (因为我们 padding 掉了两边)
    // 但实际上 ScrollView 是全宽的 (marginHorizontal: -16)
    // 所以视口宽度是 CONTAINER_WIDTH

    // 简单起见，我们以 item 自身位置为基准
    // 当 scrollX 接近 itemOffset 时，该 item 处于左侧
    // 我们希望显示 3 个，中间那个最大
    // 中间那个的位置大约是 scrollX + ITEM_SIZE + GAP

    const inputRange = [
      (index - 1) * (ITEM_SIZE + GAP),
      index * (ITEM_SIZE + GAP),
      (index + 1) * (ITEM_SIZE + GAP)
    ]

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1.05, 0.9], // 左右缩小，中间放大
      Extrapolation.CLAMP
    )

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
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
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24
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
    gap: 10
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  moreText: {
    fontSize: 13,
    color: '#999'
  },
  scrollView: {
    marginHorizontal: -16 // 抵消 Card 的 padding
  },
  imageContainer: {
    paddingHorizontal: 16, // 恢复内容内边距
    gap: GAP,
    paddingBottom: 10
  },
  itemWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  touchableArea: {
    width: '100%',
    height: '100%'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  }
})
