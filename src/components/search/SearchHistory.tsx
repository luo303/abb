import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SearchHistoryProps {
  history: string[]
  onHistoryPress: (keyword: string) => void
  onClearHistory: () => void
  onRemoveItem: (keyword: string) => void
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onHistoryPress,
  onClearHistory,
  onRemoveItem
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [animation] = useState(new Animated.Value(0))

  if (history.length === 0) {
    return null
  }

  // 只显示前两行标签，假设每行最多显示4个标签
  const MAX_VISIBLE_ITEMS = 8
  const visibleHistory = isExpanded
    ? history
    : history.slice(0, MAX_VISIBLE_ITEMS)

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true
    }).start()
    setIsExpanded(!isExpanded)
  }

  const rotateAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>搜索历史</Text>
        <View style={styles.headerActions}>
          {history.length > MAX_VISIBLE_ITEMS && (
            <TouchableOpacity
              onPress={toggleExpand}
              style={styles.expandButton}
            >
              <Animated.View
                style={{ transform: [{ rotate: rotateAnimation }] }}
              >
                <Ionicons name="chevron-down" size={20} color="#f43f5e" />
              </Animated.View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClearHistory} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#f43f5e" />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={[
          styles.historyList,
          !isExpanded && { maxHeight: 76, overflow: 'hidden' }
        ]}
      >
        {visibleHistory.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.historyItem}
            onPress={() => onHistoryPress(item)}
          >
            <Ionicons name="time-outline" size={16} color="#f43f5e" />
            <Text style={styles.historyText}>{item}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={e => {
                e.stopPropagation()
                onRemoveItem(item)
              }}
            >
              <Ionicons name="close" size={16} color="#f43f5e" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  expandButton: {
    padding: 4
  },
  clearButton: {
    padding: 4
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  historyListContent: {
    paddingBottom: 8
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 10
  },
  historyText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#f43f5e',
    fontWeight: 'bold'
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4
  }
})

export default SearchHistory
