import React from 'react'
import { Text, StyleSheet, View, TextInput } from 'react-native'
import { APP_COLORS } from '@/theme/paperTheme'

interface AmountInputProps {
  value: string
  onChange: (text: string) => void
  type: '奶粉' | '母乳' | '辅食'
  placeholder: string
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  type,
  placeholder
}) => {
  const getLabel = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return '喂养量'
      case '母乳':
        return '喂养时长'
      case '辅食':
        return '喂养量'
      default:
        return '喂养量'
    }
  }

  const getUnit = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return 'ml'
      case '母乳':
        return 'min'
      case '辅食':
        return 'g'
      default:
        return ''
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>{getLabel(type)}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={APP_COLORS.textMuted}
          keyboardType="numeric"
          selectionColor={APP_COLORS.primary}
          style={[styles.inputItem, { borderColor: APP_COLORS.outlineVariant }]}
        />
        <Text style={styles.unitText}>{getUnit(type)}</Text>
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
    fontSize: 16,
    color: APP_COLORS.text
  },
  unitText: {
    fontSize: 16,
    color: APP_COLORS.textMuted,
    marginLeft: 12
  },
  labelText: {
    fontSize: 14,
    color: APP_COLORS.text,
    marginBottom: 8
  }
})

export default AmountInput
