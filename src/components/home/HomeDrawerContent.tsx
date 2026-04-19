import React, { useMemo } from 'react'
import {
  ActivityIndicator,
  Alert,
  InteractionManager,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'

import PaperAvatar from '@/components/common/PaperAvatar'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useRelationshipCounts } from '@/hooks/useRelationshipCounts'
import { logoutAndClearAll } from '@/store/modules/userStore'
import { APP_COLORS } from '@/theme/paperTheme'

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
    key: 'growthCurve',
    label: '成长曲线',
    scope: 'root' as ShortcutScope,
    target: 'GrowthCurve',
    icon: ({ size, color }: { size: number; color: string }) => (
      <MaterialCommunityIcons name="chart-line" size={size} color={color} />
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
  }
]

export default function HomeDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const userInfo = useAppSelector(state => state.user.userInfo)
  const { followingCount, followerCount, loadingCounts } =
    useRelationshipCounts(userInfo?.user_id)
  const footerBottomPadding =
    (Platform.OS === 'ios' ? 46 + insets.bottom : 56) + 16

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

  const handleLogout = () => {
    props.navigation.closeDrawer()

    InteractionManager.runAfterInteractions(() => {
      Alert.alert(
        '退出登录',
        '确定要退出登录吗？',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '确定',
            style: 'destructive',
            onPress: () => {
              dispatch(logoutAndClearAll() as any)
            }
          }
        ],
        { cancelable: true }
      )
    })
  }

  const renderCount = (count: number | null) => {
    if (loadingCounts) {
      return '--'
    }

    return count ?? '--'
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.layout}>
        <ScrollView
          style={styles.scrollView}
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

        <View style={[styles.footer, { paddingBottom: footerBottomPadding }]}>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color={APP_COLORS.primaryStrong}
            />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  layout: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  content: {
    flexGrow: 1,
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
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f1d8df',
    backgroundColor: '#fff'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3'
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.primaryStrong
  }
})
