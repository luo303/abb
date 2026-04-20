import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'

import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import { HOME_PINK_THEME } from '@/components/home/homePalette'
import { PostItem } from '@/types/home'
import { getMyCollections } from '@/api/post'

interface PostListResponse {
  code: number
  message: string
  data?: {
    items: PostItem[]
    page: number
    page_size: number
    has_more: boolean
  }
}

const PAGE_SIZE = 10

export default function MyFavorites() {
  const insets = useSafeAreaInsets()
  const [posts, setPosts] = useState<PostItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const fetchPage = useCallback(
    async (targetPage: number, isRefresh = false) => {
      if (loading && !isRefresh) return
      if (!hasMore && !isRefresh) return

      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      try {
        const res = (await getMyCollections(
          targetPage,
          PAGE_SIZE,
          'ctime'
        )) as PostListResponse

        const ok = res?.code === 0 || res?.code === 200
        const items = ok ? res.data?.items || [] : []

        setPosts(prev => (targetPage === 1 ? items : [...prev, ...items]))
        setPage(targetPage)
        setHasMore(res.data?.has_more ?? false)
      } catch (error) {
        console.error('Failed to load my collections:', error)
      } finally {
        setLoading(false)
        setRefreshing(false)
        if (targetPage === 1) {
          setInitialLoaded(true)
        }
      }
    },
    [hasMore, loading]
  )

  useFocusEffect(
    useCallback(() => {
      setInitialLoaded(false)
      fetchPage(1, true)
    }, [fetchPage])
  )

  const handleRefresh = useCallback(() => {
    void fetchPage(1, true)
  }, [fetchPage])

  const handleLoadMore = useCallback(() => {
    if (!initialLoaded) return
    if (loading || refreshing) return
    if (hasMore) {
      void fetchPage(page + 1)
    }
  }, [fetchPage, hasMore, initialLoaded, loading, page, refreshing])

  const renderItem = useCallback(({ item }: { item: PostItem }) => {
    return <HomeCommunityCard data={item} tone="pink" />
  }, [])

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  )

  const ListEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>暂无收藏</Text>
        <Text style={styles.emptySubtitle}>快去发现感兴趣的内容并收藏吧</Text>
      </View>
    )
  }, [])

  const ListFooterComponent = useCallback(() => {
    if (!loading) return null
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={HOME_PINK_THEME.primary} />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    )
  }, [loading])

  const keyExtractor = useCallback((item: PostItem) => item.post_id, [])

  return (
    <View style={styles.container}>
      <FlashList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 84 + insets.bottom }
        ]}
        data={posts}
        ItemSeparatorComponent={renderSeparator}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[HOME_PINK_THEME.primary]}
            tintColor={HOME_PINK_THEME.primary}
            progressBackgroundColor={HOME_PINK_THEME.surface}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HOME_PINK_THEME.background
  },
  listContent: {
    paddingTop: 0
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: HOME_PINK_THEME.border
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HOME_PINK_THEME.text,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: HOME_PINK_THEME.textMuted
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  footerText: {
    marginTop: 6,
    fontSize: 12,
    color: HOME_PINK_THEME.textMuted
  }
})
