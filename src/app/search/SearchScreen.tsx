import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
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

const SearchScreen = () => {
  const navigation = useNavigation<NavigationProps>()
  const insets = useSafeAreaInsets()
  const [searchText, setSearchText] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false)

  // 复用现有的搜索逻辑
  const {
    searchLoading,
    searchResults,
    searchHasMore,
    handleSearch,
    loadMoreSearchResults
  } = useHomeSearch()

  // 加载搜索历史
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getSearchHistory()
      setSearchHistory(history)
    }
    loadHistory()
  }, [])

  // 搜索防抖和模糊搜索
  useEffect(() => {
    // 实时显示搜索建议，无延迟
    if (searchText.trim()) {
      // 生成模糊搜索建议
      const suggestions = generateSuggestions(searchText)
      setSearchSuggestions(suggestions)
      setIsSuggestionsVisible(true)
    } else {
      // 清空输入时隐藏建议
      setSearchSuggestions([])
      setIsSuggestionsVisible(false)
    }
  }, [searchText, searchHistory])

  // 搜索防抖
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchText.trim() && isSearching) {
        performSearch(searchText)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchText, isSearching])

  // 生成模糊搜索建议
  const generateSuggestions = (text: string) => {
    const allPossibleSuggestions = [...searchHistory, ...HOT_SEARCHES]
    const uniqueSuggestions = [...new Set(allPossibleSuggestions)]

    return uniqueSuggestions
      .filter(item => item.toLowerCase().includes(text.toLowerCase()))
      .slice(0, 5) // 最多显示5个建议
  }

  // 执行搜索
  const performSearch = async (text: string) => {
    if (text.trim()) {
      setHasSearched(true)
      setIsSuggestionsVisible(false) // 搜索时隐藏建议
      await handleSearch(text)
      await saveSearchHistory(text)
      // 更新搜索历史
      const updatedHistory = await getSearchHistory()
      setSearchHistory(updatedHistory)
      Keyboard.dismiss()
    }
  }

  // 处理搜索提交
  const handleSubmit = () => {
    setIsSearching(true)
  }

  // 处理历史记录点击
  const handleHistoryPress = (keyword: string) => {
    setSearchText(keyword)
    setIsSearching(true)
  }

  // 处理热门搜索点击
  const handleHotSearchPress = (keyword: string) => {
    setSearchText(keyword)
    setIsSearching(true)
  }

  // 处理搜索建议点击
  const handleSuggestionPress = (keyword: string) => {
    setSearchText(keyword)
    setIsSuggestionsVisible(false) // 点击建议后立即隐藏建议列表
    setIsSearching(true)
  }

  // 处理清空历史
  const handleClearHistory = async () => {
    await clearSearchHistory()
    setSearchHistory([])
  }

  // 处理删除单个历史记录
  const handleRemoveHistoryItem = async (keyword: string) => {
    await removeSearchHistoryItem(keyword)
    // 更新搜索历史
    const updatedHistory = await getSearchHistory()
    setSearchHistory(updatedHistory)
  }

  // 处理搜索结果点击
  const handleItemPress = (item: any) => {
    navigation.navigate('PostDetail', { post_id: item.id })
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
            onPress={() => {
              setHasSearched(false)
              setSearchText('')
              setIsSearching(false)
            }}
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
              onFocus={() => {
                setHasSearched(false)
                setSearchText('')
                setIsSearching(false)
              }}
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
              <Text style={styles.searchButtonText}>搜索</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
        </View>

        {/* 搜索内容区域 */}
        {isSuggestionsVisible && searchSuggestions.length > 0 ? (
          /* 搜索建议列表 */
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
        ) : !hasSearched ? (
          <ScrollView style={styles.searchSuggestions}>
            {/* 搜索历史 */}
            <SearchHistory
              history={searchHistory}
              onHistoryPress={handleHistoryPress}
              onClearHistory={handleClearHistory}
              onRemoveItem={handleRemoveHistoryItem}
            />
            {/* 热门搜索 */}
            <HotSearches
              hotSearches={HOT_SEARCHES}
              onHotSearchPress={handleHotSearchPress}
            />
          </ScrollView>
        ) : searchResults.length > 0 || searchLoading ? (
          /* 搜索结果列表 */
          <SearchResults
            results={searchResults}
            loading={searchLoading}
            hasMore={searchHasMore}
            onLoadMore={loadMoreSearchResults}
          />
        ) : (
          /* 搜索无结果 */
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={64} color="#f43f5e" />
            <Text style={styles.noResultsText}>未搜索到对应帖子</Text>
            <Text style={styles.noResultsSubText}>换个关键词试试吧</Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    height: '100%',
    borderTopLeftRadius: 22,
    borderBottomLeftRadius: 22,
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8
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
