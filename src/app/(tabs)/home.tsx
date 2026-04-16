import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import {
  DrawerActions,
  useFocusEffect,
  useNavigation
} from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TabBar, TabView } from 'react-native-tab-view'

import HomeBanner from '@/components/home/Banner/HomeBanner'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import {
  FollowEmptyState,
  HomeTabEmptyState
} from '@/components/home/HomeEmptyStates'
import HomeSearchBar from '@/components/home/search/HomeSearchBar'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { normalizeHomeTabKey, useHomeData } from '@/hooks/useHomeData'
import { HomeFeedTabKey, PostItem } from '@/types/home'
import { syncMessengerHomeEntry } from '@/store/modules/MessengerStore'

type HomeRoute = {
  key: HomeFeedTabKey
  title: string
}

const ROUTES: HomeRoute[] = [
  { key: 'hot', title: '热门' },
  { key: 'recommend', title: '推荐' },
  { key: 'following', title: '关注' }
]

const HomeFeedScene = memo(function HomeFeedScene({
  routeKey,
  posts,
  refreshing,
  isLoadingMore,
  hasMore,
  onRefresh,
  onLoadMore,
  onGoToHot
}: {
  routeKey: HomeFeedTabKey
  posts: PostItem[]
  refreshing: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onRefresh: (tab: HomeFeedTabKey) => void
  onLoadMore: (tab: HomeFeedTabKey) => void
  onGoToHot: () => void
}) {
  const endReachedLockRef = useRef(false)

  useEffect(() => {
    if (!isLoadingMore) {
      endReachedLockRef.current = false
    }
  }, [isLoadingMore])

  const handleEndReached = useCallback(() => {
    if (
      endReachedLockRef.current ||
      isLoadingMore ||
      refreshing ||
      posts.length === 0 ||
      !hasMore
    ) {
      return
    }

    endReachedLockRef.current = true
    onLoadMore(routeKey)
  }, [hasMore, isLoadingMore, onLoadMore, posts.length, refreshing, routeKey])

  const renderItem = useCallback(
    ({ item }: { item: PostItem }) => <HomeCommunityCard data={item} />,
    []
  )

  const renderSeparator = useCallback(
    () => <View style={styles.postSeparator} />,
    []
  )

  const renderEmptyState = useCallback(() => {
    if (routeKey === 'following') {
      return <FollowEmptyState onGoToRecommend={onGoToHot} />
    }

    if (routeKey === 'hot') {
      return (
        <HomeTabEmptyState
          iconName="flame-outline"
          title="暂无热门内容"
          subtitle="稍后再来看看"
        />
      )
    }

    return (
      <HomeTabEmptyState
        iconName="sparkles-outline"
        title="暂无推荐内容"
        subtitle="下拉刷新试试"
      />
    )
  }, [onGoToHot, routeKey])

  const ListHeaderComponent = useCallback(() => {
    if (routeKey !== 'hot') {
      return null
    }

    return (
      <View style={styles.bannerSection}>
        <HomeBanner />
      </View>
    )
  }, [routeKey])

  const ListFooterComponent = useCallback(() => {
    if (posts.length === 0) {
      return null
    }

    if (isLoadingMore) {
      return (
        <View style={styles.footerState}>
          <ActivityIndicator size="small" color="#f43f5e" />
          <Text style={styles.footerText}>加载更多中...</Text>
        </View>
      )
    }

    if (!hasMore) {
      return (
        <View style={styles.footerState}>
          <Text style={styles.footerText}>已经到底啦</Text>
        </View>
      )
    }

    return <View style={styles.footerSpacer} />
  }, [hasMore, isLoadingMore, posts.length])

  return (
    <FlashList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => String(item.post_id || item.id)}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => onRefresh(routeKey)}
          tintColor="#f43f5e"
          colors={['#f43f5e']}
          progressViewOffset={routeKey === 'hot' ? 10 : 0}
        />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.3}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={renderSeparator}
      contentContainerStyle={
        posts.length === 0 ? styles.emptyListContent : styles.listContent
      }
    />
  )
})

export default function Home() {
  const navigation = useNavigation<any>()
  const dispatch = useAppDispatch()
  const layout = useWindowDimensions()
  const token = useAppSelector(state => state.user.token)
  const {
    activeTab,
    setActiveTab,
    refreshing,
    handleRefresh,
    loadMore,
    recommendPosts,
    hotPosts,
    followingFeedPosts,
    getTabHasMore,
    getTabLoadingMore
  } = useHomeData()

  const [index, setIndex] = useState(() => {
    const initialIndex = ROUTES.findIndex(
      route => route.key === normalizeHomeTabKey(activeTab)
    )

    return initialIndex === -1 ? 0 : initialIndex
  })

  useEffect(() => {
    const nextIndex = ROUTES.findIndex(route => route.key === activeTab)
    if (nextIndex !== -1 && nextIndex !== index) {
      setIndex(nextIndex)
    }
  }, [activeTab, index])

  useFocusEffect(
    useCallback(() => {
      if (!token) return

      console.log('[首页] 进入首页，准备初始化聊天连接')
      void dispatch(syncMessengerHomeEntry())
    }, [dispatch, token])
  )

  const handleIndexChange = useCallback(
    (nextIndex: number) => {
      setIndex(nextIndex)
      setActiveTab(ROUTES[nextIndex].key)
    },
    [setActiveTab]
  )

  const handleOpenDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer())
  }, [navigation])

  const handleGoToHot = useCallback(() => {
    setActiveTab('hot')
    setIndex(0)
  }, [setActiveTab])

  const renderScene = useCallback(
    ({ route }: { route: HomeRoute }) => {
      const posts =
        route.key === 'hot'
          ? hotPosts
          : route.key === 'recommend'
            ? recommendPosts
            : followingFeedPosts

      return (
        <HomeFeedScene
          routeKey={route.key}
          posts={posts}
          refreshing={refreshing && activeTab === route.key}
          isLoadingMore={getTabLoadingMore(route.key)}
          hasMore={getTabHasMore(route.key)}
          onRefresh={handleRefresh}
          onLoadMore={loadMore}
          onGoToHot={handleGoToHot}
        />
      )
    },
    [
      activeTab,
      followingFeedPosts,
      getTabHasMore,
      getTabLoadingMore,
      handleGoToHot,
      handleRefresh,
      hotPosts,
      loadMore,
      recommendPosts,
      refreshing
    ]
  )

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        scrollEnabled={false}
        style={styles.tabBar}
        tabStyle={[
          styles.tabItem,
          { width: layout.width / props.navigationState.routes.length }
        ]}
        indicatorStyle={styles.tabIndicator}
        labelStyle={styles.tabLabel}
        activeColor="#111827"
        inactiveColor="#9ca3af"
        pressColor="transparent"
      />
    ),
    [layout.width]
  )

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <HomeSearchBar onMenuPress={handleOpenDrawer} />

      <TabView
        navigationState={{ index, routes: ROUTES }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        swipeEnabled
        lazy
        style={styles.tabView}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  tabView: {
    flex: 1
  },
  tabBar: {
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eceef2'
  },
  tabItem: {
    justifyContent: 'center'
  },
  tabLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textTransform: 'none'
  },
  tabIndicator: {
    height: 3,
    borderRadius: 999,
    backgroundColor: '#f43f5e'
  },
  bannerSection: {
    paddingBottom: 8
  },
  listContent: {
    paddingBottom: 120
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 48
  },
  footerState: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  footerSpacer: {
    height: 24
  },
  postSeparator: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: '#eceef2'
  }
})
