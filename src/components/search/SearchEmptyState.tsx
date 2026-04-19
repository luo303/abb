import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { APP_COLORS } from '@/theme/paperTheme'

type EmptyMode = 'empty' | 'error'
type EmptyVariant = 'full' | 'compact'

interface SearchEmptyStateProps {
  mode: EmptyMode
  variant?: EmptyVariant
  subtitle?: string
  onRetry?: () => void
  onGoHot?: () => void
  onReset?: () => void
}

export default function SearchEmptyState({
  mode,
  variant = 'full',
  subtitle,
  onRetry,
  onGoHot,
  onReset
}: SearchEmptyStateProps) {
  const isError = mode === 'error'
  const isCompact = variant === 'compact'

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'search-outline'}
        size={isCompact ? 52 : 64}
        color={APP_COLORS.secondary}
      />
      <Text style={styles.title}>
        {isError ? '搜索失败' : '未搜索到对应帖子'}
      </Text>
      <Text style={styles.subtitle}>
        {subtitle || (isError ? '请稍后再试' : '换个关键词试试吧')}
      </Text>
      <View style={styles.actions}>
        {isError ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onRetry}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>重试</Text>
          </TouchableOpacity>
        ) : null}
        {!isError ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onGoHot}
            style={styles.ghostButton}
          >
            <Text style={styles.ghostButtonText}>试试热门</Text>
          </TouchableOpacity>
        ) : null}
        {!isError ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onReset}
            style={styles.ghostButton}
          >
            <Text style={styles.ghostButtonText}>重新输入</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  containerCompact: {
    flex: 0,
    paddingTop: 24,
    paddingBottom: 12
  },
  title: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: APP_COLORS.text
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: APP_COLORS.textMuted
  },
  actions: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  primaryButton: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginHorizontal: 4,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary
  },
  primaryButtonText: {
    color: APP_COLORS.white,
    fontSize: 14,
    fontWeight: '600'
  },
  ghostButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginHorizontal: 4,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceVariant
  },
  ghostButtonText: {
    color: APP_COLORS.text,
    fontSize: 14,
    fontWeight: '500'
  }
})
