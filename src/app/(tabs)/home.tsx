import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated from 'react-native-reanimated'
import { HomeScrollToContext } from '@/context/HomeScrollContext'
import { useNavigation, useRoute } from '@react-navigation/native'
import HomeSearchBar from '@/components/home/search/HomeSearchBar'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import MemoHeaderSections from '@/components/home/MemoHeaderSections'
import StickyTabHeader from '@/components/home/StickyTabHeader'
import {
  SearchEmptyState,
  FollowEmptyState
} from '@/components/home/HomeEmptyStates'
import { useHomeData } from '@/hooks/useHomeData'
import { useHomeSearch } from '@/hooks/useHomeSearch'
import { useHomeAnimations } from '@/hooks/useHomeAnimations'
import { styles } from '@/styles/Home.styles'
import { PostItem } from '@/types/home'

export default function Home() {
  const navigation = useNavigation()
  const route = useRoute<any>()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const communityHeaderRef = useRef<View>(null)

  // 使用自定义 Hooks
  const {
    posts,
    hasMore,
    isLoadingMore,
    refreshing,
    activeTab,
    setActiveTab,
    handleRefresh,
    loadMore,
    addNewPost
  } = useHomeData()

  const {
    searchText,
    searchLoading,
    searchResults,
    searchHasMore,
    handleSearch,
    loadMoreSearchResults
  } = useHomeSearch()

  const {
    handleScroll,
    stickyHeaderAnimatedStyle,
    headerBackgroundStyle,
    measureSearchBar,
    measureCommunityHeader
  } = useHomeAnimations()

  // 是否正在搜索
  const isSearching = searchText.trim().length > 0

  // 使用 useMemo 计算排序后的帖子，只有当业务数据变化时才重新计算
  const sortedPosts = useMemo(() => {
    const filtered = isSearching
      ? Array.isArray(searchResults)
        ? searchResults
        : []
      : posts

    // 根据标签栏筛选和排序帖子
    return activeTab === '关注'
      ? [...filtered]
          .filter(post => post.is_followed === true)
          .sort((a, b) => {
            // 关注标签下按照发布时间排序
            if (a.ctime && b.ctime) {
              return b.ctime - a.ctime
            }
            return Math.random() - 0.5
          })
      : [...filtered].sort((a, b) => {
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
  }, [isSearching, searchResults, posts, activeTab])

  // 使用 useMemo 锁定列表数据，只有当排序后的帖子变化时才重新计算
  const flatListData = useMemo(() => {
    if (isSearching) return sortedPosts
    return sortedPosts.map(post => ({
      type: 'post',
      id: post.post_id || `unknown-${Math.random()}`,
      data: post
    }))
  }, [isSearching, sortedPosts])

  // 渲染 FlatList 项
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
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
    },
    [isSearching]
  )

  // 使用 useCallback 锁定 Header，防止 FlatList 每次都重挂载 Header
  const renderHeader = useCallback(() => {
    if (isSearching) {
      return (
        <View style={styles.communitySection}>
          <SearchEmptyState isLoading={searchLoading} />
        </View>
      )
    }

    return (
      <View>
        <MemoHeaderSections style={styles.topSection} />
        <View ref={communityHeaderRef} onLayout={measureCommunityHeader}>
          <StickyTabHeader activeTab={activeTab} onTabChange={setActiveTab} />
        </View>
      </View>
    )
  }, [
    isSearching,
    searchLoading,
    activeTab,
    setActiveTab,
    measureCommunityHeader
  ])

  // 滚动到社区模块
  const handleScrollToCommunity = useCallback(() => {
    // 滚动到社区标题栏位置，确保吸顶效果完全显示
    communityHeaderRef.current?.measure((x, y, width, height, pageX, pageY) => {
      flatListRef.current?.scrollToOffset({
        offset: pageY - insets.top,
        animated: true
      })
    })
  }, [insets.top])

  // 监听路由参数，如果有新发布的帖子，添加到列表头部
  useEffect(() => {
    // 检查 route.params 是否存在，避免 undefined 错误
    if (route.params && route.params.newPost) {
      // 更新本地帖子列表
      addNewPost(route.params.newPost)

      // 清除参数
      // @ts-ignore
      navigation.setParams({ newPost: null })

      // 自动滚动到社区模块顶部，确保用户看到新帖子
      // 使用 setTimeout 确保渲染完成后滚动
      setTimeout(() => {
        handleScrollToCommunity()
      }, 300)
    }
  }, [route.params, addNewPost, navigation, handleScrollToCommunity])

  // 渲染列表尾部
  const ListFooterComponent = useCallback(() => {
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
      return <FollowEmptyState onGoToRecommend={() => setActiveTab('推荐')} />
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
  }, [
    isSearching,
    searchLoading,
    searchResults,
    searchHasMore,
    activeTab,
    sortedPosts,
    isLoadingMore,
    hasMore,
    posts,
    setActiveTab
  ])

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
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              },
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
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                }}
              />
              <View style={{ zIndex: 1 }}>
                <StickyTabHeader
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </View>
            </Animated.View>
          )}

          {/* 使用 FlatList 实现滚动 */}
          <FlatList
            ref={flatListRef}
            style={styles.container}
            contentContainerStyle={[{ paddingBottom: 150 }]}
            showsVerticalScrollIndicator={false}
            data={flatListData}
            keyExtractor={(item, index) => {
              if (isSearching) {
                return item.post_id || `post-${index}`
              }
              return item.id || `item-${index}`
            }}
            renderItem={renderItem}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={21}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={ListFooterComponent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => {
              if (isSearching) {
                loadMoreSearchResults()
              } else {
                loadMore()
              }
            }}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#f43f5e']}
                tintColor="#f43f5e"
                // 关键：将刷新圆圈向下偏移，偏移量大约是轮播图的一半高度
                // 这样圆圈会悬浮在轮播图上方刷新，而不会把轮播图往下顶，视觉上更稳
                progressViewOffset={100}
              />
            }
          />
        </SafeAreaView>
      </View>
    </HomeScrollToContext.Provider>
  )
}
