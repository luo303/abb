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
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>宝宝相册</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>128 张</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Album')}>
          <View style={styles.moreBtn}>
            <Text style={styles.moreText}>全部</Text>
            <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
          </View>
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
    </View>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  countBadge: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#db2777'
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  moreText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500'
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
