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
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import { HOME_PINK_THEME } from '@/components/home/homePalette'
import { PostItem } from '@/types/home'
import { getMyDrafts } from '@/api/post'
import type { NavigationProps } from '@/types/navigation'
import type { PostMineListItem } from '@/types/post'

const PAGE_SIZE = 10

const mapItemToPost = (item: PostMineListItem): PostItem => ({
  ...item,
  cover: ''
})

export default function MyDrafts() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProps>()

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
        const res = await getMyDrafts(targetPage, PAGE_SIZE)
        const items = (res.data.items || []).map(mapItemToPost)

        setPosts(prev => (targetPage === 1 ? items : [...prev, ...items]))
        setPage(targetPage)
        setHasMore(res.data.has_more)
      } catch (error) {
        console.error('Failed to load my drafts:', error)
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

  const handlePressDraft = useCallback(
    (_postId: string, post: PostItem) => {
      navigation.navigate('EditDraft', {
        draft: post as unknown as PostMineListItem
      })
    },
    [navigation]
  )

  const renderItem = useCallback(
    ({ item }: { item: PostItem }) => {
      return (
        <HomeCommunityCard data={item} onPress={handlePressDraft} tone="pink" />
      )
    },
    [handlePressDraft]
  )

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  )

  const ListEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>暂无草稿</Text>
        <Text style={styles.emptySubtitle}>从首页点击 + 开始记录吧</Text>
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
          { paddingBottom: 24 + insets.bottom }
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
