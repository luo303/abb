import { View, StyleSheet, Dimensions } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  SharedValue
} from 'react-native-reanimated'
import BannerItem from './BannerItem'

const { width } = Dimensions.get('window')

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

export default function HomeBanner() {
  const progress = useSharedValue(0)

  return (
    <View style={styles.container}>
      <Carousel
        loop
        width={width}
        height={240}
        autoPlay={true}
        autoPlayInterval={3000}
        data={RAW_DATA}
        scrollAnimationDuration={1000}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50
        }}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.cardWrapper}>
              <BannerItem
                imageSource={item.imageSource}
                targetPage={item.targetPage}
              />
            </View>
          </View>
        )}
      />

      {/* 轮播图指示器 */}
      {RAW_DATA.length > 1 && (
        <View style={styles.pagination}>
          {RAW_DATA.map((_, index) => (
            <PaginationDot
              key={index}
              index={index}
              progress={progress}
              dataLength={RAW_DATA.length}
            />
          ))}
        </View>
      )}
    </View>
  )
}

// 轮播图指示点组件
const PaginationDot = ({
  index,
  progress,
  dataLength
}: {
  index: number
  progress: SharedValue<number>
  dataLength: number
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    // 处理循环进度：将 absoluteProgress 映射到 0 到 dataLength 的范围内
    let val = progress.value % dataLength
    if (val < 0) val += dataLength

    // 计算当前点与进度的距离（考虑循环首尾相接）
    let dist = Math.abs(val - index)
    if (dist > dataLength / 2) {
      dist = dataLength - dist
    }

    const opacity = interpolate(dist, [0, 1], [1, 0.3], Extrapolation.CLAMP)

    const width = interpolate(dist, [0, 1], [20, 8], Extrapolation.CLAMP)

    return {
      opacity,
      width,
      backgroundColor: '#f43f5e' // 首页主题色 (Warm Red)
    }
  })

  return <Animated.View style={[styles.dot, animatedStyle]} />
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20
  },
  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardWrapper: {
    width: '100%',
    height: 200, // 固定高度
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  }
})
