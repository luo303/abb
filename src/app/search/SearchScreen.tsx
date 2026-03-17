import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { NavigationProps } from '../../types/navigation'
import { useHomeSearch } from '../../hooks/useHomeSearch'
import {
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  removeSearchHistoryItem
} from '../../utils/searchStorage'
import SearchHistory from '../../components/search/SearchHistory'
import HotSearches from '../../components/search/HotSearches'
import SearchResults from '../../components/search/SearchResults'

// 预设热门搜索关键词
const HOT_SEARCHES = [
  '宝宝睡眠',
  '婴儿喂养',
  '育儿知识',
  '成长发育',
  '疫苗接种'
]

// 页面状态枚举，替代多个 boolean 状态，避免状态组合爆炸
type ScreenState = 'idle' | 'loading' | 'results' | 'empty'

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProps>()
  const insets = useSafeAreaInsets()
  const [searchText, setSearchText] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [screenState, setScreenState] = useState<ScreenState>('idle')
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false)

  // 用 ref 追踪"正在执行搜索"，阻止建议 useEffect 在搜索期间触发
  const isPerformingSearch = useRef(false)

  const {
    searchResults,
    searchHasMore,
    handleSearch,
    loadMoreSearchResults,
    searchLoading
  } = useHomeSearch()

  // 加载搜索历史
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getSearchHistory()
      setSearchHistory(history)
    }
    loadHistory()
  }, [])

  // 实时生成搜索建议（isPerformingSearch 为 true 时跳过，防止闪烁）
  useEffect(() => {
    if (isPerformingSearch.current) return

    if (searchText.trim()) {
      const suggestions = generateSuggestions(searchText)
      setSearchSuggestions(suggestions)
      setIsSuggestionsVisible(true)
    } else {
      setSearchSuggestions([])
      setIsSuggestionsVisible(false)
    }
  }, [searchText, searchHistory])

  // 生成模糊搜索建议
  const generateSuggestions = (text: string) => {
    const allPossibleSuggestions = [...searchHistory, ...HOT_SEARCHES]
    const uniqueSuggestions = [...new Set(allPossibleSuggestions)]
    return uniqueSuggestions
      .filter(item => item.toLowerCase().includes(text.toLowerCase()))
      .slice(0, 5)
  }

  // 执行搜索的核心方法，所有入口统一调用此方法
  const performSearch = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      // 1. 加锁，切到 loading 页面
      isPerformingSearch.current = true
      setIsSuggestionsVisible(false)
      setScreenState('loading')
      Keyboard.dismiss()

      // 2. 执行搜索
      await handleSearch(text)

      // 3. 更新输入框文字和历史记录
      //    此时 isPerformingSearch 仍为 true，setSearchText/setSearchHistory
      //    不会触发建议 useEffect 显示建议列表
      setSearchText(text)
      await saveSearchHistory(text)
      const updatedHistory = await getSearchHistory()
      setSearchHistory(updatedHistory)

      // 4. 解锁，并根据结果切换页面
      //    注意：handleSearch 内部用 setState 更新 searchResults，
      //    React 的批量更新机制保证此处拿到的是最新值需要用回调形式
      //    所以通过 useHomeSearch 返回的 searchResults ref 或直接在
      //    handleSearch resolve 后判断结果数量
      //    这里改为让 useHomeSearch 返回结果数量，或用一个临时变量
      isPerformingSearch.current = false
    },
    [handleSearch]
  )

  // 监听 searchResults 变化，切换到对应页面
  // 这样可以解耦"搜索完成"和"结果渲染"，避免时序问题
  useEffect(() => {
    if (screenState !== 'idle' && !searchLoading) {
      setScreenState(searchResults.length > 0 ? 'results' : 'empty')
    }
  }, [searchResults, screenState, searchLoading])

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

  // 处理搜索建议点击
  const handleSuggestionPress = useCallback(
    (keyword: string) => {
      performSearch(keyword)
    },
    [performSearch]
  )

  // 处理清空历史
  const handleClearHistory = useCallback(() => {
    Alert.alert(
      '确认清除',
      '确定要清除所有搜索历史吗？',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: async () => {
            await clearSearchHistory()
            setSearchHistory([])
          }
        }
      ],
      { cancelable: true }
    )
  }, [])

  // 处理删除单个历史记录
  const handleRemoveHistoryItem = useCallback(async (keyword: string) => {
    await removeSearchHistoryItem(keyword)
    const updatedHistory = await getSearchHistory()
    setSearchHistory(updatedHistory)
  }, [])

  // 重置搜索状态（回到初始页）
  const resetSearch = useCallback(() => {
    isPerformingSearch.current = false
    setScreenState('idle')
    setSearchText('')
    setIsSuggestionsVisible(false)
    setSearchSuggestions([])
  }, [])

  // 渲染主内容区域
  const renderContent = () => {
    // 搜索建议只在 idle 状态下显示，避免覆盖搜索结果
    if (
      screenState === 'idle' &&
      isSuggestionsVisible &&
      searchSuggestions.length > 0
    ) {
      return (
        <ScrollView style={styles.searchSuggestions}>
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>搜索建议</Text>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Ionicons name="search" size={16} color="#f43f5e" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )
    }

    switch (screenState) {
      case 'loading':
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#f43f5e" />
            <Text style={styles.loadingText}>正在搜索...</Text>
          </View>
        )

      case 'results':
        return (
          <SearchResults
            results={searchResults}
            loading={false}
            hasMore={searchHasMore}
            onLoadMore={loadMoreSearchResults}
          />
        )

      case 'empty':
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="search-outline" size={64} color="#fda4af" />
            <Text style={styles.emptyText}>未搜索到对应帖子</Text>
            <Text style={styles.emptySubText}>换个关键词试试吧</Text>
          </View>
        )

      case 'idle':
      default:
        return (
          <ScrollView style={styles.searchSuggestions}>
            <SearchHistory
              history={searchHistory}
              onHistoryPress={handleHistoryPress}
              onClearHistory={handleClearHistory}
              onRemoveItem={handleRemoveHistoryItem}
            />
            <HotSearches
              hotSearches={HOT_SEARCHES}
              onHotSearchPress={handleHotSearchPress}
            />
          </ScrollView>
        )
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 顶部背景装饰 */}
        <View
          style={[
            styles.headerBackgroundContainer,
            { height: 200 + insets.top, backgroundColor: '#ffe4e6' }
          ]}
        />

        {/* 搜索头部 */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 10 : 10 }]}>
          <TouchableOpacity
            style={styles.searchBox}
            activeOpacity={1}
            onPress={resetSearch}
          >
            <LinearGradient
              colors={['#ff9a9e', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.searchIconContainer}
            >
              <Ionicons name="search" size={24} color="#fff" />
            </LinearGradient>
            <TextInput
              style={styles.input}
              placeholder="搜索您感兴趣的内容..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSubmit}
              onFocus={resetSearch}
              autoFocus
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
            <LinearGradient
              colors={['#ff9a9e', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.searchButton}
            >
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.searchButtonInner}
              >
                <Text style={styles.searchButtonText}>搜索</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        </View>

        {/* 主内容区域 */}
        {renderContent()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffe4e6'
  },
  keyboardAvoid: {
    flex: 1
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  headerGradient: {
    width: '100%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    elevation: 0,
    gap: 12,
    zIndex: 1
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 0,
    height: 44,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fff1f2',
    paddingRight: 0,
    overflow: 'hidden'
  },
  searchIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 0
  },
  input: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    fontSize: 14,
    color: '#333'
  },
  clearButton: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButton: {
    height: '100%',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButtonInner: {
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#f43f5e'
  },
  searchSuggestions: {
    flex: 1,
    padding: 16
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 16,
    color: '#f43f5e',
    marginTop: 12
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8
  },
  emptySubText: {
    fontSize: 14,
    color: '#999'
  },
  suggestionsContainer: {
    paddingVertical: 8
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333'
  }
})

export default SearchScreen
