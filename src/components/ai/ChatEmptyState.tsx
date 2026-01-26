import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
export default function ChatEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AntDesign name="twitch" size={72} color="#1f99b0" />
        <Text style={styles.title}>Hi！我是 AI 孕育助手</Text>
        <Text style={styles.subtitle}>有什么相关问题，尽管问我</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100 // 留出底部输入框的空间
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22
  }
})
