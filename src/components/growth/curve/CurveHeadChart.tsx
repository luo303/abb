import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function CurveHeadChart() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>头围曲线功能开发中...</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#999',
    fontSize: 16
  }
})
