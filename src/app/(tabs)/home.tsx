import React, {
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useState,
  memo
} from 'react'
import {
  View,
  Text,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
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
  FollowEmptyState,
  HomeTabEmptyState
} from '@/components/home/HomeEmptyStates'
import { useHomeData } from '@/hooks/useHomeData'
import { useHomeAnimations } from '@/hooks/useHomeAnimations'
import { styles } from '@/styles/Home.styles'

type HomeListItem =
  | { type: 'spacer'; id: '__spacer__' }
  | { type: 'tabs'; id: '__tabs__' }
  | { type: 'post'; id: string; data: any }

const ScrollTopButton = memo(function ScrollTopButton({
  visible,
  onPress,
  bottom
}: {
  visible: boolean
  onPress: () => void
  bottom: number
}) {
  if (!visible) return null

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[localStyles.scrollTopButton, { bottom }]}
    >
      <Ionicons name="arrow-up" size={20} color="#fff" />
    </TouchableOpacity>
  )
})

ScrollTopButton.displayName = 'ScrollTopButton'

export default function Home() {
  const navigation = useNavigation()
  const route = useRoute<any>()
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlashListRef<HomeListItem>>(null)
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

  const { handleScroll, measureSearchBar, measureCommunityHeader } =
    useHomeAnimations()

  // 使用 useMemo 计算帖子列表，移除前端排序，依赖后端返回排好序的数据
  const sortedPosts = useMemo(() => {
    return isTabLoading ? [] : posts
  }, [posts, isTabLoading])

  // 将数据结构改为包含虚拟头部项的数组，利用 stickyHeaderIndices 实现原生吸顶
  const flatListData = useMemo<HomeListItem[]>(() => {
    return [
      { type: 'spacer', id: '__spacer__' }, // index 0: 增加一个空占位符，解决 FlashList 在有 ListHeaderComponent 时 index 0 的吸顶 Bug
      { type: 'tabs', id: '__tabs__' }, // index 1 (Sticky)
      ...sortedPosts.map((post: any) => ({
        type: 'post' as const,
        id: String(post.post_id),
        data: post
      }))
    ]
  }, [sortedPosts])

  // 渲染 FlatList 项
  const renderItem = useCallback(
    ({ item, target }: { item: any; target?: string }) => {
      // 0. 占位符
      if (item.type === 'spacer') {
        return <View style={{ height: 0 }} />
      }

      // 1. ✅ Tab 标签栏（吸顶项，index 1）
      if (item.type === 'tabs') {
        const isSticky = target === 'StickyHeader'
        return (
          <View
            style={[
              localStyles.tabsWrapper,
              {
                backgroundColor: '#ffe4e6' // 始终使用实色背景，防止透底
              },
              isSticky && {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                // 吸顶时增加阴影
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5
              }
            ]}
          >
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
    [activeTab, setActiveTab, measureCommunityHeader]
  )

  // 1. 抽离独立的顶部 Header 内容组件（包含搜索栏 + 模块入口）
  // 这个组件会被 SafeAreaView 包裹，且位于 FlashList 顶部
  const ListHeaderComponent = useCallback(() => {
    return (
      <View>
        <View onLayout={measureSearchBar} style={{ zIndex: 100 }}>
          <HomeSearchBar />
        </View>
        <MemoHeaderSections style={styles.topSection} />
      </View>
    )
  }, [measureSearchBar])

  // 滚动到社区模块
  const handleScrollToCommunity = useCallback(() => {
    communityHeaderRef.current?.measure((x, y, width, height, pageX, pageY) => {
      listRef.current?.scrollToOffset({
        offset: pageY - insets.top,
        animated: true
      })
    })
  }, [insets.top])

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }, [])

  const handleGoToRecommend = useCallback(() => {
    setActiveTab('推荐')
  }, [setActiveTab])

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

    loadMore()
  }, [loadMore])

  // 渲染列表尾部
  const ListFooterComponent = useCallback(() => {
    if (isTabLoading) {
      return (
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#f43f5e" />
          <Text style={{ color: '#999', fontSize: 12, marginTop: 6 }}>
            加载中...
          </Text>
        </View>
      )
    }

    if (activeTab === '关注' && sortedPosts.length === 0) {
      return <FollowEmptyState onGoToRecommend={handleGoToRecommend} />
    }
    if (activeTab === '推荐' && sortedPosts.length === 0) {
      return (
        <HomeTabEmptyState
          iconName="sparkles-outline"
          title="暂无推荐内容"
          subtitle="下拉刷新试试"
        />
      )
    }
    if (activeTab === '热门' && sortedPosts.length === 0) {
      return (
        <HomeTabEmptyState
          iconName="flame-outline"
          title="暂无热门内容"
          subtitle="稍后再来看看"
        />
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
    activeTab,
    sortedPosts,
    isTabLoading,
    isLoadingMore,
    hasMore,
    posts,
    handleGoToRecommend
  ])

  const keyExtractor = useCallback((item: HomeListItem) => item.id, [])

  return (
    <HomeScrollToContext.Provider
      value={{ scrollToCommunity: handleScrollToCommunity }}
    >
      <View style={styles.mainContainer}>
        {/* 1. 背景渐变 (全屏背景，包含状态栏) */}
        <LinearGradient
          colors={['#fff1f2', '#ffe4e6']}
          style={StyleSheet.absoluteFill}
        />

        {/* 使用 SafeAreaView 处理顶部安全区域，FlashList 会在安全区域内滚动 */}
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlashList
            ref={listRef}
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            data={flatListData}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemType={item => item.type}
            // ✅ index=1 的 tabs 项吸顶 (因为 index 0 是 spacer，ListHeaderComponent 位于上方)
            stickyHeaderIndices={[1]}
            ListHeaderComponent={ListHeaderComponent}
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
              />
            }
          />
        </SafeAreaView>
      </View>
      <ScrollTopButton
        visible={showScrollTop}
        onPress={handleScrollToTop}
        bottom={90 + insets.bottom}
      />
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
