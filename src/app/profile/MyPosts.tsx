import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons'

import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import { HOME_PINK_THEME } from '@/components/home/homePalette'
import { PostItem } from '@/types/home'
import { deletePost, getMyPosts } from '@/api/post'
import type { PostMineListItem } from '@/types/post'
import { useMessage } from '@/components/Message'

const PAGE_SIZE = 10

export default function MyPosts() {
  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()
  const [posts, setPosts] = useState<PostItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

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
        const res = await getMyPosts(targetPage, PAGE_SIZE, 'ctime')

        const mapItem = (item: PostMineListItem): PostItem => ({
          ...item,
          cover: ''
        })

        const items = (res.data?.items || []).map(mapItem)

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

  const doDeletePost = useCallback(
    async (postId: string) => {
      if (deletingPostId) return
      setDeletingPostId(postId)
      try {
        await deletePost(postId)
        setPosts(prev => prev.filter(p => p.post_id !== postId))
        showMessage('已删除')
      } catch (error) {
        console.error(error)
        const message = error instanceof Error ? error.message : '删除失败'
        if (message.includes('不存在') || message.includes('已删除')) {
          setPosts(prev => prev.filter(p => p.post_id !== postId))
          showMessage('帖子不存在或已删除')
          return
        }
        Alert.alert('提示', message)
      } finally {
        setDeletingPostId(null)
      }
    },
    [deletingPostId, showMessage]
  )

  const handleDeletePost = useCallback(
    (postId: string) => {
      if (deletingPostId) return
      Alert.alert('确认删除', '确定要删除这条帖子吗？', [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => void doDeletePost(postId)
        }
      ])
    },
    [deletingPostId, doDeletePost]
  )

  const renderItem = useCallback(
    ({ item }: { item: PostItem }) => {
      const isDeleting = deletingPostId === item.post_id

      return (
        <HomeCommunityCard
          data={item}
          tone="pink"
          rightAccessory={
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!!deletingPostId}
              onPress={() => handleDeletePost(item.post_id)}
              style={[
                styles.deleteButton,
                isDeleting && styles.deleteButtonDisabled
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size={14} color="#ef4444" />
              ) : (
                <AntDesign name="delete" size={16} color="#ef4444" />
              )}
            </TouchableOpacity>
          }
        />
      )
    },
    [deletingPostId, handleDeletePost]
  )

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  )

  const ListEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>暂无帖子</Text>
        <Text style={styles.emptySubtitle}>去发布你的第一条记录吧</Text>
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
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff'
  },
  deleteButtonDisabled: {
    opacity: 0.65
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
