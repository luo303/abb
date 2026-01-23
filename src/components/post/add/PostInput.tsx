import React from 'react'
import { TextInput, StyleSheet, View } from 'react-native'

interface PostInputProps {
  value: string
  onChangeText: (text: string) => void
}

export default function PostInput({ value, onChangeText }: PostInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="记录宝宝成长的每一个瞬间..."
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#999"
        autoFocus
        textAlignVertical="top"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    lineHeight: 24
  }
})
