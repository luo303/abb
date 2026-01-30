import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'

export default function BabyStoriesScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '宝宝故事' }} />
      <Text>宝宝故事功能开发中...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
})
