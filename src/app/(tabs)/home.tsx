import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import { TabBar, TabView } from 'react-native-tab-view'

import HomeSearchBar from '@/components/home/search/HomeSearchBar'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeBanner from '@/components/home/Banner/HomeBanner'
import {
  FollowEmptyState,
  HomeTabEmptyState
} from '@/components/home/HomeEmptyStates'
import { normalizeHomeTabKey, useHomeData } from '@/hooks/useHomeData'
import { HomeFeedTabKey, PostItem } from '@/types/home'

type HomeRoute = {
  key: HomeFeedTabKey
  title: string
}

const ROUTES: HomeRoute[] = [
  { key: 'recommend', title: '推荐' },
  { key: 'hot', title: '热门' },
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
  onGoToRecommend
}: {
  routeKey: HomeFeedTabKey
  posts: PostItem[]
  refreshing: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onRefresh: (tab: HomeFeedTabKey) => void
  onLoadMore: (tab: HomeFeedTabKey) => void
  onGoToRecommend: () => void
}) {
  const endReachedLockRef = useRef(false)

  const handleEndReached = useCallback(() => {
    if (endReachedLockRef.current || posts.length === 0) {
      return
    }

    endReachedLockRef.current = true
    onLoadMore(routeKey)

    setTimeout(() => {
      endReachedLockRef.current = false
    }, 800)
  }, [onLoadMore, posts.length, routeKey])

  const renderItem = useCallback(
    ({ item }: { item: PostItem }) => <HomeCommunityCard data={item} />,
    []
  )

  const renderEmptyState = useCallback(() => {
    if (routeKey === 'following') {
      return <FollowEmptyState onGoToRecommend={onGoToRecommend} />
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
  }, [onGoToRecommend, routeKey])

  const ListHeaderComponent = useMemo(() => {
    if (routeKey !== 'recommend') {
      return <View style={styles.listTopSpacer} />
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
      refreshing={refreshing}
      onRefresh={() => onRefresh(routeKey)}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={
        posts.length === 0 ? styles.emptyListContent : styles.listContent
      }
    />
  )
})

export default function Home() {
  const navigation = useNavigation<any>()
  const layout = useWindowDimensions()
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

  const [index, setIndex] = useState(() =>
    ROUTES.findIndex(route => route.key === normalizeHomeTabKey(activeTab))
  )

  useEffect(() => {
    const nextIndex = ROUTES.findIndex(route => route.key === activeTab)
    if (nextIndex !== -1 && nextIndex !== index) {
      setIndex(nextIndex)
    }
  }, [activeTab, index])

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

  const handleGoToRecommend = useCallback(() => {
    setActiveTab('recommend')
    setIndex(0)
  }, [setActiveTab])

  const renderScene = useCallback(
    ({ route }: { route: HomeRoute }) => {
      const posts =
        route.key === 'recommend'
          ? recommendPosts
          : route.key === 'hot'
            ? hotPosts
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
          onGoToRecommend={handleGoToRecommend}
        />
      )
    },
    [
      activeTab,
      followingFeedPosts,
      getTabHasMore,
      getTabLoadingMore,
      handleGoToRecommend,
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
        style={styles.tabBar}
        tabStyle={styles.tabItem}
        indicatorStyle={styles.tabIndicator}
        pressColor="transparent"
        renderLabel={({
          route,
          focused
        }: {
          route: HomeRoute
          focused: boolean
        }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {route.title}
          </Text>
        )}
      />
    ),
    []
  )

  return (
    <SafeAreaView style={styles.page} edges={['top']}>
      <HomeSearchBar onMenuPress={handleOpenDrawer} />

      <TabView
        navigationState={{ index, routes: ROUTES }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
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
  sceneContainer: {
    backgroundColor: '#ffffff'
  },
  tabBar: {
    backgroundColor: '#ffffff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb'
  },
  tabItem: {
    width: 'auto',
    paddingHorizontal: 20
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9ca3af'
  },
  tabLabelActive: {
    color: '#111827',
    fontWeight: '700'
  },
  tabIndicator: {
    backgroundColor: '#f43f5e',
    height: 3,
    borderRadius: 999
  },
  bannerSection: {
    paddingBottom: 6
  },
  listTopSpacer: {
    height: 8
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
  }
})
