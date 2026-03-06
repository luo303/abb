import React from 'react'
import { TextInput, StyleSheet, View } from 'react-native'

interface PostInputProps {
  title?: string
  onTitleChange?: (text: string) => void
  value: string
  onChangeText: (text: string) => void
  titlePlaceholder?: string
  placeholder?: string
  expand?: boolean
}

export default function PostInput({
  title = '',
  onTitleChange,
  value,
  onChangeText,
  titlePlaceholder = '给帖子起个标题...',
  placeholder = '记录宝宝成长的每一个瞬间...',
  expand = false
}: PostInputProps) {
  return (
    <View style={[styles.container, expand && { flex: 1 }]}>
      <TextInput
        style={styles.titleInput}
        placeholder={titlePlaceholder}
        value={title}
        onChangeText={onTitleChange}
        placeholderTextColor="#fda4af"
        maxLength={50}
      />
      <TextInput
        style={[styles.input, expand && { flex: 1, minHeight: undefined }]}
        placeholder={placeholder}
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
