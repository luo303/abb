import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'

interface RemarkInputProps {
  value: string
  onChange: (text: string) => void
  label: string
  placeholder: string
}

const RemarkInput: React.FC<RemarkInputProps> = ({
  value,
  onChange,
  label,
  placeholder
}) => {
  return (
    <View style={styles.remarkContainer}>
      <Text style={styles.remarkLabel}>{label}</Text>
      <TextInput
        style={styles.remarkInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        textAlignVertical="top"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  remarkContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0
  },
  remarkLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  remarkInput: {
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top'
  }
})

export default RemarkInput
