import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { HomeScrollToContext } from '@/context/HomeScrollContext'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import HomeBanner from '@/components/home/Banner/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchManager from '@/components/home/search/HomeSearchManager'
import { getHomePosts } from '@/api/home'

/**
 * 首页组件
 * 包含搜索管理、轮播图、功能导航和社区模块列表
 */
export default function Home() {
  const navigation = useNavigation<NavigationProps>()
  const isFocused = useIsFocused()
  const insets = useSafeAreaInsets()
  const scrollY = useSharedValue(0)
  const scrollViewRef = useRef<Animated.ScrollView>(null)
  const [communityY, setCommunityY] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [posts, setPosts] = useState<any[]>([])

  // 徽章动画
  const badgeScale = useSharedValue(1)

  // 社区模块闪烁动画
  const communityOpacity = useSharedValue(1)

  // 获取帖子列表
  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const response: any = await getHomePosts()
      if (
        response &&
        response.code === 200 &&
        response.data &&
        Array.isArray(response.data.list)
      ) {
        setPosts(response.data.list)
      } else {
        console.warn('Invalid response structure:', response)
        setPosts([])
      }
    } catch (error) {
      console.error('Fetch posts failed:', error)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化和焦点变化时刷新数据
  useEffect(() => {
    if (isFocused) {
      fetchPosts()
    }
  }, [isFocused])

  // 徽章动画效果
  useEffect(() => {
    badgeScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500, easing: Easing.ease }),
        withTiming(1, { duration: 500, easing: Easing.ease }),
        withDelay(1000, withTiming(1, { duration: 0 }))
      ),
      -1,
      true
    )
  }, [])

  const animatedBadgeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: badgeScale.value }]
    }
  })

  const animatedCommunityStyle = useAnimatedStyle(() => {
    return {
      opacity: communityOpacity.value
    }
  })

  // 滚动到社区模块
  const handleScrollToCommunity = () => {
    scrollViewRef.current?.scrollTo({ y: communityY, animated: true })

    communityOpacity.value = withDelay(
      500,
      withSequence(
        withTiming(0.2, { duration: 200 }),
        withTiming(1, { duration: 200 }),
        withTiming(0.2, { duration: 200 }),
        withTiming(1, { duration: 200 })
      )
    )
  }

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y
  })

  // 顶部背景动画样式
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const triggerPoint = communityY > 0 ? communityY - insets.top - 50 : 300
    const opacity = interpolate(
      scrollY.value,
      [triggerPoint - 100, triggerPoint],
      [0, 1],
      Extrapolation.CLAMP
    )
    return { opacity }
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
            <HomeSearchManager
              posts={posts}
              onSearchStateChange={setIsSearching}
            />

            {!isSearching && (
              <>
                <View style={styles.bannerSection}>
                  <HomeBanner />
                </View>

                <HomeNavGrid />

                <View
                  style={styles.communitySection}
                  onLayout={e => setCommunityY(e.nativeEvent.layout.y)}
                >
                  <Animated.View
                    style={[styles.sectionHeader, animatedCommunityStyle]}
                  >
                    <View style={styles.sectionTitleWrapper}>
                      <LinearGradient
                        colors={['#ff9a9e', '#f43f5e']}
                        style={styles.iconBox}
                      >
                        <Ionicons name="people" size={16} color="#fff" />
                      </LinearGradient>
                      <Text style={styles.sectionTitle}>宝妈社区</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('AddPost')}
                    >
                      <Animated.View
                        style={[styles.sectionBadge, animatedBadgeStyle]}
                      >
                        <Text style={styles.badgeText}>记录美好瞬间</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  </Animated.View>

                  {isLoading ? (
                    <View style={{ padding: 20 }}>
                      <ActivityIndicator size="small" color="#f43f5e" />
                    </View>
                  ) : null}

                  {posts.map((post: any, index: number) => (
                    <View key={post.id || index} style={{ marginBottom: 12 }}>
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
    backgroundColor: '#ff1744',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#ff1744',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.5
  }
})
