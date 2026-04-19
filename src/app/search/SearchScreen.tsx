import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Keyboard,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import AppKeyboardAvoidingView from '../../components/common/AppKeyboardAvoidingView'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NavigationProps } from '../../types/navigation'
import { useHomeSearch } from '../../hooks/useHomeSearch'
import {
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  removeSearchHistoryItem
} from '../../utils/searchStorage'
import SearchResults from '../../components/search/SearchResults'
import { useMessage } from '../../components/Message'
import SearchHeader from '../../components/search/SearchHeader'
import SearchSection from '../../components/search/SearchSection'
import SearchChip from '../../components/search/SearchChip'
import SearchSuggestionList from '../../components/search/SearchSuggestionList'
import SearchEmptyState from '../../components/search/SearchEmptyState'
import { APP_COLORS } from '../../theme/paperTheme'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchPostList } from '@/store/modules/PostStore'
import type { PostItem } from '@/types/home'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'

// 预设热门搜索关键词
const HOT_SEARCHES = [
  '宝宝睡眠',
  '婴儿喂养',
  '育儿知识',
  '成长发育',
  '疫苗接种'
]

// 页面状态枚举，替代多个 boolean 状态，避免状态组合爆炸
type ScreenState = 'idle' | 'typing' | 'loading' | 'results' | 'empty' | 'error'
type SearchSectionKind = 'recentResult' | 'suggestions' | 'history' | 'hot'

