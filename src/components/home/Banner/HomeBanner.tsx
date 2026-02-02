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

// 构造循环数据：在首尾添加副本，实现双向无限循环
// [3(副本), 1, 2, 3, 1(副本)]
// 实际显示的第一个元素是索引 1 (id: '1')
const DATA = [
  { ...RAW_DATA[RAW_DATA.length - 1], id: 'duplicate-last' },
  ...RAW_DATA,
  { ...RAW_DATA[0], id: 'duplicate-first' }
]

export default function HomeBanner() {
  const scrollX = useSharedValue(0)
  const animatedRef = useAnimatedRef<Animated.ScrollView>()
  const currentIndexRef = useRef(1) // 使用 Ref 存储当前索引，避免闭包陷阱
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isReady, setIsReady] = useState(false)

  // 处理滚动结束，实现无限循环逻辑
  const handleScrollEnd = (offset: number) => {
    const pageIndex = Math.round(offset / CARD_WIDTH)
    currentIndexRef.current = pageIndex

    // 如果滚动到了最后一个副本 (索引 DATA.length - 1)，瞬间跳回第一个真实元素 (索引 1)
    if (pageIndex === DATA.length - 1) {
      scrollTo(animatedRef, CARD_WIDTH * 1, 0, false)
      currentIndexRef.current = 1
    }
    // 如果滚动到了第一个副本 (索引 0)，瞬间跳回最后一个真实元素 (索引 DATA.length - 2)
    else if (pageIndex === 0) {
      scrollTo(animatedRef, CARD_WIDTH * (DATA.length - 2), 0, false)
      currentIndexRef.current = DATA.length - 2
    }
  }

  // 自动轮播逻辑
  useEffect(() => {
    if (!isReady || !isAutoScrolling) return

    const timer = setInterval(() => {
      const nextIndex = currentIndexRef.current + 1

      // 边界保护：如果索引异常超出，重置
      if (nextIndex >= DATA.length) {
        scrollTo(animatedRef, CARD_WIDTH * 1, 0, false)
        currentIndexRef.current = 1
        return
      }

      // 执行平滑滚动动画
      scrollTo(animatedRef, nextIndex * CARD_WIDTH, 0, true)
      currentIndexRef.current = nextIndex

      // 如果目标是最后一个副本（实现向右无限循环的关键）
      // 等待动画结束后，悄悄重置回索引 1
      if (nextIndex === DATA.length - 1) {
        setTimeout(() => {
          // 再次检查确认当前确实在最后一张（防止用户中途干预）
          if (currentIndexRef.current === DATA.length - 1) {
            scrollTo(animatedRef, CARD_WIDTH * 1, 0, false)
            currentIndexRef.current = 1
          }
        }, 500) // 动画持续时间通常在 300-500ms
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [isReady, isAutoScrolling])

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x
    },
    // 处理惯性滚动结束（用户手动滑动）
    onMomentumEnd: event => {
      runOnJS(handleScrollEnd)(event.contentOffset.x)
    },
    // 处理拖拽结束，恢复自动轮播
    onEndDrag: event => {
      runOnJS(setIsAutoScrolling)(true)
    },
    // 开始拖拽时暂停自动轮播
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
          // 布局完成后，初始化滚动位置到索引 1（第一张真实图片）
          if (!isReady) {
            setTimeout(() => {
              scrollTo(animatedRef, CARD_WIDTH * 1, 0, false)
              setIsReady(true)
              // 初始化 scrollX，避免初始动画跳变
              scrollX.value = CARD_WIDTH * 1
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

// 独立的动画容器组件，实现 3D 悬浮效果
const BannerItemContainer = ({ index, item, scrollX }: any) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH
    ]

    // 缩放效果：中间大，两边小
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      Extrapolation.CLAMP
    )

    // 透明度效果：中间不透明，两边半透明
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    )

    // 位移效果：左右卡片向中间靠拢，产生覆盖感
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [40, 0, -40], // 这里的数值控制重叠程度
      Extrapolation.CLAMP
    )

    // 层级效果：中间层级最高，覆盖两边
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
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  }
})
