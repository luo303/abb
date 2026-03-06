import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'

interface StickyTabHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  style?: any
}

export default function StickyTabHeader({
  activeTab,
  onTabChange,
  style
}: StickyTabHeaderProps) {
  const navigation = useNavigation<NavigationProps>()

  const handleAddPost = () => {
    navigation.navigate('AddPost')
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          <TouchableOpacity
            style={activeTab === '推荐' ? styles.activeTab : styles.tab}
            onPress={() => onTabChange('推荐')}
          >
            <Text
              style={
                activeTab === '推荐' ? styles.activeTabText : styles.tabText
              }
            >
              推荐
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeTab === '热门' ? styles.activeTab : styles.tab}
            onPress={() => onTabChange('热门')}
          >
            <Text
              style={
                activeTab === '热门' ? styles.activeTabText : styles.tabText
              }
            >
              热门
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeTab === '关注' ? styles.activeTab : styles.tab}
            onPress={() => onTabChange('关注')}
          >
            <Text
              style={
                activeTab === '关注' ? styles.activeTabText : styles.tabText
              }
            >
              关注
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity activeOpacity={0.8} onPress={handleAddPost}>
          <LinearGradient
            colors={['#ff9a9e', '#f43f5e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionBadge}
          >
            <Text style={styles.badgeText}>记录美好瞬间</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 20
  },
  tab: {
    paddingVertical: 5
  },
  activeTab: {
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#ff1744'
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    fontSize: 16,
    color: '#ff1744',
    fontWeight: '600'
  },
  sectionBadge: {
    backgroundColor: '#f43f5e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  badgeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  }
})
