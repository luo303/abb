import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

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

export default function Home() {
  const navigation = useNavigation()
  const route = useRoute<any>()
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const communityHeaderRef = useRef<View>(null)
  const isEndReachedRef = useRef(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // 使用自定义 Hooks
  const {
    posts,
    hasMore,
    isLoadingMore,
    isTabLoading,
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

  const { handleScroll, measureSearchBar, measureCommunityHeader } =
    useHomeAnimations()

  // 是否正在搜索
  const isSearching = searchText.trim().length > 0

  // 使用 useMemo 计算帖子列表，移除前端排序，依赖后端返回排好序的数据
  const sortedPosts = useMemo(() => {
    const filtered = isSearching
      ? Array.isArray(searchResults)
        ? searchResults
        : []
      : isTabLoading
        ? []
        : posts

    return filtered
  }, [isSearching, searchResults, posts, isTabLoading])

  // 将数据结构改为包含虚拟头部项的数组，利用 stickyHeaderIndices 实现原生吸顶
  const flatListData = useMemo(() => {
    if (isSearching) {
      return [
        { type: 'search-header', id: '__search_header__' },
        ...sortedPosts.map((post: any, i: number) => ({
          type: 'post',
          id: post.post_id || `unknown-${i}`,
          data: post
        }))
      ]
    }

    return [
      { type: 'header', id: '__header__' }, // index 0：顶部内容
      { type: 'tabs', id: '__tabs__' }, // index 1：Tab 栏（吸顶）
      ...sortedPosts.map((post: any) => ({
        type: 'post',
        id: post.post_id || `unknown-${Math.random()}`,
        data: post
      }))
    ]
  }, [isSearching, sortedPosts])

  // 渲染 FlatList 项
  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      // 搜索模式下的头部
      if (item.type === 'search-header') {
        // 只有在搜索结果为空且不在加载时才显示空状态
        if (!searchLoading && searchResults.length === 0) {
          return (
            <View style={styles.communitySection}>
              <SearchEmptyState isLoading={searchLoading} />
            </View>
          )
        }
        // 否则返回空视图
        return null
      }

      // 顶部轮播图等 Header 区域
      if (item.type === 'header') {
        return <MemoHeaderSections style={styles.topSection} />
      }

      // ✅ Tab 标签栏（吸顶项）
      // 底层透明，Animated.View 叠加渐变背景随吸顶进度淡入
      // 吸顶前：背景透明（视觉与顶部渐变区域连贯）
      // 标签栏：使用动态背景透明度效果，与首页背景颜色一致
      if (item.type === 'tabs') {
        return (
          <View style={localStyles.tabsWrapper}>
            {/* 渐变背景：与首页背景颜色一致 */}
            <LinearGradient
              colors={['#fff1f2', '#ffe4e6']}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Tab 内容层 */}
            <View ref={communityHeaderRef} onLayout={measureCommunityHeader}>
              <StickyTabHeader
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </View>
          </View>
        )
      }

      // 普通帖子
      if (item.type === 'post') {
        return (
          <View style={{ marginBottom: 12 }}>
            <HomeCommunityCard data={item.data} />
          </View>
        )
      }

      return null
    },
    [searchLoading, activeTab, setActiveTab, measureCommunityHeader]
  )

  // 滚动到社区模块
  const handleScrollToCommunity = useCallback(() => {
    communityHeaderRef.current?.measure((x, y, width, height, pageX, pageY) => {
      flatListRef.current?.scrollToOffset({
        offset: pageY - insets.top,
        animated: true
      })
    })
  }, [insets.top])

  const handleScrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [])

  const handleListScroll = useCallback(
    (event: any) => {
      handleScroll(event)
      const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0
      setShowScrollTop(offsetY > 400)
    },
    [handleScroll]
  )

  // 监听路由参数，添加新帖子或切换标签
  useEffect(() => {
    if (route.params) {
      // 处理新帖子参数
      if (route.params.newPost) {
        addNewPost(route.params.newPost)
        // @ts-ignore
        navigation.setParams({ newPost: null })
        setTimeout(() => {
          handleScrollToCommunity()
        }, 300)
      }
      // 处理切换标签参数
      if (route.params.activeTab) {
        setActiveTab(route.params.activeTab)
        // @ts-ignore
        navigation.setParams({ activeTab: null })
      }
    }
  }, [
    route.params,
    addNewPost,
    navigation,
    handleScrollToCommunity,
    setActiveTab
  ])

  // 处理列表到底部的逻辑，增加节流
  const handleEndReached = useCallback(() => {
    // 防止短时间内重复触发
    if (isEndReachedRef.current) return
    isEndReachedRef.current = true

    setTimeout(() => {
      isEndReachedRef.current = false
    }, 1000) // 1秒内不重复触发

    if (isSearching) {
      loadMoreSearchResults()
    } else {
      loadMore()
    }
  }, [isSearching, loadMoreSearchResults, loadMore])

  // 渲染列表尾部
  const ListFooterComponent = useCallback(() => {
    if (isTabLoading && !isSearching) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#f43f5e" />
          <Text style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
            加载中...
          </Text>
        </View>
      )
    }
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
        {!isLoadingMore && !hasMore && posts.length > 0 && (
          <View
            style={{
              paddingVertical: 6,
              paddingHorizontal: 16,
              alignItems: 'center'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 14,
                backgroundColor: '#FCE7F3'
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#F43F5E',
                  marginHorizontal: 6
                }}
              />
              <Text
                style={{ color: '#E11D48', fontSize: 12, fontWeight: '600' }}
              >
                我也是有底线的
              </Text>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: '#F43F5E',
                  marginHorizontal: 6
                }}
              />
            </View>
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
    isTabLoading,
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
        </View>

        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* 搜索栏固定，不参与滚动 */}
          <View onLayout={measureSearchBar} style={{ zIndex: 100 }}>
            <HomeSearchBar onSearch={handleSearch} />
          </View>

          {/* FlatList：stickyHeaderIndices={[1]} 让 tabs 项原生吸顶 */}
          <FlatList
            ref={flatListRef}
            key={isSearching ? 'search' : 'default'}
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            data={flatListData}
            keyExtractor={(item, index) => item.id || `item-${index}`}
            renderItem={renderItem}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={21}
            // ✅ 非搜索模式下，index=1 的 tabs 项吸顶
            stickyHeaderIndices={isSearching ? [] : [1]}
            ListFooterComponent={ListFooterComponent}
            onScroll={handleListScroll}
            scrollEventThrottle={16}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#f43f5e']}
                tintColor="#f43f5e"
                progressViewOffset={100}
              />
            }
          />
        </SafeAreaView>
      </View>
      {showScrollTop && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleScrollToTop}
          style={[localStyles.scrollTopButton, { bottom: 90 + insets.bottom }]}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </HomeScrollToContext.Provider>
  )
}

const localStyles = StyleSheet.create({
  tabsWrapper: {
    overflow: 'hidden',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22
  },
  scrollTopButton: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  }
})
