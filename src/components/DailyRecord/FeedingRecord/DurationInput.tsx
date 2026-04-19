import React from 'react'
import { Text, StyleSheet, View, TextInput } from 'react-native'
import { APP_COLORS } from '@/theme/paperTheme'

interface DurationInputProps {
  value: string
  onChange: (text: string) => void
  placeholder?: string
}

export default function DurationInput({
  value,
  onChange,
  placeholder = '请输入分钟数'
}: DurationInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>时长</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={APP_COLORS.textMuted}
          keyboardType="numeric"
          selectionColor={APP_COLORS.primary}
          style={[
            styles.inputItem,
            {
              borderColor: APP_COLORS.outlineVariant
            }
          ]}
        />
        <Text style={styles.unitText}>min</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  inputItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: APP_COLORS.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16
  },
  unitText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
    color: APP_COLORS.textMuted
  },
  labelText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: APP_COLORS.text
  }
})
