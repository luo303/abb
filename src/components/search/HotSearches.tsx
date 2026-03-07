import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface HotSearchesProps {
  hotSearches: string[]
  onHotSearchPress: (keyword: string) => void
}

const HotSearches: React.FC<HotSearchesProps> = ({
  hotSearches,
  onHotSearchPress
}) => {
  if (hotSearches.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>热门搜索</Text>
      <View style={styles.hotList}>
        {hotSearches.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.hotItem}
            onPress={() => onHotSearchPress(item)}
          >
            <Text style={styles.hotText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingTop: 16
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12
  },
  hotList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  hotItem: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  hotText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  }
})

export default HotSearches
