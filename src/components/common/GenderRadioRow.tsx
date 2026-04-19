import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { RadioButton, TouchableRipple } from 'react-native-paper'

import { APP_COLORS } from '@/theme/paperTheme'

export type GenderValue = 'male' | 'female'

type GenderOption = {
  label: string
  value: GenderValue
}

type GenderRadioRowProps = {
  value: GenderValue
  onChange: (value: GenderValue) => void
  disabled?: boolean
  options?: GenderOption[]
}

const DEFAULT_OPTIONS: GenderOption[] = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
]

export default function GenderRadioRow({
  value,
  onChange,
  disabled = false,
  options = DEFAULT_OPTIONS
}: GenderRadioRowProps) {
  return (
    <View style={styles.row}>
      {options.map(option => {
        const checked = value === option.value

        return (
          <TouchableRipple
            key={option.value}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            rippleColor="rgba(244, 63, 94, 0.08)"
            style={[
              styles.option,
              checked && styles.optionChecked,
              disabled && styles.optionDisabled
            ]}
          >
            <View style={styles.optionContent}>
              <RadioButton
                color={APP_COLORS.primary}
                disabled={disabled}
                onPress={() => onChange(option.value)}
                status={checked ? 'checked' : 'unchecked'}
                uncheckedColor={APP_COLORS.textMuted}
                value={option.value}
              />
              <Text
                style={[
                  styles.optionLabel,
                  checked && styles.optionLabelChecked
                ]}
              >
                {option.label}
              </Text>
            </View>
          </TouchableRipple>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12
  },
  option: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: APP_COLORS.outline,
    backgroundColor: APP_COLORS.surface
  },
  optionChecked: {
    borderColor: APP_COLORS.primary,
    backgroundColor: APP_COLORS.surfaceVariant
  },
  optionDisabled: {
    opacity: 0.6
  },
  optionContent: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10
  },
  optionLabel: {
    fontSize: 14,
    color: APP_COLORS.text,
    fontWeight: '500'
  },
  optionLabelChecked: {
    color: APP_COLORS.primary,
    fontWeight: '600'
  }
})
