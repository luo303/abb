import React, { useRef, useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useAnimatedRef,
  scrollTo,
  runOnJS
} from 'react-native-reanimated'
import BannerItem from './BannerItem'

const { width } = Dimensions.get('window')
// 假设 HomeNavGrid 的 marginHorizontal 是 16
const NAV_MARGIN_H = 16
// 计算目标宽度：屏幕宽度 - 两边的 margin
const TARGET_WIDTH = width - NAV_MARGIN_H * 2

const CARD_WIDTH = TARGET_WIDTH // 卡片宽度与 HomeNavGrid 一致
const SPACING = (width - CARD_WIDTH) / 2 // 左右间距，使卡片居中

// 模拟数据 - 原始数据
const RAW_DATA = [
  {
    id: '1',
    imageSource: require('../../../assets/poster_ai 2.0.jpg'),
    targetPage: 'AIAssistant'
  },
  {
    id: '2',
    imageSource: require('../../../assets/poster_cjk.png'),
    targetPage: 'Taboo'
  },
  {
    id: '3',
    imageSource: require('../../../assets/poster_community.png'),
    targetPage: 'scrollToCommunity'
  }
]

// 构造循环数据：在首尾添加副本
// [3, 1, 2, 3, 1]
// 实际显示的第一个元素是索引 1 (id: '1')
const DATA = [
  { ...RAW_DATA[RAW_DATA.length - 1], id: 'duplicate-last' },
  ...RAW_DATA,
  { ...RAW_DATA[0], id: 'duplicate-first' }
]

export default function HomeBanner() {
  const scrollX = useSharedValue(0)
  const animatedRef = useAnimatedRef<Animated.ScrollView>()
  const [currentIndex, setCurrentIndex] = useState(1)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)

  // 初始滚动到第一个真实元素
  // 注意：由于 contentContainerStyle 的 paddingHorizontal 存在，
  // 第 0 个元素 (duplicate-last) 的偏移是 0 (相对于 content 内部)，
  // 但 ScrollView 会因为 padding 而显示第一个元素居中? 不，ScrollView 的 0 位置是第一个元素的左边。
  // 为了让第 1 个元素居中，我们需要滚动到： 1 * CARD_WIDTH
  // 因为我们的 snapToInterval 是 CARD_WIDTH
  // 并且我们设置了 paddingHorizontal = SPACING
  // 当 scrollOffset = 0 时，ScrollView 显示的是第 0 个元素 (duplicate-last) 居中 (因为有左 padding)
  // 所以我们要显示索引 1 (真实第一个)，需要滚动到 CARD_WIDTH

  // 初始化滚动位置
  const [isReady, setIsReady] = useState(false)

  // 处理滚动结束，实现无限循环
  const handleScrollEnd = (offset: number) => {
    const pageIndex = Math.round(offset / CARD_WIDTH)
    setCurrentIndex(pageIndex)

    // 如果滚动到了最后一个副本 (索引 DATA.length - 1)，瞬间跳回第一个真实元素 (索引 1)
    if (pageIndex === DATA.length - 1) {
      scrollTo(animatedRef, CARD_WIDTH * 1, 0, false)
      setCurrentIndex(1)
    }
    // 如果滚动到了第一个副本 (索引 0)，瞬间跳回最后一个真实元素 (索引 DATA.length - 2)
    else if (pageIndex === 0) {
      scrollTo(animatedRef, CARD_WIDTH * (DATA.length - 2), 0, false)
      setCurrentIndex(DATA.length - 2)
    }
  }

  // 自动轮播逻辑
  useEffect(() => {
    if (!isReady || !isAutoScrolling) return

    const timer = setInterval(() => {
      const nextIndex = currentIndex + 1
      // 使用 scrollTo 进行平滑滚动
      scrollTo(animatedRef, nextIndex * CARD_WIDTH, 0, true)

      // 注意：这里我们不直接 setCurrentIndex，而是依赖 onMomentumScrollEnd 触发 handleScrollEnd 更新状态
      // 但 scrollTo 可能不会触发 onMomentumScrollEnd (在某些 RN 版本/平台)
      // 所以我们手动更新 currentIndex 引用，但在 handleScrollEnd 里做边界检查
      setCurrentIndex(nextIndex)
    }, 3000)

    return () => clearInterval(timer)
  }, [isReady, isAutoScrolling, currentIndex])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x
    },
    onMomentumEnd: event => {
      runOnJS(handleScrollEnd)(event.contentOffset.x)
    },
    // 处理拖拽结束，恢复自动轮播
    onEndDrag: event => {
      // 拖拽结束后，可能需要校准位置
      runOnJS(handleScrollEnd)(event.contentOffset.x)
      runOnJS(setIsAutoScrolling)(true)
    },
    onBeginDrag: () => {
      runOnJS(setIsAutoScrolling)(false)
    }
  })

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={animatedRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: SPACING
        }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onLayout={() => {
          // 布局完成后，初始化滚动位置到索引 1
          if (!isReady) {
            // 使用 setTimeout 确保在下一帧执行，避免布局未完全就绪
            setTimeout(() => {
              scrollTo(animatedRef, CARD_WIDTH * 1, 0, false)
              setIsReady(true)
            }, 100)
          }
        }}
      >
        {DATA.map((item, index) => {
          return (
            <BannerItemContainer
              key={`${item.id}-${index}`}
              index={index}
              item={item}
              scrollX={scrollX}
            />
          )
        })}
      </Animated.ScrollView>
    </View>
  )
}

// 独立的动画容器组件
const BannerItemContainer = ({ index, item, scrollX }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH
    ]

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85], // 调整两边缩放比例，不要太小，避免留白过多
      Extrapolation.CLAMP
    )

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    )

    // 位移效果：左右卡片向中间靠拢
    // 这里的位移需要根据宽度调整
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [40, 0, -40],
      Extrapolation.CLAMP
    )

    const zIndex = interpolate(
      scrollX.value,
      inputRange,
      [0, 10, 0],
      Extrapolation.CLAMP
    )

    return {
      transform: [{ scale }, { translateX }],
      opacity,
      zIndex: Math.round(zIndex)
    }
  })

  return (
    <Animated.View style={[styles.itemContainer, animatedStyle]}>
      <View style={styles.cardWrapper}>
        <BannerItem
          imageSource={item.imageSource}
          targetPage={item.targetPage}
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  itemContainer: {
    width: CARD_WIDTH,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 24, // 增加圆角与 NavGrid 一致
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  }
})
