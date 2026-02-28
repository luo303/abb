import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface FeedingTypeTabsProps {
  selectedType: '奶粉' | '母乳' | '辅食'
  onTypeChange: (type: '奶粉' | '母乳' | '辅食') => void
}

const FeedingTypeTabs: React.FC<FeedingTypeTabsProps> = ({
  selectedType,
  onTypeChange
}) => {
  const getIconName = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return 'baby-bottle'
      case '母乳':
        return 'water'
      case '辅食':
        return 'food'
      default:
        return 'baby-bottle'
    }
  }

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, selectedType === '奶粉' && styles.activeTab]}
        onPress={() => onTypeChange('奶粉')}
      >
        <MaterialCommunityIcons
          name={getIconName('奶粉')}
          size={24}
          color={selectedType === '奶粉' ? '#fff' : '#f43f5e'}
        />
        <Text
          style={[
            styles.tabText,
            selectedType === '奶粉' && styles.activeTabText
          ]}
        >
          奶粉
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedType === '母乳' && styles.activeTab]}
        onPress={() => onTypeChange('母乳')}
      >
        <MaterialCommunityIcons
          name={getIconName('母乳')}
          size={24}
          color={selectedType === '母乳' ? '#fff' : '#f43f5e'}
        />
        <Text
          style={[
            styles.tabText,
            selectedType === '母乳' && styles.activeTabText
          ]}
        >
          母乳
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedType === '辅食' && styles.activeTab]}
        onPress={() => onTypeChange('辅食')}
      >
        <MaterialCommunityIcons
          name={getIconName('辅食')}
          size={24}
          color={selectedType === '辅食' ? '#fff' : '#f43f5e'}
        />
        <Text
          style={[
            styles.tabText,
            selectedType === '辅食' && styles.activeTabText
          ]}
        >
          辅食
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 24,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
    flexDirection: 'column',
    justifyContent: 'center'
  },
  activeTab: {
    backgroundColor: '#f43f5e',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})

export default FeedingTypeTabs
