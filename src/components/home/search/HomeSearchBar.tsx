import React, { useState } from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { NavigationProps } from '../../../types/navigation'

interface HomeSearchBarProps {
  onSearch: (text: string) => void
}

export default function HomeSearchBar({ onSearch }: HomeSearchBarProps) {
  const navigation = useNavigation<NavigationProps>()
  const [searchText, setSearchText] = useState('')

  const handleSearch = () => {
    onSearch(searchText)
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
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
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} activeOpacity={0.8}>
          <LinearGradient
            colors={['#ff9a9e', '#f43f5e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.searchButton}
          >
            <Text style={styles.searchButtonText}>搜索</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddPost')}
      >
        <LinearGradient
          colors={['#ff9a9e', '#f43f5e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    elevation: 0,
    gap: 12
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 0,
    height: 44,
    // 阴影效果
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
    fontSize: 14,
    color: '#333',
    height: '100%',
    paddingLeft: 12
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  }
})
