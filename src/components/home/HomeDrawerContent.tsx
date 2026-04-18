import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'

import PaperAvatar from '@/components/common/PaperAvatar'
import { useAppSelector } from '@/hooks/redux'
import { getFollowerUsers, getFollowingUsers } from '@/api/follow'

type ShortcutScope = 'root' | 'tab'

const QUICK_LINKS = [
  {
    key: 'growthReport',
    label: 'AI 成长报告',
    scope: 'root' as ShortcutScope,
    target: 'GrowthReport',
    icon: ({ size, color }: { size: number; color: string }) => (
      <Ionicons name="sparkles-outline" size={size} color={color} />
    )
  },
  {
    key: 'daily',
    label: '日常记录',
    scope: 'root' as ShortcutScope,
    target: 'DailyRecord',
    icon: ({ size, color }: { size: number; color: string }) => (
      <MaterialCommunityIcons name="pencil-outline" size={size} color={color} />
    )
  },
  {
    key: 'vaccine',
    label: '疫苗记录',
    scope: 'root' as ShortcutScope,
    target: 'VaccineRecord',
    icon: ({ size, color }: { size: number; color: string }) => (
      <MaterialCommunityIcons name="needle" size={size} color={color} />
    )
  },
  {
    key: 'milestone',
    label: '大事记',
    scope: 'root' as ShortcutScope,
    target: 'MilestoneList',
    icon: ({ size, color }: { size: number; color: string }) => (
      <Ionicons name="book-outline" size={size} color={color} />
    )
  },
  {
    key: 'growthCurve',
    label: '成长曲线',
    scope: 'root' as ShortcutScope,
    target: 'GrowthCurve',
    icon: ({ size, color }: { size: number; color: string }) => (
      <MaterialCommunityIcons name="chart-line" size={size} color={color} />
    )
  }
]

const PAGE_SIZE = 100

async function getRelationshipCount(
  fetcher: (
    page?: number,
    pageSize?: number,
    userId?: string
  ) => Promise<{
    data: {
      list: unknown[]
      has_more: boolean
    }
  }>,
  userId?: string
) {
  let page = 1
  let total = 0
  let hasMore = true

  while (hasMore) {
    const response = await fetcher(page, PAGE_SIZE, userId)
    const list = response.data?.list ?? []

    total += list.length
    hasMore = Boolean(response.data?.has_more)
    page += 1

    if (page > 100) {
      break
    }
  }

  return total
}

export default function HomeDrawerContent(props: DrawerContentComponentProps) {
  const userInfo = useAppSelector(state => state.user.userInfo)
  const [followingCount, setFollowingCount] = useState<number | null>(null)
  const [followerCount, setFollowerCount] = useState<number | null>(null)
  const [loadingCounts, setLoadingCounts] = useState(false)

  useEffect(() => {
    let active = true

    const loadRelationshipCounts = async () => {
      setLoadingCounts(true)

      try {
        const [following, followers] = await Promise.all([
          getRelationshipCount(getFollowingUsers, userInfo?.user_id),
          getRelationshipCount(getFollowerUsers, userInfo?.user_id)
        ])

        if (!active) return

        setFollowingCount(following)
        setFollowerCount(followers)
      } catch (error) {
        if (!active) return

        console.error('获取关注/粉丝统计失败:', error)
        setFollowingCount(null)
        setFollowerCount(null)
      } finally {
        if (active) {
          setLoadingCounts(false)
        }
      }
    }

    loadRelationshipCounts()

    return () => {
      active = false
    }
  }, [userInfo?.user_id])

  const displayName = useMemo(
    () => userInfo?.username || userInfo?.account || 'Love Baby 用户',
    [userInfo?.account, userInfo?.username]
  )

  const displayEmail = useMemo(
    () => userInfo?.email || userInfo?.account || '暂无邮箱',
    [userInfo?.account, userInfo?.email]
  )

  const handleShortcutPress = (target: string, scope: ShortcutScope) => {
    props.navigation.closeDrawer()

    if (scope === 'tab') {
      const tabNavigation = props.navigation.getParent()
      if (tabNavigation) {
        tabNavigation.navigate(target as never)
        return
      }
    }

    const rootNavigation = props.navigation.getParent()?.getParent()
    if (rootNavigation) {
      rootNavigation.navigate(target as never)
      return
    }

    props.navigation.navigate(target as never)
  }

  const renderCount = (count: number | null) => {
    if (loadingCounts) {
      return '--'
    }

    return count ?? '--'
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarShell}>
            <PaperAvatar
              accessibilityLabel={displayName}
              size={72}
              source={userInfo?.avatar}
              style={styles.avatar}
            />
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {renderCount(followingCount)} 关注
            </Text>
            <Text style={styles.statsDivider}>|</Text>
            <Text style={styles.statsText}>
              {renderCount(followerCount)} 粉丝
            </Text>
            {loadingCounts ? (
              <ActivityIndicator
                size="small"
                color="#9ca3af"
                style={styles.statsLoading}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.shortcutsSection}>
          {QUICK_LINKS.map(item => (
            <Button
              key={item.key}
              mode="text"
              icon={item.icon}
              onPress={() => handleShortcutPress(item.target, item.scope)}
              rippleColor="rgba(244, 63, 94, 0.18)"
              textColor="#111827"
              style={styles.shortcutItem}
              contentStyle={styles.shortcutContent}
              labelStyle={styles.shortcutLabel}
              uppercase={false}
            >
              {item.label}
            </Button>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28
  },
  profileSection: {
    paddingBottom: 26,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb'
  },
  avatarShell: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36
  },
  name: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
  },
  email: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280'
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18
  },
  statsText: {
    fontSize: 15,
    color: '#111827'
  },
  statsDivider: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#9ca3af'
  },
  statsLoading: {
    marginLeft: 10
  },
  shortcutsSection: {
    paddingTop: 18
  },
  shortcutItem: {
    width: '100%',
    alignSelf: 'stretch',
    marginBottom: 10
  },
  shortcutContent: {
    height: 56,
    justifyContent: 'flex-start',
    paddingHorizontal: 8
  },
  shortcutLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  }
})
