import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { APP_COLORS } from '@/theme/paperTheme'

type FoodQuickOption = '吃了几口' | '少量' | '正常' | '很多'

interface FoodQuickOptionsProps {
  value?: FoodQuickOption
  onChange: (value?: FoodQuickOption) => void
}

const OPTIONS: FoodQuickOption[] = ['吃了几口', '少量', '正常', '很多']

export type { FoodQuickOption }

export default function FoodQuickOptions({
  value,
  onChange
}: FoodQuickOptionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>辅食状态</Text>
      <View style={styles.row}>
        {OPTIONS.map(option => {
          const active = value === option
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.85}
              onPress={() => onChange(active ? undefined : option)}
              style={[
                styles.pill,
                {
                  borderColor: active
                    ? APP_COLORS.primary
                    : APP_COLORS.outlineVariant,
                  backgroundColor: active ? APP_COLORS.surface : 'transparent'
                }
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: active ? APP_COLORS.primary : APP_COLORS.textMuted }
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16
  },
  labelText: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
    color: APP_COLORS.text
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pill: {
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700'
  }
})
