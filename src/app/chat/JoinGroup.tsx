import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { v4 as uuidv4 } from 'uuid'

import {
  ChatGroupDiscoverDto,
  fetchDiscoverGroups,
  searchDiscoverGroups
} from '@/api/messenger'
import ChatAvatar from '@/components/chat/ChatAvatar'
import { useMessage } from '@/components/Message'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { joinGroupConversation } from '@/store/modules/MessengerStore'
import { NavigationProps } from '@/types/navigation'

const DISCOVER_PAGE_SIZE = 20
const SEARCH_PAGE_SIZE = 50
const SEARCH_DEBOUNCE_MS = 300

export default function JoinGroup() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { showMessage } = useMessage()
  const myGroups = useAppSelector(state => state.messenger.groups.items)

  const [keyword, setKeyword] = useState('')
  const [discoverItems, setDiscoverItems] = useState<ChatGroupDiscoverDto[]>([])
  const [searchItems, setSearchItems] = useState<ChatGroupDiscoverDto[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [discoverError, setDiscoverError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const discoverSeedRef = useRef(uuidv4())
  const searchRequestIdRef = useRef(0)
  const hasRequestedInitialDiscoverRef = useRef(false)

  const normalizedKeyword = keyword.trim()
  const isSearchMode = normalizedKeyword.length > 0

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '加入群聊',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#FFFFFF'
      },
      headerTintColor: '#111111'
    })
  }, [navigation])

  const joinedGroupIds = useMemo(() => {
    return new Set(myGroups.map(item => item.groupId))
  }, [myGroups])

  const loadDiscoverGroups = useCallback(
    async ({
      refresh = false,
      loadMore = false
    }: {
      refresh?: boolean
      loadMore?: boolean
    } = {}) => {
      if (loadMore) {
        if (
          loadingMore ||
          discoverLoading ||
          refreshing ||
          !hasMore ||
          !nextCursor
        ) {
          return
        }
        setLoadingMore(true)
      } else if (refresh) {
        if (refreshing) return
        setDiscoverError(null)
        setRefreshing(true)
        discoverSeedRef.current = uuidv4()
      } else {
        setDiscoverError(null)
        setDiscoverLoading(true)
      }

      try {
        const res = await fetchDiscoverGroups({
          seed: discoverSeedRef.current,
          limit: DISCOVER_PAGE_SIZE,
          next_cursor: loadMore ? nextCursor || undefined : undefined
        })
        const items = res?.data?.items || []

        setDiscoverError(null)
        setDiscoverItems(prev => {
          if (!loadMore) return items

          return [...prev, ...items].filter(
            (item, index, array) =>
              array.findIndex(group => group.group_id === item.group_id) ===
              index
          )
        })
        setHasMore(Boolean(res?.data?.has_more))
        setNextCursor(res?.data?.next_cursor || null)
      } catch (error: any) {
        const fallbackMessage =
          error?.response?.data?.message || error?.message || '获取群聊列表失败'
        if (loadMore || discoverItems.length > 0) {
          showMessage(fallbackMessage)
        } else {
          setDiscoverError(fallbackMessage)
        }
      } finally {
        if (loadMore) {
          setLoadingMore(false)
        } else if (refresh) {
          setRefreshing(false)
          setDiscoverLoading(false)
        } else {
          setDiscoverLoading(false)
        }
      }
    },
    [
      discoverLoading,
      discoverItems.length,
      hasMore,
      loadingMore,
      nextCursor,
      refreshing,
      showMessage
    ]
  )

  useEffect(() => {
    if (hasRequestedInitialDiscoverRef.current) return
    hasRequestedInitialDiscoverRef.current = true
    void loadDiscoverGroups()
  }, [loadDiscoverGroups])

  const runSearchGroups = useCallback(async (nextKeyword: string) => {
    const requestId = searchRequestIdRef.current + 1
    searchRequestIdRef.current = requestId
    setSearchError(null)
    setSearchLoading(true)

    try {
      const res = await searchDiscoverGroups(nextKeyword, SEARCH_PAGE_SIZE)
      if (searchRequestIdRef.current !== requestId) return
      setSearchError(null)
      setSearchItems(res?.data?.items || [])
    } catch (error: any) {
      if (searchRequestIdRef.current !== requestId) return
      const fallbackMessage =
        error?.response?.data?.message || error?.message || '搜索群聊失败'
      setSearchError(fallbackMessage)
      setSearchItems([])
    } finally {
      if (searchRequestIdRef.current === requestId) {
        setSearchLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!normalizedKeyword) {
      searchRequestIdRef.current += 1
      setSearchError(null)
      setSearchItems([])
      setSearchLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      await runSearchGroups(normalizedKeyword)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
    }
  }, [normalizedKeyword, runSearchGroups])

  const handleJoin = useCallback(
    async (group: ChatGroupDiscoverDto) => {
      if (joiningId) return

      if (joinedGroupIds.has(group.group_id)) {
        navigation.navigate('ChatDetail', {
          conversationType: 'group',
          groupId: group.group_id
        })
        return
      }

      try {
        setJoiningId(group.group_id)
        await dispatch(joinGroupConversation(group.group_id))
        navigation.replace('ChatDetail', {
          conversationType: 'group',
          groupId: group.group_id
        })
      } catch (error: any) {
        const fallbackMessage =
          error?.response?.data?.message || error?.message || '加入群聊失败'
        showMessage(fallbackMessage)
      } finally {
        setJoiningId(null)
      }
    },
    [dispatch, joinedGroupIds, joiningId, navigation, showMessage]
  )

  const data = isSearchMode ? searchItems : discoverItems
  const isInitialLoading = isSearchMode ? searchLoading : discoverLoading

  const renderHeader = useMemo(() => {
    return (
      <View style={styles.headerContent}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#8C8C8C" />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            onChangeText={setKeyword}
            placeholder="搜索群聊名称"
            placeholderTextColor="#A0A0A0"
            style={styles.searchInput}
            value={keyword}
          />
        </View>
        {!isSearchMode ? (
          <Text style={styles.helperText}>为你发现可加入的群聊</Text>
        ) : (
          <Text style={styles.helperText}>输入关键词搜索群聊</Text>
        )}
      </View>
    )
  }, [isSearchMode, keyword])

  const renderItem = useCallback(
    ({ item }: { item: ChatGroupDiscoverDto }) => {
      const joined = joinedGroupIds.has(item.group_id)
      const joining = joiningId === item.group_id

      return (
        <View style={styles.groupCard}>
          <ChatAvatar
            uri={item.avatar}
            label={item.name}
            size={54}
            shape="roundedSquare"
          />
          <View style={styles.groupContent}>
            <Text numberOfLines={1} style={styles.groupName}>
              {item.name}
            </Text>
            <Text style={styles.groupMeta}>
              {item.member_count}/{item.member_limit} 人
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={joining}
            onPress={() => handleJoin(item)}
            style={[
              styles.actionButton,
              joined ? styles.enterButton : styles.joinButton,
              joining && styles.actionButtonDisabled
            ]}
          >
            {joining ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>
                {joined ? '进入' : '加入'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )
    },
    [handleJoin, joinedGroupIds, joiningId]
  )

  const renderEmpty = useCallback(() => {
    if (isInitialLoading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator color="#FF6B8A" />
        </View>
      )
    }

    const activeError = isSearchMode ? searchError : discoverError
    if (activeError) {
      return (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>加载失败</Text>
          <Text style={styles.emptyText}>{activeError}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              if (isSearchMode) {
                void runSearchGroups(normalizedKeyword)
                return
              }

              discoverSeedRef.current = uuidv4()
              void loadDiscoverGroups()
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>
          {isSearchMode ? '没有找到匹配的群聊' : '暂时没有可发现的群聊'}
        </Text>
        <Text style={styles.emptyText}>
          {isSearchMode ? '换个关键词再试试。' : '下拉刷新后再看看。'}
        </Text>
      </View>
    )
  }, [
    discoverError,
    isInitialLoading,
    isSearchMode,
    loadDiscoverGroups,
    normalizedKeyword,
    runSearchGroups,
    searchError
  ])

  const handleRefresh = useCallback(() => {
    if (isSearchMode) {
      void runSearchGroups(normalizedKeyword)
      return
    }

    loadDiscoverGroups({ refresh: true })
  }, [isSearchMode, loadDiscoverGroups, normalizedKeyword, runSearchGroups])

  const handleEndReached = useCallback(() => {
    if (isSearchMode) return
    loadDiscoverGroups({ loadMore: true })
  }, [isSearchMode, loadDiscoverGroups])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={data}
        keyExtractor={item => item.group_id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          !isSearchMode && loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color="#FF6B8A" />
            </View>
          ) : null
        }
        ListHeaderComponent={renderHeader}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.25}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#999999"
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  headerContent: {
    paddingTop: 12,
    paddingBottom: 16
  },
  searchWrap: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111111'
  },
  helperText: {
    marginTop: 10,
    fontSize: 12,
    color: '#6B7280'
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB'
  },
  groupContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111111'
  },
  groupMeta: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280'
  },
  actionButton: {
    minWidth: 68,
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  joinButton: {
    backgroundColor: '#FF6B8A'
  },
  enterButton: {
    backgroundColor: '#3B82F6'
  },
  actionButtonDisabled: {
    opacity: 0.7
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 72,
    paddingBottom: 36
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151'
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#9CA3AF'
  },
  retryButton: {
    marginTop: 14,
    minWidth: 88,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 18,
    backgroundColor: '#FF6B8A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  retryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  footerLoading: {
    paddingVertical: 16
  }
})
