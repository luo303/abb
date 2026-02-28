import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import { PostItem } from '@/types/home'
import { getMyPosts } from '@/api/post'

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

export default function MyPosts() {
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
        const res = (await getMyPosts(
          targetPage,
          PAGE_SIZE,
          'ctime'
        )) as PostListResponse
        console.log(res)

        const ok = res?.code === 0 || res?.code === 200
        const items = ok ? res.data?.items || [] : []
        setPosts(prev => (targetPage === 1 ? items : [...prev, ...items]))
        setPage(targetPage)
        setHasMore(res.data?.has_more ?? false)
      } catch (error) {
        console.error('Failed to load my posts:', error)
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

  const handleRefresh = () => fetchPage(1, true)

  const handleLoadMore = () => {
    if (!initialLoaded) return
    if (loading || refreshing) return
    if (hasMore) {
      fetchPage(page + 1)
    }
  }

  const renderItem = ({ item }: { item: PostItem }) => (
    <View style={styles.cardWrapper}>
      <HomeCommunityCard data={item} />
    </View>
  )

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>暂无帖子</Text>
      <Text style={styles.emptySubtitle}>去发布你的第一条记录吧</Text>
    </View>
  )

  const ListFooterComponent = () => {
    if (!loading) return null
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#f43f5e" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 + insets.bottom }
        ]}
        data={posts}
        keyExtractor={(item, index) => item.post_id || `post-${index}`}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#f43f5e']}
            tintColor="#f43f5e"
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  cardWrapper: {
    marginBottom: 12
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999'
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  footerText: {
    marginTop: 6,
    fontSize: 12,
    color: '#999'
  }
})
