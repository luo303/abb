import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI 助手聊天界面</Text>
      <Text style={styles.subText}>这里将显示对话内容</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subText: {
    color: '#666'
  }
})
