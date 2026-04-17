import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { HOME_PINK_THEME, HomeTone } from './homePalette'

interface SearchEmptyStateProps {
  isLoading?: boolean
}

export function SearchEmptyState({ isLoading }: SearchEmptyStateProps) {
  if (isLoading) {
    return (
      <View style={{ padding: 10, alignItems: 'center' }}>
        <Text style={{ color: '#999', fontSize: 12 }}>搜索中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="search-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>暂无相关帖子</Text>
      <Text style={styles.emptyStateSubtitle}>换个关键词试试吧</Text>
    </View>
  )
}

interface FollowEmptyStateProps {
  onGoToRecommend: () => void
  tone?: HomeTone
}

export function FollowEmptyState({
  onGoToRecommend,
  tone = 'default'
}: FollowEmptyStateProps) {
  const isPinkTone = tone === 'pink'

  return (
    <View
      style={[
        styles.emptyStateContainer,
        isPinkTone && styles.emptyStateContainerPink
      ]}
    >
      <Text
        style={[
          styles.emptyStateTitle,
          isPinkTone && styles.emptyStateTitlePink
        ]}
      >
        暂无相关帖子呢
      </Text>
      <Text
        style={[
          styles.emptyStateSubtitle,
          isPinkTone && styles.emptyStateSubtitlePink
        ]}
      >
        关注感兴趣的作者，获取他们的最新动态
      </Text>
      <TouchableOpacity onPress={onGoToRecommend}>
        <LinearGradient
          colors={
            isPinkTone
              ? [HOME_PINK_THEME.primarySoft, HOME_PINK_THEME.primary]
              : ['#ff9a9e', '#f43f5e']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.emptyStateButton,
            isPinkTone && styles.emptyStateButtonPink
          ]}
        >
          <Text style={styles.emptyStateButtonText}>去发现精彩内容</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

interface HomeTabEmptyStateProps {
  iconName: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  tone?: HomeTone
}

export function HomeTabEmptyState({
  iconName,
  title,
  subtitle,
  tone = 'default'
}: HomeTabEmptyStateProps) {
  const isPinkTone = tone === 'pink'

  return (
    <View
      style={[
        styles.emptyStateContainer,
        isPinkTone && styles.emptyStateContainerPink
      ]}
    >
      <Ionicons
        name={iconName}
        size={64}
        color={isPinkTone ? HOME_PINK_THEME.primarySoft : '#ccc'}
      />
      <Text
        style={[
          styles.emptyStateTitle,
          isPinkTone && styles.emptyStateTitlePink
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.emptyStateSubtitle,
          isPinkTone && styles.emptyStateSubtitlePink
        ]}
      >
        {subtitle}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyStateContainerPink: {
    backgroundColor: HOME_PINK_THEME.background
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10
  },
  emptyStateTitlePink: {
    color: HOME_PINK_THEME.text
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30
  },
  emptyStateSubtitlePink: {
    color: HOME_PINK_THEME.textMuted
  },
  emptyStateButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  emptyStateButtonPink: {
    shadowColor: HOME_PINK_THEME.shadow
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
})
