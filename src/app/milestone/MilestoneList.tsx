import React, { useCallback, useState } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { PostItem } from '@/types/home'
import { getMyMilestones } from '@/api/post'
import { NavigationProps } from '@/types/navigation'
import TimelineNode from '@/components/common/TimelineNode'

const { width } = Dimensions.get('window')

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

// 大事记卡片组件
const MilestoneCard = ({ item }: { item: PostItem }) => {
  const parseContent = (content: any) => {
    if (!content) return { text: '', images: [], eventTime: null }

    // 如果是字符串，尝试解析 JSON
    if (typeof content === 'string') {
      try {
        // 如果是 JSON 字符串，解析为对象
        if (content.trim().startsWith('{')) {
          const parsed = JSON.parse(content)
          return {
            text: parsed.text || '',
            images: parsed.images || [],
            eventTime: parsed.event_time ? new Date(parsed.event_time) : null
          }
        }
        // 普通字符串直接作为文本
        return { text: content, images: [], eventTime: null }
      } catch (e) {
        return { text: content, images: [], eventTime: null }
      }
    }

    // 如果已经是对象
    if (typeof content === 'object') {
      return {
        text: content.text || '',
        images: Array.isArray(content.images) ? content.images : [],
        eventTime: content.event_time ? new Date(content.event_time) : null
      }
    }

    return { text: '', images: [], eventTime: null }
  }

  const {
    text: contentText,
    images,
    eventTime: parsedEventTime
  } = parseContent(item.content)

  // 优先使用解析出的 eventTime，如果为 null 则回退到 ctime
  const eventTime =
    parsedEventTime instanceof Date && !isNaN(parsedEventTime.getTime())
      ? parsedEventTime
      : item.ctime
        ? new Date(item.ctime)
        : new Date()

  const dateStr = `${eventTime.getFullYear()}.${(eventTime.getMonth() + 1)
    .toString()
    .padStart(2, '0')}.${eventTime.getDate().toString().padStart(2, '0')}`

  return (
    <View style={styles.cardContainer}>
      <TimelineNode />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.dateBadge}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={14}
              color="#fff"
            />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          {item.baby_age_text && (
            <Text style={styles.ageText}>{item.baby_age_text}</Text>
          )}
        </View>

        <Text style={styles.title}>{item.title || '无标题'}</Text>

        {contentText ? (
          <Text style={styles.content} numberOfLines={3}>
            {contentText}
          </Text>
        ) : null}

        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {images.map((img: string, index: number) => (
              <Image
                key={index}
                source={typeof img === 'string' ? { uri: img } : img}
                style={styles.image}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  )
}

const getEventTime = (item: PostItem): number => {
  if (item.content) {
    let parsed: any = item.content
    if (typeof item.content === 'string') {
      try {
        if (item.content.trim().startsWith('{')) {
          parsed = JSON.parse(item.content)
        }
      } catch (e) {}
    }
    if (
      typeof parsed === 'object' &&
      parsed.event_time &&
      !isNaN(new Date(parsed.event_time).getTime())
    ) {
      return new Date(parsed.event_time).getTime()
    }
  }
  return item.ctime || 0
}

export default function MilestoneList() {
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
        const res = (await getMyMilestones(
          targetPage,
          PAGE_SIZE,
          'ctime' // 后端排序策略，这里可能需要后端配合支持 event_time 排序，或者前端排
        )) as PostListResponse
        console.log('Milestones res:', res)

        const ok = res?.code === 0 || res?.code === 200
        const items = ok ? res.data?.items || [] : []

        setPosts(prev => {
          const allItems = targetPage === 1 ? items : [...prev, ...items]
          // 前端按 event_time 降序排序
          return allItems.sort((a, b) => getEventTime(b) - getEventTime(a))
        })

        setPage(targetPage)
        setHasMore(res.data?.has_more ?? false)
      } catch (error) {
        console.error('Failed to load milestones:', error)
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
      // 每次进入页面都刷新，确保看到最新添加的大事记
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
    <MilestoneCard item={item} />
  )

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Image
        source={require('../../assets/icon.png')} // 路径修正
        style={{ width: 80, height: 80, opacity: 0.3, marginBottom: 16 }}
      />
      <Text style={styles.emptyTitle}>暂无大事记</Text>
      <Text style={styles.emptySubtitle}>记录宝宝成长的每一个重要时刻</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('AddMilestone')}
      >
        <Text style={styles.emptyButtonText}>去记录</Text>
      </TouchableOpacity>
    </View>
  )

  const ListFooterComponent = () => {
    if (!loading) return <View style={{ height: 80 }} /> // 底部留白，避免被FAB遮挡
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#f43f5e" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fff1f2', '#fff']}
        style={StyleSheet.absoluteFill}
      />

      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 24 + insets.bottom }
        ]}
        data={posts}
        keyExtractor={(item, index) => item.post_id || `milestone-${index}`}
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

      {/* 悬浮添加按钮 */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 30 + insets.bottom }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddMilestone')}
      >
        <LinearGradient
          colors={['#f43f5e', '#fb7185']}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20
  },
  cardContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative'
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fff1f2'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f43f5e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  ageText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500'
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10
  },
  imageScroll: {
    marginTop: 4
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f5f5f5'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 100
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#f43f5e',
    borderRadius: 20,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  footerText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999'
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
