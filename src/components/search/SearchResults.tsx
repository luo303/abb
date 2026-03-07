import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { PostItem } from '../../types/home'
import HomeCommunityCard from '../home/HomeCommunityCard'

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
  const renderItem = ({ item }: { item: PostItem }) => (
    <HomeCommunityCard data={item} />
  )

  const renderFooter = () => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#f43f5e" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    )
  }

  const renderEmpty = () => {
    if (loading) return null
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>未搜索到对应帖子</Text>
        <Text style={styles.emptySubText}>试试其他关键词</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={results}
      renderItem={renderItem}
      keyExtractor={item => item.post_id || item.id || `post-${Math.random()}`}
      contentContainerStyle={
        results.length === 0 ? styles.emptyContainer : styles.list
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={hasMore ? onLoadMore : null}
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

export default SearchResults
