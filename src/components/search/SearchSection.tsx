import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { APP_COLORS } from '@/theme/paperTheme'

interface SearchSectionProps {
  title: string
  rightAction?: React.ReactNode
  children: React.ReactNode
}

export default function SearchSection({
  title,
  rightAction,
  children
}: SearchSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {rightAction ? <View>{rightAction}</View> : null}
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18
  },
  header: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_COLORS.text
  }
})
