import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  ScrollView
} from 'react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
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
import { useNavigation, useRoute } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import HomeBanner from '@/components/home/Banner/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchBar from '@/components/home/search/HomeSearchBar'
import { PostItem } from '@/types/home'
import { usePostList } from '../../hooks/usePagination'

/**
 * 首页组件
 * 包含搜索管理、轮播图、功能导航和社区模块列表
 */
export default function Home() {
  const navigation = useNavigation<NavigationProps>()
  const route = useRoute<any>()
  const insets = useSafeAreaInsets()
  const scrollY = useSharedValue(0)
  const flatListRef = useRef<any>(null)
  const [searchText, setSearchText] = useState('')
  const [localPosts, setLocalPosts] = useState<PostItem[]>([])
  const [activeTab, setActiveTab] = useState('推荐')
  const [refreshing, setRefreshing] = useState(false)

  // 使用帖子列表Hook
  const {
    posts: serverPosts,
    page,
    hasMore,
    isLoading,
    isLoadingMore,
    refresh: fetchPosts,
    loadMore: loadMorePosts
  } = usePostList()

  // 合并展示的数据
  // 逻辑优化：优先使用 serverPosts 的数据（因为它是经过详情页更新后的最新状态）
  // 只有当 serverPosts 里没有时（还没同步），才使用 localPosts
  const serverIds = new Set(serverPosts.map(p => p.post_id))
  const uniqueLocalPosts = localPosts.filter(p => !serverIds.has(p.post_id))
  const posts = [...uniqueLocalPosts, ...serverPosts]

  // 是否正在搜索
  const isSearching = searchText.trim().length > 0

  // 搜索过滤逻辑
  const filteredPosts = posts.filter(post => {
    if (!isSearching) return true
    const searchContent = searchText.toLowerCase()
    return (
      post.content.toLowerCase().includes(searchContent) ||
      (post.author_name &&
        post.author_name.toLowerCase().includes(searchContent)) ||
      (post.author_city &&
        post.author_city.toLowerCase().includes(searchContent))
    )
  })

  // 徽章动画
  const badgeScale = useSharedValue(1)

  // 社区模块闪烁动画
  const communityOpacity = useSharedValue(1)

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

  // 滚动到社区模块
  const handleScrollToCommunity = () => {
    // 滚动到社区标题栏位置，确保吸顶效果完全显示
    const scrollPosition = communityHeaderY
    flatListRef.current?.scrollToOffset({
      offset: scrollPosition,
      animated: true
    })

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

  // 下拉刷新处理函数
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchPosts()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // 顶部背景动画样式
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const triggerPoint =
      communityHeaderY > 0 ? communityHeaderY - insets.top - 50 : 300
    const opacity = interpolate(
      scrollY.value,
      [triggerPoint - 100, triggerPoint],
      [0, 1],
      Extrapolation.CLAMP
    )
    return { opacity }
  })

  // 准备 FlatList 数据
  const flatListData = isSearching
    ? filteredPosts
    : posts.map(post => ({
        type: 'post',
        id: post.post_id || `unknown-${Math.random()}`,
        data: post
      }))

  // 渲染 FlatList 项
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    if (isSearching) {
      return (
        <View style={{ marginBottom: 12 }}>
          <HomeCommunityCard data={item} />
        </View>
      )
    }

    if (item.type === 'post') {
      return (
        <View style={{ marginBottom: 12 }}>
          <HomeCommunityCard data={item.data} />
        </View>
      )
    }

    return null
  }

  // 渲染社区标题栏
  const renderCommunityHeader = () => (
    <View style={styles.stickyHeader}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleAndTabsContainer}>
          <View style={styles.sectionTitleWrapper}>
            <LinearGradient
              colors={['#ff9a9e', '#f43f5e']}
              style={styles.iconBox}
            >
              <Ionicons name="people" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.sectionTitle}>宝妈社区</Text>
          </View>
          {/* 添加标签栏 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            <TouchableOpacity
              style={activeTab === '推荐' ? styles.activeTab : styles.tab}
              onPress={() => setActiveTab('推荐')}
            >
              <Text
                style={
                  activeTab === '推荐' ? styles.activeTabText : styles.tabText
                }
              >
                推荐
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={activeTab === '关注' ? styles.activeTab : styles.tab}
              onPress={() => setActiveTab('关注')}
            >
              <Text
                style={
                  activeTab === '关注' ? styles.activeTabText : styles.tabText
                }
              >
                关注
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddPost')}
        >
          <LinearGradient
            colors={['#ff9a9e', '#f43f5e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionBadge}
          >
            <Text style={styles.badgeText}>记录美好瞬间</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )

  // 渲染列表头部（轮播图和工具栏）
  const ListHeaderComponent = () => {
    if (isSearching) {
      return (
        <View style={styles.communitySection}>
          {filteredPosts.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#999' }}>未找到相关内容</Text>
            </View>
          )}
        </View>
      )
    }

    return (
      <>
        {/* 轮播图 */}
        <View style={styles.bannerSection}>
          <HomeBanner />
        </View>

        {/* 工具栏 */}
        <HomeNavGrid />

        {/* 加载状态 */}
        {isLoading && page === 1 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#f43f5e" />
          </View>
        ) : null}
      </>
    )
  }

  // 渲染列表尾部
  const ListFooterComponent = () => {
    if (isSearching) return null

    return (
      <View>
        {isLoadingMore && (
          <View style={{ padding: 10, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#f43f5e" />
            <Text style={{ color: '#999', fontSize: 12 }}>加载更多...</Text>
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
    )
  }

  // 社区标题栏引用
  const communityHeaderRef = useRef<View>(null)
  // 搜索栏高度
  const [searchBarHeight, setSearchBarHeight] = useState(0)
  // 社区标题栏原始位置
  const [communityHeaderY, setCommunityHeaderY] = useState(0)

  // 使用Animated API实现平滑过渡
  const stickyProgress = useSharedValue(0)

  // 处理滚动事件
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y

    // 计算滚动进度，用于平滑过渡
    if (communityHeaderY > 0) {
      const threshold = communityHeaderY - searchBarHeight
      const progress = Math.max(0, Math.min(1, (scrollY - threshold + 20) / 40))
      stickyProgress.value = progress
    }
  }

  // 计算吸顶标题栏的样式
  const stickyHeaderAnimatedStyle = useAnimatedStyle(() => {
    // 根据滚动进度计算透明度和位置
    const opacity = stickyProgress.value
    const translateY = stickyProgress.value * (searchBarHeight + 10)

    return {
      opacity,
      transform: [{ translateY }],
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99
    }
  })

  // 计算滚动标题栏的样式
  const scrollHeaderAnimatedStyle = useAnimatedStyle(() => {
    // 根据滚动进度计算透明度
    const opacity = 1 - stickyProgress.value

    return {
      opacity
    }
  })

  // 测量搜索栏高度
  const measureSearchBar = (event: any) => {
    setSearchBarHeight(event.nativeEvent.layout.height)
  }

  // 测量社区标题栏位置
  const measureCommunityHeader = (event: any) => {
    setCommunityHeaderY(event.nativeEvent.layout.y)
  }

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
          {/* 搜索栏固定位置，不参与滚动 */}
          <View onLayout={measureSearchBar} style={{ zIndex: 100 }}>
            <HomeSearchBar onSearch={setSearchText} />
          </View>

          {/* 固定的社区标题栏（使用动画实现平滑过渡） */}
          {!isSearching && (
            <Animated.View
              style={[styles.stickyHeader, stickyHeaderAnimatedStyle]}
            >
              <LinearGradient
                colors={['#fff1f2', '#ffe4e6']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={{ zIndex: 1 }}>{renderCommunityHeader()}</View>
            </Animated.View>
          )}

          {/* 使用 FlatList 实现滚动 */}
          <FlatList
            ref={flatListRef}
            style={styles.container}
            contentContainerStyle={[{ paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
            data={flatListData}
            keyExtractor={(item, index) => {
              if (isSearching) {
                return item.post_id || `post-${index}`
              }
              return item.id || `item-${index}`
            }}
            renderItem={renderItem}
            ListHeaderComponent={() => (
              <>
                {ListHeaderComponent()}
                {/* 社区标题栏（滚动时显示，使用动画实现平滑过渡） */}
                {!isSearching && (
                  <Animated.View
                    ref={communityHeaderRef}
                    onLayout={measureCommunityHeader}
                    style={[styles.stickyHeader, scrollHeaderAnimatedStyle]}
                  >
                    {renderCommunityHeader()}
                  </Animated.View>
                )}
              </>
            )}
            ListFooterComponent={ListFooterComponent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => {
              if (!isSearching && hasMore && !isLoadingMore) {
                loadMorePosts()
              }
            }}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#f43f5e']}
                tintColor="#f43f5e"
              />
            }
          />
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
    marginBottom: 5
  },
  communitySection: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  titleAndTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 20
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
    backgroundColor: '#f43f5e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  badgeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  },
  // 标签栏样式
  tabContainer: {
    flexDirection: 'row',
    gap: 20
  },
  tab: {
    paddingVertical: 5
  },
  activeTab: {
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#ff1744'
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    fontSize: 16,
    color: '#ff1744',
    fontWeight: '600'
  },
  // 吸顶标题栏样式
  stickyHeader: {
    paddingHorizontal: 8,
    marginTop: 15,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10
  }
})
