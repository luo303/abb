import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export type TimeRange = 'day' | 'week' | 'month'

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
}

export default function TimeRangeSelector({
  value,
  onChange
}: TimeRangeSelectorProps) {
  const options: { label: string; value: TimeRange }[] = [
    { label: '天', value: 'day' },
    { label: '周', value: 'week' },
    { label: '月', value: 'month' }
  ]

  return (
    <View style={styles.container}>
      <View style={styles.selectorContainer}>
        {options.map(option => {
          const isSelected = value === option.value
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.text, isSelected && styles.selectedText]}>
                {option.label}
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
    alignItems: 'center',
    marginVertical: 10
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 24,
    padding: 4,
    width: 240,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20
  },
  selectedOption: {
    backgroundColor: '#ffffff',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  text: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500'
  },
  selectedText: {
    color: '#334155',
    fontWeight: '600'
  }
})
