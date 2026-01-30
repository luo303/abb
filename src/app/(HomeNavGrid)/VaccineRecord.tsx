import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'

export default function VaccineRecordScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '疫苗记录' }} />
      <Text>疫苗记录功能开发中...</Text>
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
