import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export interface TabItem {
  key: string
  label: string
}

interface CurveTabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (key: string) => void
}

export default function CurveTabs({
  tabs,
  activeTab,
  onTabChange
}: CurveTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isActive && styles.activeTabItem]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#EE6666',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16
  },
  activeTabItem: {
    backgroundColor: '#EE6666'
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})
