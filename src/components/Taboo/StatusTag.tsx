import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { TabooStatus, STATUS_CONFIG, CATEGORY_LABELS } from '@/types/taboo'

interface StatusTagProps {
  category: keyof typeof CATEGORY_LABELS
  status: TabooStatus
}

export default function StatusTag({ category, status }: StatusTagProps) {
  const config = STATUS_CONFIG[status]
  const label = CATEGORY_LABELS[category]

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <AntDesign
        name={config.icon as any}
        size={10}
        color={config.color}
        style={styles.icon}
      />
      <Text style={[styles.text, { color: config.color }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4
  },
  icon: {
    marginRight: 3
  },
  text: {
    fontSize: 10,
    fontWeight: '600'
  }
})
