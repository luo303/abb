import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../../types/navigation'

interface HomeSearchBarProps {
  onMenuPress?: () => void
  onSearch?: (text: string) => void
}

export default function HomeSearchBar({
  onMenuPress,
  onSearch
}: HomeSearchBarProps) {
  const navigation = useNavigation<NavigationProps>()
  const [searchText, setSearchText] = useState('')

  const handleOpenSearch = useCallback(() => {
    navigation.navigate('Search')
  }, [navigation])

  const handleChangeText = useCallback(
    (text: string) => {
      setSearchText(text)
      onSearch?.(text)
    },
    [onSearch]
  )

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        activeOpacity={0.85}
        onPress={onMenuPress}
      >
        <Ionicons name="menu-outline" size={24} color="#111827" />
      </TouchableOpacity>

      {onSearch ? (
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="搜索您感兴趣的内容..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={handleChangeText}
            returnKeyType="search"
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.searchBox}
          activeOpacity={0.85}
          onPress={handleOpenSearch}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <Text style={styles.placeholder}>搜索您感兴趣的内容...</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 18,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14
  },
  searchIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af'
  }
})
