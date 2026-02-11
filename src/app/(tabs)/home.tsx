import React, { useState, useRef, useEffect, useCallback } from 'react'
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
  Easing,
  runOnJS
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { HomeScrollToContext } from '@/context/HomeScrollContext'
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import HomeBanner from '@/components/home/Banner/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchManager from '@/components/home/search/HomeSearchManager'
import { getHomePosts } from '@/api/home'
import { PostItem } from '@/types/home'

/**
 * 首页组件
 * 包含搜索管理、轮播图、功能导航和社区模块列表
 */
export default function Home() {
  const navigation = useNavigation<NavigationProps>()
  const route = useRoute<any>()
  const isFocused = useIsFocused()
  const insets = useSafeAreaInsets()
  const scrollY = useSharedValue(0)
  const scrollViewRef = useRef<Animated.ScrollView>(null)
  const [communityY, setCommunityY] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  // 分离服务端数据和本地数据
  const [serverPosts, setServerPosts] = useState<PostItem[]>([])
  const [localPosts, setLocalPosts] = useState<PostItem[]>([])

  // 合并展示的数据
  // 逻辑优化：优先使用 serverPosts 的数据（因为它是经过详情页更新后的最新状态）
  // 只有当 serverPosts 里没有时（还没同步），才使用 localPosts
  const serverIds = new Set(serverPosts.map(p => p.post_id))
  const uniqueLocalPosts = localPosts.filter(p => !serverIds.has(p.post_id))
  const posts = [...uniqueLocalPosts, ...serverPosts]

  // 徽章动画
  const badgeScale = useSharedValue(1)

  // 社区模块闪烁动画
  const communityOpacity = useSharedValue(1)

  // 获取帖子列表（刷新）
  const fetchPosts = async () => {
    setIsLoading(true)
    setPage(1)
    try {
      const response = await getHomePosts(1)
      console.log('Home fetchPosts response:', JSON.stringify(response))

      // 兼容后端可能返回 code 0 的情况，或者 data.items 存在的情况（防止 code 乱码）
      const isSuccess =
        response && (response.code === 200 || response.code === 0)
      const hasData = response?.data && Array.isArray(response.data.items)

      if (isSuccess || hasData) {
        if (hasData) {
          console.log(
            'Home fetchPosts items count:',
            response.data.items.length
          )
          setServerPosts(response.data.items)
          setHasMore(response.data.has_more)
        } else {
          console.warn('Response data.items is not an array:', response?.data)
          setServerPosts([])
        }
      } else {
        console.warn('Fetch posts failed with code:', response?.code)
        setServerPosts([])
      }
    } catch (error) {
      console.error('Fetch posts failed:', error)
      setServerPosts([])
    } finally {
      setIsLoading(false)
    }
  }

  // 加载更多
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore || isLoading) return

    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = await getHomePosts(nextPage)
      const isSuccess =
        response && (response.code === 200 || response.code === 0)
      const hasData = response?.data && Array.isArray(response.data.items)

      if (isSuccess || hasData) {
        if (hasData) {
          setServerPosts(prev => {
            // 过滤重复数据，防止 key 重复报错
            const existingIds = new Set(prev.map(p => p.post_id))
            const newItems = response.data.items.filter(
              p => !existingIds.has(p.post_id)
            )
            return [...prev, ...newItems]
          })
          setHasMore(response.data.has_more)
          setPage(nextPage)
        }
      }
    } catch (error) {
      console.error('Load more posts failed:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, isLoading, page])

  // 监听路由参数，如果有新发布的帖子，添加到列表头部
  useEffect(() => {
    // 检查 route.params 是否存在，避免 undefined 错误
    if (route.params && route.params.newPost) {
      // 更新本地帖子列表
      setLocalPosts(prev => {
        // 防止重复添加
        const isDuplicate = prev.some(
          p => p.post_id === route.params.newPost.post_id
        )
        if (isDuplicate) return prev
        return [route.params.newPost, ...prev]
      })

      // 清除参数
      // @ts-ignore
      navigation.setParams({ newPost: null })

      // 自动滚动到社区模块顶部，确保用户看到新帖子
      // 使用 setTimeout 确保渲染完成后滚动
      setTimeout(() => {
        handleScrollToCommunity()
      }, 300)
    }
  }, [route.params]) // 依赖项改为 route.params

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
  })

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

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: event => {
        scrollY.value = event.contentOffset.y
        const paddingToBottom = 100
        const isClose =
          event.layoutMeasurement.height + event.contentOffset.y >=
          event.contentSize.height - paddingToBottom

        if (isClose) {
          runOnJS(loadMorePosts)()
        }
      }
    },
    [loadMorePosts]
  )

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

                  {isLoading && page === 1 ? (
                    <View style={{ padding: 20 }}>
                      <ActivityIndicator size="small" color="#f43f5e" />
                    </View>
                  ) : null}

                  {posts.map((post: PostItem, index: number) => (
                    <View
                      key={`${post.post_id || 'unknown'}-${index}`}
                      style={{ marginBottom: 12 }}
                    >
                      <HomeCommunityCard data={post} />
                    </View>
                  ))}

                  {isLoadingMore && (
                    <View style={{ padding: 10, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#f43f5e" />
                      <Text style={{ color: '#999', fontSize: 12 }}>
                        加载更多...
                      </Text>
                    </View>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <View style={{ padding: 10, alignItems: 'center' }}>
                      <Text style={{ color: '#ccc', fontSize: 12 }}>
                        - 没有更多内容了 -
                      </Text>
                    </View>
                  )}
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
