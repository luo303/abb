import React, { memo, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { PostItem } from '../../types/home'
import HomeCommunityCard from '../home/HomeCommunityCard'

// 简单的哈希函数
const getHashCode = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 转换为32位整数
  }
  return hash.toString()
}

interface SearchResultsProps {
  results: PostItem[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  hasMore,
  onLoadMore
}) => {
  const renderItem = useCallback(({ item }: { item: PostItem }) => {
    return <HomeCommunityCard data={item} />
  }, [])

  const renderFooter = useCallback(() => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#f43f5e" />
        <Text style={styles.footerText}>正在为您搜索相关内容...</Text>
      </View>
    )
  }, [loading])

  const renderEmpty = useCallback(() => {
    if (loading) return null
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>未搜索到对应帖子</Text>
        <Text style={styles.emptySubText}>试试其他关键词</Text>
      </View>
    )
  }, [loading])

  const keyExtractor = useCallback((item: PostItem) => {
    if (item.post_id) return `post-${item.post_id}`
    if (item.id) return `post-${item.id}`
    return `post-${getHashCode(JSON.stringify(item))}`
  }, [])

  const contentContainerStyle = useMemo(() => {
    return results.length === 0 ? styles.emptyContainer : styles.list
  }, [results.length])

  const handleEndReached = useCallback(() => {
    if (!hasMore) return
    onLoadMore()
  }, [hasMore, onLoadMore])

  return (
    <FlashList
      data={results}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={contentContainerStyle}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8
  },
  itemContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  itemTime: {
    fontSize: 12,
    color: '#999'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  footerText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#999'
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  emptySubText: {
    fontSize: 16,
    color: '#999'
  }
})

export default memo(SearchResults)
