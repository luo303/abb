// 导出按钮组件

import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ExportButtonProps {
  onPress: () => void
  style?: ViewStyle
  disabled?: boolean
}

export default function ExportButton({
  onPress,
  style,
  disabled = false
}: ExportButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons
        name="download-outline"
        size={20}
        color={disabled ? '#999' : '#fff'}
      />
      <Text
        style={[
          styles.buttonText,
          disabled ? styles.buttonTextDisabled : undefined
        ]}
      >
        导出
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  buttonDisabled: {
    backgroundColor: '#d5d8ddff',
    opacity: 0.7
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600'
  },
  buttonTextDisabled: {
    color: '#999'
  }
})
