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
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 10
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
