import React, { useState } from 'react'
import { View, StyleSheet, FlatList, StatusBar } from 'react-native'
import TabooSearchBar from '@/components/Taboo/TabooSearchBar'
import FoodCard from '@/components/Taboo/FoodCard'
import { MOCK_FOODS } from '@/data/mock/homePosts'

export default function TabooScreen() {
  const [searchText, setSearchText] = useState('')
  const [filteredFoods, setFilteredFoods] = useState(MOCK_FOODS)

  const handleSearch = (text: string) => {
    setSearchText(text)
    if (!text.trim()) {
      setFilteredFoods(MOCK_FOODS)
      return
    }
    const filtered = MOCK_FOODS.filter(
      item =>
        item.name.includes(text) || item.tags.some(tag => tag.includes(text))
    )
    setFilteredFoods(filtered)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TabooSearchBar
        value={searchText}
        onChangeText={handleSearch}
        onTagPress={handleSearch}
        onClear={() => handleSearch('')}
      />

      <FlatList
        data={filteredFoods}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <FoodCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#E0F7FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 0,
    zIndex: 1,
    alignItems: 'flex-start'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 1
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: '500'
  },
  listContent: {
    padding: 16,
    paddingTop: 20
  }
})
