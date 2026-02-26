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
import { Ionicons } from '@expo/vector-icons'
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
import { HomeScrollToContext } from '@/context/HomeScrollContext'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import HomeBanner from '@/components/home/Banner/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchBar from '@/components/home/search/HomeSearchBar'
import { PostItem } from '@/types/home'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { fetchPostList, loadMorePosts } from '@/store/modules/PostStore'
import { getUserMeReq, ApiResponse, UserMeResponse } from '../../api/profile'
import { setUserInfo } from '../../store/modules/userStore'
import { searchPosts } from '@/api/post'

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
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<PostItem[]>([])
  const [searchPage, setSearchPage] = useState(1)
  const [searchHasMore, setSearchHasMore] = useState(true)

  // 使用 Redux store
  const dispatch = useAppDispatch()
  const { postList, loading, hasMore, isLoadingMore, page } = useAppSelector(
    state => state.post
  )
  const userInfo = useAppSelector(
    state => state.user.userInfo
  ) as UserMeResponse | null

  // 合并展示的数据
  // 优先使用 postList 的数据（因为它是经过详情页更新后的最新状态）
  // 只有当 postList 里没有时（还没同步），才使用 localPosts
  const serverIds = new Set(postList.map(p => p.post_id))
  const uniqueLocalPosts = localPosts.filter(p => !serverIds.has(p.post_id))
  // 确保 postList 中的数据（已更新状态）优先显示
  const posts = [...postList, ...uniqueLocalPosts]

  // 是否正在搜索
  const isSearching = searchText.trim().length > 0

  // 搜索处理函数
  const handleSearch = React.useCallback(
    async (text: string) => {
      // 增加请求锁，防止重叠请求
      if (searchLoading) return

      const keyword = text.trim()

      // 当搜索框内容为空时，重置搜索状态并切回首页推荐列表
      if (!keyword) {
        setSearchText('')
        setSearchLoading(false)
        setSearchPage(1)
        setSearchResults([])
        setSearchHasMore(true)
        return
      }

      setSearchText(keyword)
      setSearchLoading(true)
      setSearchPage(1)
      // 修复分页重置逻辑：先设置 has_more 为 false，防止列表为空时自动触发 onEndReached
      setSearchHasMore(false)
      setSearchResults([])

      try {
        // 传递正确的参数给 searchPosts 函数
        const response = await searchPosts(keyword, 1, 10, undefined, 'time')

        // 处理错误情况
        if (response.code === -1 || response.message.includes('用户不存在')) {
          // 跳转到登录页前清空所有搜索状态
          setSearchText('')
          setSearchLoading(false)
          setSearchPage(1)
          setSearchResults([])
          setSearchHasMore(true)
          // 跳转到登录页
          navigation.navigate('Login')
          return
        }

        if (response.code === 200 && response.data) {
          const items = response.data.items || []
          setSearchResults(items)
          // 如果没有结果，直接设置 has_more 为 false，防止无限加载
          setSearchHasMore(
            items.length > 0 && (response.data.has_more || false)
          )
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setSearchLoading(false)
      }
    },
    [navigation, searchLoading]
  )

  // 加载更多搜索结果
  const loadMoreSearchResults = React.useCallback(async () => {
    if (!isSearching || searchLoading || !searchHasMore) return

    setSearchLoading(true)
    try {
      const nextPage = searchPage + 1
      // 传递正确的参数给 searchPosts 函数
      const response = await searchPosts(
        searchText,
        nextPage,
        10,
        undefined,
        'time'
      )

      if (response.code === 200 && response.data) {
        const items = response.data.items || []
        setSearchResults(prev => [...prev, ...items])
        // 如果没有更多结果，设置 has_more 为 false
        setSearchHasMore(items.length > 0 && (response.data.has_more || false))
        setSearchPage(nextPage)
      }
    } catch (error) {
      console.error('Load more search results failed:', error)
    } finally {
      setSearchLoading(false)
    }
  }, [isSearching, searchLoading, searchHasMore, searchPage, searchText])

  // 搜索结果
  const filteredPosts = isSearching
    ? Array.isArray(searchResults)
      ? searchResults
      : []
    : posts

  // 根据标签栏筛选和排序帖子
  const sortedPosts =
    activeTab === '关注'
      ? [...filteredPosts]
          .filter(post => post.is_followed === true)
          .sort((a, b) => {
            // 关注标签下按照发布时间排序
            if (a.ctime && b.ctime) {
              return b.ctime - a.ctime
            }
            return Math.random() - 0.5
          })
      : [...filteredPosts].sort((a, b) => {
          switch (activeTab) {
            case '推荐':
              // 按照发布时间排序（如果有ctime字段），否则随机排序
              if (a.ctime && b.ctime) {
                return b.ctime - a.ctime
              }
              return Math.random() - 0.5
            case '热门':
              // 按照点赞数由高到低排序
              return (b.like_count || 0) - (a.like_count || 0)
            default:
              return 0
          }
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
  }, [])

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
      let strategy: string | undefined
      if (activeTab === '热门') {
        strategy = 'hot'
      } else if (activeTab === '推荐' || activeTab === '关注') {
        strategy = 'ctime'
      }
      await dispatch(fetchPostList({ page: 1, strategy }))
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // 初始化时加载数据
  useEffect(() => {
    let strategy: string | undefined
    if (activeTab === '热门') {
      strategy = 'hot'
    } else if (activeTab === '推荐' || activeTab === '关注') {
      strategy = 'ctime'
    }
    dispatch(fetchPostList({ page: 1, strategy }))
  }, [dispatch, activeTab])

  // 首次进入首页时获取一次用户信息（如果 Redux 中还没有）
  useEffect(() => {
    if (userInfo) return
    let isActive = true

    const fetchUserInfo = async () => {
      try {
        const res =
          (await getUserMeReq()) as unknown as ApiResponse<UserMeResponse>
        if (!isActive) return
        if (res.code === 0 && res.data) {
          dispatch(setUserInfo(res.data))
        }
      } catch (error) {
        if (!isActive) return
        console.error('获取用户信息失败：', error)
      }
    }

    fetchUserInfo()

    return () => {
      isActive = false
    }
  }, [dispatch, userInfo])

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
    ? sortedPosts
    : sortedPosts.map(post => ({
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
              style={activeTab === '热门' ? styles.activeTab : styles.tab}
              onPress={() => setActiveTab('热门')}
            >
              <Text
                style={
                  activeTab === '热门' ? styles.activeTabText : styles.tabText
                }
              >
                热门
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
          {!searchLoading && filteredPosts.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>暂无相关帖子</Text>
              <Text style={styles.emptyStateSubtitle}>换个关键词试试吧</Text>
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
      </>
    )
  }

  // 渲染列表尾部
  const ListFooterComponent = () => {
    if (isSearching) {
      return (
        <View>
          {searchLoading && searchResults.length === 0 && (
            <View style={{ padding: 10, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#f43f5e" />
              <Text style={{ color: '#999', fontSize: 12 }}>搜索中...</Text>
            </View>
          )}
          {!searchLoading && !searchHasMore && searchResults.length > 0 && (
            <View style={{ padding: 10, alignItems: 'center' }}>
              <Text style={{ color: '#ccc', fontSize: 12 }}>
                - 没有更多搜索结果了 -
              </Text>
            </View>
          )}
        </View>
      )
    }

    // 关注标签的空状态提示
    if (activeTab === '关注' && sortedPosts.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>还没有关注任何人</Text>
          <Text style={styles.emptyStateSubtitle}>
            关注感兴趣的作者，获取他们的最新动态
          </Text>
          <TouchableOpacity onPress={() => setActiveTab('推荐')}>
            <LinearGradient
              colors={['#ff9a9e', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.emptyStateButton}
            >
              <Text style={styles.emptyStateButtonText}>去发现精彩内容</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )
    }

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
            <HomeSearchBar onSearch={handleSearch} />
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
              if (isSearching) {
                loadMoreSearchResults()
              } else if (hasMore && !isLoadingMore) {
                dispatch(loadMorePosts({ page: page + 1 }))
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
  },
  // 关注标签空状态样式
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30
  },
  emptyStateButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
})
