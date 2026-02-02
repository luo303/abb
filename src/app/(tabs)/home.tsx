import React, { useState, useRef } from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { HomeScrollToContext } from '@/context/HomeScrollContext'
import HomeBanner from '@/components/home/Banner/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchManager from '@/components/home/search/HomeSearchManager'
import { MOCK_POSTS } from '@/data/mock/homePosts'

/**
 * 首页组件
 * 包含搜索管理、轮播图、功能导航和社区模块列表
 */
export default function Home() {
  const insets = useSafeAreaInsets()
  const scrollY = useSharedValue(0)
  const scrollViewRef = useRef<Animated.ScrollView>(null)
  const [communityY, setCommunityY] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  // 定义滚动动作
  const handleScrollToCommunity = () => {
    // 简单的滚动，Reanimated ScrollView 也支持 scrollTo
    scrollViewRef.current?.scrollTo({ y: communityY, animated: true })
  }

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y
  })

  // 顶部背景动画样式
  const headerBackgroundStyle = useAnimatedStyle(() => {
    // 当滚动到社区部分时，背景变为白色
    // 阈值设定为社区部分接近顶部时
    const triggerPoint = communityY > 0 ? communityY - insets.top - 50 : 300

    const opacity = interpolate(
      scrollY.value,
      [triggerPoint - 100, triggerPoint],
      [0, 1],
      Extrapolation.CLAMP
    )

    return {
      opacity
    }
  })

  return (
    <HomeScrollToContext.Provider
      value={{ scrollToCommunity: handleScrollToCommunity }}
    >
      <View style={styles.mainContainer}>
        {/* 顶部背景装饰 */}
        <View style={styles.headerBackgroundContainer}>
          <LinearGradient
            colors={['#fff1f2', '#fff']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.headerGradient, { height: 280 + insets.top }]}
          />
          <View style={styles.headerCurve} />
          {/* 白色遮罩层，用于滚动时渐变到白色 */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: '#fff' },
              headerBackgroundStyle
            ]}
          />
        </View>

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Animated.ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={true}
            ref={scrollViewRef}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          >
            {/* 1. 搜索管理组件 (包含搜索栏和搜索结果) */}
            <HomeSearchManager
              posts={MOCK_POSTS}
              onSearchStateChange={setIsSearching}
            />

            {/* 只有在没有搜索内容时，才显示轮播图和导航网格以及默认帖子列表 */}
            {!isSearching && (
              <>
                {/* 2. 顶部轮播图组件 */}
                <HomeBanner />

                {/* 3. 中间功能导航组件 */}
                <HomeNavGrid />

                {/* 4. 底部默认社区模块组件列表 */}
                <View onLayout={e => setCommunityY(e.nativeEvent.layout.y)}>
                  {MOCK_POSTS.map(post => (
                    <HomeCommunityCard key={post.id} data={post} />
                  ))}
                </View>
              </>
            )}
          </Animated.ScrollView>
        </SafeAreaView>
      </View>
    </HomeScrollToContext.Provider>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  headerGradient: {
    width: '100%'
  },
  headerCurve: {
    height: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -40
  },
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8
  },
  sectionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1f99b0',
    marginTop: 2
  }
})
