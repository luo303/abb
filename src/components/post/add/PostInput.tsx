import React from 'react'
import { TextInput, StyleSheet, View } from 'react-native'

interface PostInputProps {
  title?: string
  onTitleChange?: (text: string) => void
  value: string
  onChangeText: (text: string) => void
}

export default function PostInput({
  title = '',
  onTitleChange,
  value,
  onChangeText
}: PostInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="给帖子起个标题..."
        value={title}
        onChangeText={onTitleChange}
        placeholderTextColor="#fda4af"
        maxLength={50}
      />
      <TextInput
        style={styles.input}
        placeholder="记录宝宝成长的每一个瞬间..."
        multiline
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#fda4af"
        textAlignVertical="top"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 15
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    lineHeight: 26
  },
  input: {
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    lineHeight: 24
  }
})
