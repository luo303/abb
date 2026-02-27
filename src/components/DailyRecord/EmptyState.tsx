import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="calendar-blank" size={48} color="#ccc" />
      <Text style={styles.emptyText}>暂无记录</Text>
      <Text style={styles.emptySubText}>点击上方圆环添加记录</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8
  }
})
