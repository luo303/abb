import React from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../../types/navigation'

interface HomeSearchBarProps {
  onSearch: (text: string) => void
}

export default function HomeSearchBar({ onSearch }: HomeSearchBarProps) {
  const navigation = useNavigation<NavigationProps>()
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="搜索您感兴趣的内容..."
          placeholderTextColor="#999"
          onChangeText={onSearch}
        />
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPost')}
      >
        <Ionicons name="add-circle-outline" size={28} color="#1f99b0" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'transparent', // 透明背景以显示底部渐变
    // 移除外层容器的圆角和阴影，使其融合
    marginHorizontal: 0,
    elevation: 0
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F5', // 更淡的灰背景
    borderRadius: 22, // 更圆润
    paddingHorizontal: 16,
    height: 40, // 增加高度提升触感
    marginRight: 12
  },
  icon: {
    marginRight: 5
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%'
  },
  addButton: {
    padding: 5
  }
})
