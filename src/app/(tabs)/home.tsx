import React, { useState, useRef } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
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
            colors={['#fff1f2', '#ffe4e6']}
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
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingBottom: 100 }}
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
                <View style={styles.bannerSection}>
                  <HomeBanner />
                </View>

                {/* 3. 中间功能导航组件 */}
                <HomeNavGrid />

                {/* 4. 底部默认社区模块组件列表 */}
                <View
                  style={styles.communitySection}
                  onLayout={e => setCommunityY(e.nativeEvent.layout.y)}
                >
                  {/* 社区标题头 */}
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                      <LinearGradient
                        colors={['#ff9a9e', '#f43f5e']}
                        style={styles.iconBox}
                      >
                        <Ionicons name="people" size={16} color="#fff" />
                      </LinearGradient>
                      <Text style={styles.sectionTitle}>宝妈社区</Text>
                    </View>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.badgeText}>最新动态</Text>
                    </View>
                  </View>

                  {MOCK_POSTS.map(post => (
                    <View key={post.id} style={{ marginBottom: 12 }}>
                      <HomeCommunityCard data={post} />
                    </View>
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
  bannerSection: {
    marginBottom: 10
  },
  communitySection: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  sectionBadge: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecdd3'
  },
  badgeText: {
    fontSize: 11,
    color: '#e11d48',
    fontWeight: '600'
  }
})