type SearchListSection = {
  title: string
  data: { key: string; kind: SearchSectionKind }[]
}

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProps>()
  const { showDialog } = useMessage()
  const dispatch = useAppDispatch()
  const [searchText, setSearchText] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [screenState, setScreenState] = useState<ScreenState>('idle')
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [hotSearches] = useState<string[]>(HOT_SEARCHES)
  const lastSubmittedQueryRef = useRef<string | null>(null)
  const requestTokenRef = useRef(0)

  const fallbackHotPosts = useAppSelector(state => state.post.hotPostList)
  const fallbackRandomPosts = useAppSelector(state => state.post.postList)
  const fallbackLocalPosts = useAppSelector(
    state => state.post.localPublishedPosts
  )
  const fallbackLoading = useAppSelector(state => state.post.loading)

  const {
    searchResults,
    searchHasMore,
    handleSearch,
    loadMoreSearchResults,
    searchLoading,
    searchError
  } = useHomeSearch()

  // 加载搜索历史
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getSearchHistory()
      setSearchHistory(history)
    }
    loadHistory()
  }, [])

  // 生成模糊搜索建议
  const generateSuggestions = useCallback(
    (text: string) => {
      const allPossibleSuggestions = [...searchHistory, ...HOT_SEARCHES]
      const uniqueSuggestions = [...new Set(allPossibleSuggestions)]
      return uniqueSuggestions
        .filter(item => item.toLowerCase().includes(text.toLowerCase()))
        .slice(0, 5)
    },
    [searchHistory]
  )

  useEffect(() => {
    if (screenState !== 'typing') {
      setSearchSuggestions([])
      return
    }

    if (!searchText.trim()) {
      setSearchSuggestions([])
      return
    }

    const suggestions = generateSuggestions(searchText)
    setSearchSuggestions(suggestions)
  }, [generateSuggestions, screenState, searchText])

  // 执行搜索的核心方法，所有入口统一调用此方法
  const performSearch = useCallback(
    async (text: string) => {
      const keyword = text.trim()
      if (!keyword) return

      const requestToken = requestTokenRef.current + 1
      requestTokenRef.current = requestToken
      lastSubmittedQueryRef.current = keyword
      setScreenState('loading')
      Keyboard.dismiss()

      const outcome = await handleSearch(keyword)
      if (requestTokenRef.current !== requestToken) return

      if (outcome.status === 'redirect') {
        return
      }

      if (outcome.status === 'error') {
        setScreenState('error')
        return
      }

      setSearchText(keyword)
      await saveSearchHistory(keyword)
      const updatedHistory = await getSearchHistory()
      setSearchHistory(updatedHistory)

      if (outcome.status === 'success') {
        setScreenState(outcome.count > 0 ? 'results' : 'empty')
        return
      }
    },
    [handleSearch]
  )

  // 处理键盘搜索按钮提交
  const handleSubmit = useCallback(() => {
    if (searchText.trim()) {
      performSearch(searchText)
    }
  }, [searchText, performSearch])

  // 处理历史记录点击
  const handleHistoryPress = useCallback(
    (keyword: string) => {
      performSearch(keyword)
    },
    [performSearch]
  )

  // 处理热门搜索点击
  const handleHotSearchPress = useCallback(
    (keyword: string) => {
      performSearch(keyword)
    },
    [performSearch]
  )

  const handleGoHot = useCallback(() => {
    const fallbackKeyword = hotSearches[0]
    if (fallbackKeyword) {
      performSearch(fallbackKeyword)
      return
    }
    setScreenState('idle')
  }, [hotSearches, performSearch])

  // 处理搜索建议点击
  const handleSuggestionPress = useCallback(
    (keyword: string) => {
      performSearch(keyword)
    },
    [performSearch]
  )

  // 处理清空历史
  const handleClearHistory = useCallback(() => {
    showDialog(
      '确认清除',
      '确定要清除所有搜索历史吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          onPress: () => {
            void (async () => {
              await clearSearchHistory()
              setSearchHistory([])
            })()
          }
        }
      ],
      { cancelable: true }
    )
  }, [showDialog])

  // 处理删除单个历史记录
  const handleRemoveHistoryItem = useCallback(async (keyword: string) => {
    await removeSearchHistoryItem(keyword)
    const updatedHistory = await getSearchHistory()
    setSearchHistory(updatedHistory)
  }, [])

  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true)
    requestTokenRef.current += 1

    if (searchText.trim()) {
      setScreenState('typing')
    } else {
      setScreenState('idle')
    }
  }, [searchText])

  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false)

    if (screenState !== 'typing') return

    const lastQuery = lastSubmittedQueryRef.current
    if (lastQuery && searchText.trim() === lastQuery) {
      setScreenState(searchResults.length > 0 ? 'results' : 'empty')
      return
    }

    setScreenState('idle')
  }, [screenState, searchResults.length, searchText])

  const handleChangeText = useCallback(
    (text: string) => {
      setSearchText(text)
      requestTokenRef.current += 1

      const trimmed = text.trim()
      if (!trimmed) {
        setScreenState('idle')
        return
      }

      if (isInputFocused) {
        setScreenState('typing')
      }
    },
    [isInputFocused]
  )

  const handleClearInput = useCallback(() => {
    requestTokenRef.current += 1
    setSearchText('')
    setScreenState('idle')
    setSearchSuggestions([])
  }, [])

  const activeKeyword = lastSubmittedQueryRef.current || searchText.trim()

  const fallbackPosts: PostItem[] = (() => {
    const merged = [
      ...fallbackLocalPosts,
      ...fallbackHotPosts,
      ...fallbackRandomPosts
    ]
    const seen = new Set<string>()
    const unique: PostItem[] = []
    for (const item of merged) {
      const id = item.post_id || item.id
      if (!id) continue
      if (seen.has(id)) continue
      seen.add(id)
      unique.push(item)
      if (unique.length >= 10) break
    }
    return unique
  })()

  useEffect(() => {
    if (screenState !== 'empty') return
    if (fallbackPosts.length > 0) return
    if (fallbackLoading) return

    void dispatch(
      fetchPostList({ page: 1, pageSize: 10, strategy: 'hot', force: true })
    )
    void dispatch(
      fetchPostList({ page: 1, pageSize: 10, strategy: 'random', force: true })
    )
  }, [dispatch, fallbackLoading, fallbackPosts.length, screenState])

  const renderHistorySection = useCallback(
    () =>
      searchHistory.length > 0 ? (
        <SearchSection
          title="最近搜索"
          rightAction={
            <TouchableOpacity
              activeOpacity={0.8}
              hitSlop={8}
              onPress={handleClearHistory}
              style={styles.sectionActionButton}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={APP_COLORS.textMuted}
              />
            </TouchableOpacity>
          }
        >
          <View style={styles.chipWrap}>
            {searchHistory.map(item => (
              <SearchChip
                iconName="time-outline"
                key={item}
                label={item}
                onPress={() => handleHistoryPress(item)}
                onRemove={() => {
                  void handleRemoveHistoryItem(item)
                }}
              />
            ))}
          </View>
        </SearchSection>
      ) : null,
    [
      handleClearHistory,
      handleHistoryPress,
      handleRemoveHistoryItem,
      searchHistory
    ]
  )

  const renderHotSection = useCallback(
    () => (
      <SearchSection title="热门搜索">
        <View style={styles.chipWrap}>
          {hotSearches.map(item => (
            <SearchChip
              highlighted
              iconName="flame-outline"
              key={item}
              label={item}
              onPress={() => handleHotSearchPress(item)}
            />
          ))}
        </View>
      </SearchSection>
    ),
    [handleHotSearchPress, hotSearches]
  )

  const renderContent = () => {
    const renderListSectionItem = ({
      item
    }: {
      item: { key: string; kind: SearchSectionKind }
    }) => {
      if (item.kind === 'recentResult') {
        const lastKeyword = lastSubmittedQueryRef.current
        if (!lastKeyword) return null

        return (
          <SearchSection title="最近一次搜索">
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => handleHistoryPress(lastKeyword)}
              style={styles.recentResultButton}
            >
              <Ionicons
                color={APP_COLORS.primaryStrong}
                name="time-outline"
                size={16}
              />
              <Text style={styles.recentResultText}>
                返回“{lastKeyword}”结果
              </Text>
            </TouchableOpacity>
          </SearchSection>
        )
      }

      if (item.kind === 'suggestions') {
        return (
          <SearchSection title="搜索建议">
            <SearchSuggestionList
              onSubmit={handleSubmit}
              onSuggestionPress={handleSuggestionPress}
              query={searchText}
              suggestions={searchSuggestions}
            />
          </SearchSection>
        )
      }

      if (item.kind === 'history') {
        return renderHistorySection()
      }

      return renderHotSection()
    }

    const typingSections: SearchListSection[] = [
      ...(lastSubmittedQueryRef.current &&
      lastSubmittedQueryRef.current !== searchText.trim()
        ? [
            {
              title: 'recentResult',
              data: [{ key: 'recent-result', kind: 'recentResult' as const }]
            }
          ]
        : []),
      {
        title: 'suggestions',
        data: [{ key: 'suggestions', kind: 'suggestions' }]
      },
      {
        title: 'history',
        data: [{ key: 'history', kind: 'history' }]
      },
      {
        title: 'hot',
        data: [{ key: 'hot', kind: 'hot' }]
      }
    ]

    const idleSections: SearchListSection[] = [
      {
        title: 'history',
        data: [{ key: 'history', kind: 'history' }]
      },
      {
        title: 'hot',
        data: [{ key: 'hot', kind: 'hot' }]
      }
    ]

    switch (screenState) {
      case 'typing':
        return (
          <SectionList
            contentContainerStyle={styles.listContainer}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            renderItem={renderListSectionItem}
            sections={typingSections}
            showsVerticalScrollIndicator={false}
            style={styles.searchSuggestions}
            stickySectionHeadersEnabled={false}
          />
        )

      case 'loading':
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={APP_COLORS.primary} />
            <Text style={styles.loadingText}>正在搜索...</Text>
          </View>
        )

      case 'results':
        return (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsToolbar}>
              <Text style={styles.resultsToolbarText}>
                “{activeKeyword || '当前关键词'}” · {searchResults.length}{' '}
                条结果
              </Text>
              <TouchableOpacity
                activeOpacity={0.82}
                style={styles.filterButton}
              >
                <Ionicons
                  name="funnel-outline"
                  size={14}
                  color={APP_COLORS.textMuted}
                />
                <Text style={styles.filterButtonText}>按时间</Text>
              </TouchableOpacity>
            </View>
            <SearchResults
              results={searchResults}
              loadingMore={searchLoading}
              hasMore={searchHasMore}
              onLoadMore={loadMoreSearchResults}
            />
          </View>
        )

      case 'empty':
        if (fallbackPosts.length > 0) {
          return (
            <FlashList
              data={fallbackPosts}
              keyExtractor={item => String(item.post_id || item.id)}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              ListHeaderComponent={
                <View style={styles.emptyHeader}>
                  <SearchEmptyState
                    mode="empty"
                    onGoHot={handleGoHot}
                    onReset={handleClearInput}
                    subtitle="暂无匹配内容，为你推荐一些热门帖子"
                    variant="compact"
                  />
                  <Text style={styles.fallbackTitle}>猜你想看</Text>
                </View>
              }
              renderItem={({ item }) => (
                <HomeCommunityCard data={item} tone="pink" />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )
        }

        return (
          <SearchEmptyState
            mode="empty"
            onGoHot={handleGoHot}
            onReset={handleClearInput}
          />
        )

      case 'error':
        return (
          <SearchEmptyState
            mode="error"
            onRetry={handleSubmit}
            subtitle={searchError || '请稍后再试'}
          />
        )

      case 'idle':
      default:
        return (
          <SectionList
            contentContainerStyle={styles.listContainer}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            renderItem={renderListSectionItem}
            sections={idleSections}
            showsVerticalScrollIndicator={false}
            style={styles.searchSuggestions}
            stickySectionHeadersEnabled={false}
          />
        )
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppKeyboardAvoidingView style={styles.keyboardAvoid}>
        <SearchHeader
          onBlur={handleInputBlur}
          onCancel={() => navigation.goBack()}
          onChangeText={handleChangeText}
          onClear={handleClearInput}
          onFocus={handleInputFocus}
          onSubmit={handleSubmit}
          value={searchText}
        />

        {/* 主内容区域 */}
        {renderContent()}
      </AppKeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  },
  keyboardAvoid: {
    flex: 1
  },
  searchSuggestions: {
    flex: 1
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20
  },
  emptyHeader: {
    paddingTop: 4
  },
  fallbackTitle: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.text
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 16,
    color: APP_COLORS.textMuted,
    marginTop: 12
  },
  resultsContainer: {
    flex: 1
  },
  resultsToolbar: {
    minHeight: 40,
    marginHorizontal: 16,
    marginBottom: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    backgroundColor: APP_COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resultsToolbarText: {
    fontSize: 13,
    color: APP_COLORS.textMuted
  },
  filterButton: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: APP_COLORS.surfaceVariant
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: APP_COLORS.textMuted
  },
  sectionActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recentResultButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    backgroundColor: APP_COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12
  },
  recentResultText: {
    marginLeft: 8,
    fontSize: 14,
    color: APP_COLORS.text
  }
})

export default SearchScreen
