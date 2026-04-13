import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

function ChatEmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AntDesign name="twitch" size={72} color="#1f99b0" />
        <Text style={styles.title}>Hi！我是小稚~</Text>
        <Text style={styles.subtitle}>
          专业的育儿知识，贴心的陪伴建议，陪你轻松度过孕育每一天
        </Text>
      </View>
    </View>
  )
}

export default memo(ChatEmptyState)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32
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
