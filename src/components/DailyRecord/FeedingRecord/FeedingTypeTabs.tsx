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
  // 根据选中类型获取按钮颜色
  const getButtonColor = (type: '奶粉' | '母乳' | '辅食'): string => {
    switch (type) {
      case '奶粉':
        return '#f43f5e' // 亮红色（奶粉）
      case '母乳':
        return '#e11d48' // 深珊瑚粉
      case '辅食':
        return '#b91c1c' // 深红色（辅食）
      default:
        return '#333333'
    }
  }

  // 获取当前选中类型的颜色
  const currentColor = getButtonColor(selectedType)

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedType === '奶粉' && [
            styles.activeTab,
            { backgroundColor: currentColor, shadowColor: currentColor }
          ]
        ]}
        onPress={() => onTypeChange('奶粉')}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="baby-bottle"
            size={24}
            color={selectedType === '奶粉' ? '#fff' : currentColor}
          />
        </View>
        <Text
          style={[
            styles.tabText,
            { color: currentColor },
            selectedType === '奶粉' && [styles.activeTabText, { color: '#fff' }]
          ]}
        >
          奶粉
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedType === '母乳' && [
            styles.activeTab,
            { backgroundColor: currentColor, shadowColor: currentColor }
          ]
        ]}
        onPress={() => onTypeChange('母乳')}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="water"
            size={24}
            color={selectedType === '母乳' ? '#fff' : currentColor}
          />
        </View>
        <Text
          style={[
            styles.tabText,
            { color: currentColor },
            selectedType === '母乳' && [styles.activeTabText, { color: '#fff' }]
          ]}
        >
          母乳
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          selectedType === '辅食' && [
            styles.activeTab,
            { backgroundColor: currentColor, shadowColor: currentColor }
          ]
        ]}
        onPress={() => onTypeChange('辅食')}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="food"
            size={24}
            color={selectedType === '辅食' ? '#fff' : currentColor}
          />
        </View>
        <Text
          style={[
            styles.tabText,
            { color: currentColor },
            selectedType === '辅食' && [styles.activeTabText, { color: '#fff' }]
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
  },

  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default FeedingTypeTabs
