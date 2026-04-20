import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from 'react-native'
import { List, Search, Plus } from '@zappicon/react-native'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../../types/navigation'
import { HOME_PINK_THEME, HomeTone } from '../homePalette'

interface HomeSearchBarProps {
  onMenuPress?: () => void
  onSearch?: (text: string) => void
  tone?: HomeTone
}

export default function HomeSearchBar({
  onMenuPress,
  onSearch,
  tone = 'default'
}: HomeSearchBarProps) {
  const navigation = useNavigation<NavigationProps>()
  const [searchText, setSearchText] = useState('')
  const isPinkTone = tone === 'pink'

  const handleOpenSearch = useCallback(() => {
    navigation.navigate('Search')
  }, [navigation])

  const handleAddPost = useCallback(() => {
    navigation.navigate('AddPost')
  }, [navigation])

  const handleChangeText = useCallback(
    (text: string) => {
      setSearchText(text)
      onSearch?.(text)
    },
    [onSearch]
  )

  return (
    <View style={[styles.container, isPinkTone && styles.containerPink]}>
      <TouchableOpacity
        style={[styles.menuButton, isPinkTone && styles.menuButtonPink]}
        activeOpacity={0.85}
        onPress={onMenuPress}
      >
        <List
          size={24}
          color={isPinkTone ? HOME_PINK_THEME.text : '#111827'}
          variant="regular"
        />
      </TouchableOpacity>

      {onSearch ? (
        <View style={[styles.searchBox, isPinkTone && styles.searchBoxPink]}>
          <Search
            size={18}
            color={isPinkTone ? HOME_PINK_THEME.iconMuted : '#9ca3af'}
            variant="regular"
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.input, isPinkTone && styles.inputPink]}
            placeholder="搜索您感兴趣的内容..."
            placeholderTextColor={
              isPinkTone ? HOME_PINK_THEME.textMuted : '#9ca3af'
            }
            value={searchText}
            onChangeText={handleChangeText}
            returnKeyType="search"
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.searchBox, isPinkTone && styles.searchBoxPink]}
          activeOpacity={0.85}
          onPress={handleOpenSearch}
        >
          <Search
            size={18}
            color={isPinkTone ? HOME_PINK_THEME.iconMuted : '#9ca3af'}
            variant="regular"
            style={styles.searchIcon}
          />
          <Text
            style={[styles.placeholder, isPinkTone && styles.placeholderPink]}
          >
            搜索您感兴趣的内容...
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.addButton, isPinkTone && styles.addButtonPink]}
        activeOpacity={0.85}
        onPress={handleAddPost}
      >
        <Plus
          size={22}
          color={isPinkTone ? HOME_PINK_THEME.text : '#111827'}
          variant="regular"
        />
      </TouchableOpacity>
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
  containerPink: {
    backgroundColor: HOME_PINK_THEME.background
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
  menuButtonPink: {
    backgroundColor: HOME_PINK_THEME.surface,
    borderColor: HOME_PINK_THEME.border
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
  searchBoxPink: {
    backgroundColor: HOME_PINK_THEME.surface,
    borderColor: HOME_PINK_THEME.border
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
  inputPink: {
    color: HOME_PINK_THEME.text
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af'
  },
  placeholderPink: {
    color: HOME_PINK_THEME.textMuted
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  addButtonPink: {
    backgroundColor: HOME_PINK_THEME.surface,
    borderColor: HOME_PINK_THEME.border
  }
})
