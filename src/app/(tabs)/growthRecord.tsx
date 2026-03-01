import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity
} from 'react-native'
import type { ImageSourcePropType } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import React, { useState, useCallback, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'

// 导入组件
import { NavigationProps } from '../../types/navigation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchBabyProfile, fetchGrowthCurve } from '@/store/modules/BabyStore'
import CurveHeightChart from '../../components/growth/curve/CurveHeightChart'

function Section({
  title,
  subtitle,
  accent,
  cta,
  onPress,
  icon,
  meta,
  variant = 'default',
  children
}: {
  title?: string
  subtitle?: string
  accent: string
  cta?: string
  onPress?: () => void
  icon?: keyof typeof Ionicons.glyphMap
  meta?: string[]
  variant?: 'default' | 'profile' | 'full'
  children?: React.ReactNode
}) {
  const Wrapper = onPress ? TouchableOpacity : View
  const isProfile = variant === 'profile'
  const isFull = variant === 'full'
  const hasHeader = !!icon || !!title || !!subtitle
  return (
    <Wrapper
      style={[
        styles.sectionCard,
        isProfile && styles.profileCard,
        isProfile && styles.profileCardFlat,
        isFull && styles.sectionCardFlat
      ]}
      {...(onPress ? { onPress, activeOpacity: 0.85 } : null)}
    >
      {hasHeader ? (
        <View style={styles.sectionHeader}>
          {icon && (
            <View style={[styles.sectionIcon, isProfile && styles.profileIcon]}>
              <Ionicons name={icon} size={18} color={accent} />
            </View>
          )}
          <View style={styles.sectionText}>
            {title ? (
              <Text
                style={[styles.sectionTitle, isProfile && styles.profileTitle]}
              >
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text
                style={[
                  styles.sectionSubtitle,
                  isProfile && styles.profileSubtitle
                ]}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}
      {meta && meta.length > 0 && (
        <View style={styles.sectionMetaGrid}>
          <View style={styles.sectionMetaStack}>
            <View style={styles.sectionMetaIcon}>
              <Ionicons name="resize-outline" size={14} color={accent} />
            </View>
            <Text style={styles.sectionMetaLabel}>身高</Text>
            <Text style={styles.sectionMetaValue}>{meta[0]}</Text>
          </View>
          <View style={styles.sectionMetaStack}>
            <View style={styles.sectionMetaIcon}>
              <Ionicons name="scale-outline" size={14} color={accent} />
            </View>
            <Text style={styles.sectionMetaLabel}>体重</Text>
            <Text style={styles.sectionMetaValue}>{meta[1]}</Text>
          </View>
          <View style={styles.sectionMetaStack}>
            <View style={styles.sectionMetaIcon}>
              <Ionicons
                name="radio-button-on-outline"
                size={14}
                color={accent}
              />
            </View>
            <Text style={styles.sectionMetaLabel}>头围</Text>
            <Text style={styles.sectionMetaValue}>{meta[2]}</Text>
          </View>
        </View>
      )}
      {children ? (
        <View style={[styles.sectionBody, isFull && styles.sectionBodyFlat]}>
          {children}
        </View>
      ) : null}
      {cta && onPress && (
        <View style={styles.sectionFooter}>
          <Text style={styles.sectionCta}>{cta}</Text>
          <View style={styles.sectionArrow}>
            <Text style={styles.sectionArrowText}>›</Text>
          </View>
        </View>
      )}
    </Wrapper>
  )
}

export default function GrowthRecord() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { currentBabyId, currentBabyDetail, babiesList, growthCurve } =
    useAppSelector(state => state.baby)
  const activeBabyDetail =
    currentBabyDetail && currentBabyDetail.baby_id === currentBabyId
      ? currentBabyDetail
      : null
  const hasHeightHistory = growthCurve.height.length > 0
  const hasWeightHistory = growthCurve.weight.length > 0
  const hasHeadHistory = growthCurve.head.length > 0
  const [avatarLoadError, setAvatarLoadError] = useState(false)
  const babyAvatar =
    activeBabyDetail?.avatar ||
    babiesList.find(item => item.baby_id === currentBabyId)?.avatar
  const babyName =
    activeBabyDetail?.name ||
    babiesList.find(item => item.baby_id === currentBabyId)?.name ||
    '宝'
  const hasAvatar =
    typeof babyAvatar === 'string' && babyAvatar.trim().length > 0
  const avatarSource: ImageSourcePropType = hasAvatar
    ? { uri: babyAvatar }
    : require('../../assets/testAvatar.png')

  useEffect(() => {
    setAvatarLoadError(false)
  }, [currentBabyId, babyAvatar])

  useFocusEffect(
    useCallback(() => {
      if (!currentBabyId) return
      if (!activeBabyDetail) {
        dispatch(fetchBabyProfile(currentBabyId))
      }
      dispatch(
        fetchGrowthCurve({
          baby_id: currentBabyId,
          metric: 'height',
          group_by: 'day'
        })
      )
      dispatch(
        fetchGrowthCurve({
          baby_id: currentBabyId,
          metric: 'weight',
          group_by: 'day'
        })
      )
      dispatch(
        fetchGrowthCurve({
          baby_id: currentBabyId,
          metric: 'head_circumference',
          group_by: 'day'
        })
      )
    }, [dispatch, currentBabyId, activeBabyDetail])
  )
  const heightText =
    hasHeightHistory && activeBabyDetail?.height
      ? `${activeBabyDetail.height} cm`
      : '--'
  const weightText =
    hasWeightHistory && activeBabyDetail?.weight
      ? `${activeBabyDetail.weight} kg`
      : '--'
  const headText =
    hasHeadHistory && activeBabyDetail?.head_circumference
      ? `${activeBabyDetail.head_circumference} cm`
      : '--'
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 顶部背景装饰 */}
      <View style={styles.headerBackgroundContainer}>
        <LinearGradient
          colors={['#fff1f2', '#ffffff']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.headerGradient, { height: 200 + insets.top }]}
        />
        <View style={styles.headerCurve} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* 顶部头部区域 */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>成长记录</Text>
            <Text style={styles.headerSubtitle}>
              记录宝宝成长的每一个精彩瞬间
            </Text>
          </View>
          <View style={styles.avatarWrapper}>
            {hasAvatar && !avatarLoadError ? (
              <ImageBackground
                source={avatarSource}
                style={styles.headerAvatar}
                imageStyle={{ borderRadius: 28 }}
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {babyName.slice(0, 1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 模块列表 */}
        <View style={styles.moduleList}>
          <Section
            accent="#f43f5e"
            meta={[heightText, weightText, headText]}
            variant="profile"
          />
          <Section
            accent="#fb7185"
            onPress={() => navigation.navigate('GrowthCurve')}
            variant="full"
          >
            <View pointerEvents="none">
              <CurveHeightChart
                compact
                initialRange="day"
                headlineValue={
                  hasHeightHistory ? activeBabyDetail?.height : undefined
                }
              />
            </View>
            <View style={styles.chartHintRow}>
              <Text style={styles.chartHintText}>
                点击图表查看更多
                <Text style={styles.chartHintArrow}> ›</Text>
              </Text>
            </View>
          </Section>
          <Section
            title="宝宝相册"
            subtitle="精选照片，定格美好瞬间"
            accent="#fda4af"
            cta="打开相册"
            icon="images-outline"
            onPress={() => navigation.navigate('Album')}
          />
          <Section
            title="大事记"
            subtitle="记录每个重要时刻"
            accent="#ef4444"
            cta="写日记"
            icon="book-outline"
            onPress={() => navigation.navigate('AddMilestone')}
          />
        </View>

        {/* 底部装饰 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>—— 记录宝宝成长的每一天 ——</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff' // 保持整体背景干净
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  headerGradient: {
    width: '100%'
  },
  headerCurve: {
    height: 24,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -24
  },
  scrollView: {
    flex: 1,
    zIndex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 10
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 20
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 6
  },
  avatarWrapper: {
    position: 'relative',
    padding: 2,
    backgroundColor: '#fff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ffe4e6'
  },
  headerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarFallbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f43f5e'
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  moduleList: {
    gap: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionText: {
    flex: 1
  },
  sectionMetaInline: {
    marginTop: 10,
    marginLeft: 38,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280'
  },
  sectionMetaGrid: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8
  },
  sectionBody: {
    marginTop: 12
  },
  sectionBodyFlat: {
    marginTop: 0,
    marginHorizontal: -20
  },
  chartHintRow: {
    marginTop: 6,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  chartHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f43f5e',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  chartHintArrow: {
    fontSize: 16,
    color: '#f43f5e',
    marginTop: -1
  },
  sectionMetaStack: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  sectionMetaIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  sectionMetaLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600'
  },
  sectionMetaValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ffe4e6',
    padding: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2
  },
  sectionCardFlat: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowOpacity: 0,
    elevation: 0
  },
  profileCard: {
    backgroundColor: '#fff5f7',
    borderColor: '#fbcfe8',
    shadowOpacity: 0.12
  },
  profileCardFlat: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 4,
    shadowOpacity: 0,
    elevation: 0
  },
  profileTitle: {
    color: '#111827'
  },
  profileSubtitle: {
    color: '#f43f5e'
  },
  profileMetaInline: {
    color: '#111827'
  },
  profileIcon: {
    backgroundColor: '#ffe4e6'
  },
  sectionFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f43f5e'
  },
  sectionArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2'
  },
  sectionArrowText: {
    fontSize: 16,
    color: '#f43f5e',
    marginTop: -1
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.5
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500'
  }
})
