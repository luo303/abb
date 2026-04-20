import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import {
  View,
  StyleSheet,
  Platform,
  Text,
  Animated,
  DeviceEventEmitter,
  TouchableOpacity
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { Stack } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import dayjs from 'dayjs'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from 'react-native-paper'
import { useNavigationHelper } from '../../utils/navigation'
import ExportButton from '../../components/export/ExportButton'
import { APP_COLORS } from '../../theme/paperTheme'

// 导入日常记录组件
import DashboardRing from '../../components/DailyRecord/DashboardRing'
import RecordCard from '../../components/DailyRecord/RecordCard'
import EmptyState from '../../components/DailyRecord/EmptyState'

// 导入类型定义和模拟数据
import { RecordType, RecordItem, Statistics } from '../../types/recordTypes'
import {
  fetchDiaperList,
  setCurrentDate
} from '../../store/modules/diaperStore'
import { fetchFeedingList } from '../../store/modules/feedingStore'
import { fetchSleepList } from '../../store/modules/sleepStore'
import {
  fetchDailyStatistics,
  setCurrentDate as setDailyCurrentDate
} from '../../store/modules/dailyStore'
import { RootState, AppDispatch } from '../../store'

export default function DailyRecordScreen() {
  const { navigateToRecord } = useNavigationHelper()
  const dispatch = useDispatch<AppDispatch>()
  const babyId = useSelector((state: RootState) => state.baby.currentBabyId)
  const diaperList = useSelector((state: RootState) => state.diaper.diaperList)
  const feedingList = useSelector(
    (state: RootState) => state.feeding.feedingList
  )
  const sleepList = useSelector((state: RootState) => state.sleep.sleepList)
  const dailyStatistics = useSelector(
    (state: RootState) => state.daily.statistics
  )
  const isLoading = useSelector(
    (state: RootState) =>
      state.feeding.loading || state.diaper.isLoading || state.sleep.loading
  )

  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  )
  const [currentRecords, setCurrentRecords] = useState<RecordItem[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [recordFilter, setRecordFilter] = useState<RecordType | 'all'>('all')
  const [statistics, setStatistics] = useState<Statistics>({
    feedingCount: 0,
    feedingVolume: 0,
    sleepCount: 0,
    sleepDuration: 0,
    diaperCount: 0
  })
  const scrollY = useRef(new Animated.Value(0)).current

  // 初始化数据 - 添加防抖处理
  useEffect(() => {
    if (babyId) {
      // 防抖处理，避免快速切换日期时的重复请求
      const timer = setTimeout(() => {
        // 确保 diaper store 中的日期与 selectedDate 一致
        dispatch(setCurrentDate(selectedDate.replace(/-/g, '')))
        dispatch(setDailyCurrentDate(selectedDate.replace(/-/g, '')))
        dispatch(fetchDiaperList({ babyId, date: selectedDate }))
        dispatch(fetchFeedingList({ babyId, date: selectedDate }))
        dispatch(fetchSleepList({ babyId, date: selectedDate }))
        dispatch(fetchDailyStatistics({ babyId, date: selectedDate }))
      }, 300)

      return () => clearTimeout(timer)
    } else {
      // 如果没有选中宝宝，清空统计数据
      setStatistics({
        feedingCount: 0,
        feedingVolume: 0,
        sleepCount: 0,
        sleepDuration: 0,
        diaperCount: 0
      })
      setCurrentRecords([])
    }
  }, [babyId, selectedDate, dispatch])

  // 监听仪表盘刷新事件
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'refreshDashboard',
      () => {
        if (babyId) {
          // 确保 diaper store 中的日期与 selectedDate 一致
          dispatch(setCurrentDate(selectedDate.replace(/-/g, '')))
          dispatch(setDailyCurrentDate(selectedDate.replace(/-/g, '')))
          // 只获取其他类型的记录，保留本地的喂养和睡眠记录
          // 不重新获取喂养记录，避免被mock数据覆盖
          // dispatch(fetchFeedingList({ babyId, date: selectedDate }))
          // 不重新获取睡眠记录，避免覆盖本地创建的记录
          // dispatch(fetchSleepList({ babyId, date: selectedDate }))
          dispatch(fetchDiaperList({ babyId, date: selectedDate }))
          dispatch(fetchDailyStatistics({ babyId, date: selectedDate }))
        }
      }
    )

    return () => {
      subscription.remove()
    }
  }, [babyId, selectedDate, dispatch])

  // 根据选中日期更新记录和统计
  useEffect(() => {
    const normalizeInlineText = (value?: string) => {
      if (!value) return ''
      return value.replace(/#/g, ' ').replace(/\s+/g, ' ').trim()
    }

    const truncateText = (value: string, maxLength: number) => {
      if (value.length <= maxLength) return value
      return value.substring(0, maxLength) + '...'
    }

    const stripLeadingFeedTypeLabel = (value: string) => {
      return value.replace(/^(奶粉|母乳|泵奶|辅食)\s*/i, '').trim()
    }

    const normalizeUnitText = (value: string) => {
      return value
        .replace(/(\d+(?:\.\d+)?)\s*min\b/gi, '$1分钟')
        .replace(/(\d+(?:\.\d+)?)\s*g\b/gi, '$1g')
        .replace(/(\d+(?:\.\d+)?)\s*ml\b/gi, '$1ml')
        .trim()
    }

    // 从 diaperList 中筛选出当前日期的记录
    const diaperRecords = diaperList
      .filter(item => {
        const itemDate = dayjs(item.change_time).format('YYYY-MM-DD')
        return itemDate === selectedDate
      })
      .map(item => {
        // 构建描述文本
        let description = ''
        let primaryDetail = '尿布'
        const tags: string[] = []

        const diaperTypeLabelMap: Record<string, string> = {
          pee: '嘘嘘',
          poop: '便便',
          both: '嘘嘘+便便',
          dry: '干爽'
        }
        primaryDetail = diaperTypeLabelMap[item.diaper_type.id] || '尿布'

        if (item.diaper_type.id === 'dry') {
          // 如果是干爽类型，显示备注信息并适当省略，过滤掉换行符
          if (item.remark) {
            const cleanRemark = normalizeInlineText(item.remark)
            description =
              cleanRemark.length > 10
                ? cleanRemark.substring(0, 10) + '...'
                : cleanRemark
          }
        } else {
          // 其他类型显示颜色和性状信息
          if (item.poop_color || item.poop_consistency || item.pee_color) {
            const parts = []
            const tagSet = new Set<string>()

            if (item.poop_color) {
              parts.push(item.poop_color.name)
              tagSet.add(item.poop_color.name)
            }
            if (item.pee_color) {
              parts.push(item.pee_color.name)
              tagSet.add(item.pee_color.name)
            }
            if (item.poop_consistency) {
              parts.push(item.poop_consistency.name)
              tagSet.add(item.poop_consistency.name)
            }

            // 将 Set 转换为数组，确保标签不重复
            tags.push(...tagSet)
            description = parts.join(' ')
          }
        }

        // 根据尿布类型选择图标
        let icon = 'diaper-dry'
        switch (item.diaper_type.id) {
          case 'pee':
            icon = 'diaper-pee'
            break
          case 'poop':
            icon = 'diaper-poop'
            break
          case 'both':
            icon = 'diaper-both'
            break
          case 'dry':
            icon = 'diaper-dry'
            break
        }

        return {
          id: `diaper_${item.diaper_id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: 'diaper' as const,
          time: item.change_time,
          details: description,
          icon: icon,
          name: '尿布',
          title: '尿布',
          description: description,
          primaryDetail,
          secondaryDetail: description || '暂无更多描述',
          categoryLabel: '尿布',
          tags: tags.slice(0, 2)
        }
      })

    // 从 feedingList 中筛选出当前日期的记录
    const feedingRecords = feedingList
      .filter(item => {
        // 确保feed_time是有效的时间戳
        const feedTime = item.feed_time
        if (!feedTime || isNaN(feedTime)) {
          return false
        }

        const itemDate = dayjs(feedTime).format('YYYY-MM-DD')
        return itemDate === selectedDate
      })
      .map(item => {
        const feedType = item.feed_type as unknown as string

        // 根据喂养类型选择图标
        let icon = 'feeding-milk'
        switch (feedType) {
          case 'formula':
            icon = 'feeding-milk'
            break
          case 'breast':
          case 'breast_milk':
          case 'pump':
          case 'pumped_milk':
            icon = 'feeding-milk'
            break
          case 'food':
          case 'solid':
            icon = 'feeding-food'
            break
        }

        // 将feed_type枚举值转换为中文名称
        let feedTypeName = '喂养'
        switch (feedType) {
          case 'breast':
          case 'breast_milk':
            feedTypeName = '母乳'
            break
          case 'pump':
          case 'pumped_milk':
            feedTypeName = '泵奶'
            break
          case 'formula':
            feedTypeName = '奶粉'
            break
          case 'food':
          case 'solid':
            feedTypeName = '辅食'
            break
        }

        // 构建结构化信息
        const normalizedRemark = normalizeInlineText(item.remark)
        let amountText = ''
        let secondaryText = ''

        if (typeof item.amount === 'number' && !isNaN(item.amount)) {
          amountText =
            feedType === 'food' || feedType === 'solid'
              ? `${item.amount}g`
              : `${item.amount}ml`
        }

        if (typeof item.duration === 'number' && !isNaN(item.duration)) {
          secondaryText = `${item.duration}分钟`
        } else if (normalizedRemark) {
          secondaryText = normalizedRemark
        }

        if (amountText) {
          amountText = stripLeadingFeedTypeLabel(amountText)
          amountText = normalizeUnitText(amountText)
        }

        if (secondaryText) {
          secondaryText = stripLeadingFeedTypeLabel(secondaryText)
          secondaryText = normalizeUnitText(secondaryText)
        }

        const primaryDetail = amountText
          ? `${feedTypeName} · ${amountText}`
          : feedTypeName
        const secondaryDetail = secondaryText
          ? truncateText(secondaryText, 24)
          : '暂无备注'

        // 确保返回的对象包含所有必要字段
        return {
          id: `feeding_${item.feeding_id}`,
          type: 'feeding' as const,
          time: item.feed_time,
          details: primaryDetail,
          icon: icon,
          name: '喂养',
          title: '喂养',
          description: secondaryDetail,
          primaryDetail,
          secondaryDetail,
          categoryLabel: feedTypeName,
          tags: [feedTypeName]
        }
      })

    // 从 sleepList 中筛选出当前日期的记录
    const sleepRecords = sleepList
      .filter(item => {
        // 检查时间戳是否有效
        const isValidTimestamp =
          typeof item.started_at === 'number' && !isNaN(item.started_at)
        if (!isValidTimestamp) {
          return false
        }

        const itemDate = dayjs(item.started_at).format('YYYY-MM-DD')
        return itemDate === selectedDate
      })
      .map(item => {
        const durationMs = item.duration_ms || 0

        // 格式化开始时间和结束时间
        const startTime = dayjs(item.started_at).format('HH:mm')
        const endTime = dayjs(item.ended_at).format('HH:mm')

        // 获取开始时间和结束时间的小时部分
        const startHour = dayjs(item.started_at).hour()
        const endHour = dayjs(item.ended_at).hour()

        // 构建时长文本
        let durationText = ''
        const durationSeconds = Math.floor(durationMs / 1000)
        let h = Math.floor(durationSeconds / 3600) % 24 // 对小时数取模 24
        // 如果开始时间和结束时间的小时相同，将小时部分设置为 0
        if (startHour === endHour) {
          h = 0
        }
        const m = Math.floor((durationSeconds % 3600) / 60)
        // 判断是否为手动记录
        const isManual = item.session_id?.includes('manual-session') || false
        const s = isManual ? 0 : durationSeconds % 60

        // 确保小时显示为两位数，并且如果小时为 0，显示为 00
        const formattedH = String(h).padStart(2, '0')
        const formattedM = String(m).padStart(2, '0')
        const formattedS = String(s).padStart(2, '0')

        durationText = `${formattedH}:${formattedM}:${formattedS}`

        const primaryDetail = `${startTime} - ${endTime}`
        const secondaryDetail = `时长 ${durationText}${isManual ? ' · 手动记录' : ''}`

        const icon = isManual ? 'sleep-manual' : 'sleep'

        return {
          id: `sleep_${item.session_id}`,
          type: 'sleep' as const,
          time: item.started_at,
          details: primaryDetail,
          icon: icon,
          name: '睡眠',
          title: '睡眠',
          description: secondaryDetail,
          primaryDetail,
          secondaryDetail,
          categoryLabel: isManual ? '手动睡眠' : '自动睡眠',
          tags: isManual ? ['手动'] : ['自动'],
          data: item // 添加原始数据，用于统计计算
        }
      })

    // 合并并按时间降序排序
    const allRecords = [
      // ...mockRecords,
      ...diaperRecords,
      ...feedingRecords,
      ...sleepRecords
    ].sort((a, b) => {
      const timeA =
        typeof a.time === 'string' ? new Date(a.time).getTime() : a.time
      const timeB =
        typeof b.time === 'string' ? new Date(b.time).getTime() : b.time
      return timeB - timeA
    })

    setCurrentRecords(allRecords)

    // 总是使用本地计算的统计数据，基于当前列表
    let feedingCount = 0
    let feedingVolume = 0 // 保留字段但不使用
    let sleepCount = 0
    let sleepDuration = 0 // 以小时为单位，保留小数
    let diaperCount = 0

    allRecords.forEach(record => {
      switch (record.type) {
        case 'feeding':
          feedingCount++
          break
        case 'sleep':
          sleepCount++
          // 从record.data中直接获取duration_ms
          if (record.data && typeof record.data.duration_ms === 'number') {
            // 确保duration_ms是正数，计算总毫秒数
            if (record.data.duration_ms > 0) {
              sleepDuration += record.data.duration_ms
            }
          } else {
            // 如果没有duration_ms，尝试从details中提取
            // 匹配 HH:MM:SS 格式
            const durationMatch = record.details?.match(/(\d+):(\d+):(\d+)/)
            if (durationMatch) {
              const hours = parseInt(durationMatch[1])
              const minutes = parseInt(durationMatch[2])
              const seconds = parseInt(durationMatch[3])
              // 转换为毫秒并累加
              sleepDuration += (hours * 3600 + minutes * 60 + seconds) * 1000
            }
          }
          break
        case 'diaper':
          diaperCount++
          break
      }
    })

    // 将总毫秒数转换为整数小时
    sleepDuration = Math.floor(sleepDuration / (1000 * 60 * 60))

    setStatistics({
      feedingCount,
      feedingVolume,
      sleepCount,
      sleepDuration,
      diaperCount
    })
  }, [selectedDate, diaperList, feedingList, sleepList, dailyStatistics])

  // 处理底部按钮点击
  const handleActionPress = useCallback(
    (type: RecordType) => {
      navigateToRecord(type)
    },
    [navigateToRecord]
  )

  // 处理日期选择器确认
  const handleDatePickerConfirm = (event: any, date?: Date) => {
    // Android需要手动关闭picker
    if (Platform.OS === 'android') {
      setShowDatePicker(false)
    }

    if (date) {
      const selectedDate = dayjs(date).format('YYYY-MM-DD')
      setSelectedDate(selectedDate)
    }
  }

  // 目标值设置
  const feedingTarget = 8 // 每日喂养目标8次
  const sleepTarget = 12 // 每日睡眠目标12小时
  const diaperTarget = 8 // 每日换尿布目标8次

  // 计算百分比
  const feedingPercent = Math.min(
    Math.round((statistics.feedingCount / feedingTarget) * 100),
    100
  )
  const sleepPercent = Math.min(
    Math.round((statistics.sleepDuration / sleepTarget) * 100),
    100
  )
  const diaperPercent = Math.min(
    Math.round((statistics.diaperCount / diaperTarget) * 100),
    100
  )

  const overallPercent =
    currentRecords.length > 0
      ? Math.round((feedingPercent + sleepPercent + diaperPercent) / 3)
      : 0

  // 处理无数据情况
  const getDisplayValue = (value: number, unit: string) => {
    // 对于睡眠时长，只显示整数小时
    if (unit === 'h') {
      const hours = Math.floor(value)
      return `${hours}h`
    }

    // 对于其他单位，保持原格式
    return `${value}${unit}`
  }

  // 切换到前一天
  const handlePreviousDay = () => {
    const previousDate = dayjs(selectedDate)
      .subtract(1, 'day')
      .format('YYYY-MM-DD')
    setSelectedDate(previousDate)
  }

  // 切换到后一天（不超过今天）
  const handleNextDay = () => {
    const today = dayjs().format('YYYY-MM-DD')
    const nextDate = dayjs(selectedDate).add(1, 'day').format('YYYY-MM-DD')
    if (nextDate <= today) {
      setSelectedDate(nextDate)
    }
  }

  const filteredRecords = useMemo(() => {
    if (recordFilter === 'all') return currentRecords
    return currentRecords.filter(item => item.type === recordFilter)
  }, [currentRecords, recordFilter])

  const heroScale = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0.96],
    extrapolate: 'clamp'
  })
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [0, -10],
    extrapolate: 'clamp'
  })
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.92],
    extrapolate: 'clamp'
  })

  const ListHeaderComponent = useCallback(() => {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>记录</Text>
        <Text style={styles.listHeaderMeta}>{filteredRecords.length}条</Text>
      </View>
    )
  }, [filteredRecords.length])

  const renderItem = useCallback(
    ({ item }: { item: RecordItem }) => (
      <View style={styles.recordsListContainer}>
        <RecordCard item={item} />
      </View>
    ),
    []
  )

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.recordsListContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <EmptyState
            onAddFeeding={() => handleActionPress('feeding')}
            onAddSleep={() => handleActionPress('sleep')}
            onAddDiaper={() => handleActionPress('diaper')}
          />
        )}
      </View>
    ),
    [handleActionPress, isLoading]
  )

  const ListFooterComponent = useCallback(() => {
    return <View style={styles.listFooterSpacer} />
  }, [])

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '日常记录' }} />

      <Animated.View
        style={[
          styles.heroContainer,
          {
            transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
            opacity: heroOpacity
          }
        ]}
      >
        <View style={styles.heroHeaderRow}>
          <Button
            compact
            mode="text"
            onPress={handlePreviousDay}
            style={styles.navButton}
            contentStyle={styles.navButtonContent}
            labelStyle={styles.navButtonLabel}
            icon="chevron-left"
            uppercase={false}
          >
            {' '}
          </Button>

          <View style={styles.datePickerContainer}>
            {Platform.OS === 'ios' ? (
              <DateTimePicker
                value={new Date(selectedDate)}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={handleDatePickerConfirm}
              />
            ) : (
              <>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateTextContainer}
                  contentStyle={styles.dateButtonContent}
                  labelStyle={styles.dateText}
                  uppercase={false}
                >
                  {selectedDate}
                </Button>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(selectedDate)}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleDatePickerConfirm}
                  />
                )}
              </>
            )}
          </View>

          <Button
            compact
            mode="text"
            onPress={handleNextDay}
            style={styles.navButton}
            contentStyle={styles.navButtonContent}
            labelStyle={styles.navButtonLabel}
            icon="chevron-right"
            uppercase={false}
          >
            {' '}
          </Button>
        </View>

        <View style={styles.overallProgressTrack}>
          <LinearGradient
            colors={[APP_COLORS.secondary, APP_COLORS.primaryStrong]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.overallProgressFill,
              { width: `${overallPercent}%` }
            ]}
          />
        </View>

        <View style={styles.dashboardCard}>
          <DashboardRing
            type="feeding"
            value={getDisplayValue(statistics.feedingCount, '次')}
            percent={currentRecords.length > 0 ? feedingPercent : 0}
            onPress={() => handleActionPress('feeding')}
          />
          <DashboardRing
            type="sleep"
            value={getDisplayValue(statistics.sleepDuration, 'h')}
            percent={currentRecords.length > 0 ? sleepPercent : 0}
            onPress={() => handleActionPress('sleep')}
          />
          <DashboardRing
            type="diaper"
            value={getDisplayValue(statistics.diaperCount, '次')}
            percent={currentRecords.length > 0 ? diaperPercent : 0}
            onPress={() => handleActionPress('diaper')}
          />
        </View>

        <View style={styles.filterContainer}>
          {(
            [
              { key: 'all', label: '全部' },
              { key: 'feeding', label: '喂养' },
              { key: 'sleep', label: '睡眠' },
              { key: 'diaper', label: '尿布' }
            ] as const
          ).map(item => {
            const active = recordFilter === item.key
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.86}
                onPress={() => setRecordFilter(item.key)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    active && styles.segmentLabelActive
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </Animated.View>

      {/* 2. 主列表区域 */}
      <AnimatedFlashList
        data={filteredRecords}
        renderItem={renderItem}
        keyExtractor={(item: RecordItem) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />

      {/* 导出按钮 */}
      <ExportButton
        recordType="daily"
        data={{
          babyId: babyId,
          date: selectedDate,
          records: currentRecords,
          statistics: statistics
        }}
      />
    </View>
  )
}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList) as any

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  },
  heroContainer: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  datePickerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateTextContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4
  },
  dateButtonContent: {
    minHeight: 42,
    paddingHorizontal: 10
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.primary
  },
  navButton: {
    borderRadius: 20
  },
  navButtonContent: {
    minHeight: 40,
    width: 40
  },
  navButtonLabel: {
    marginHorizontal: 0
  },
  overallProgressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: APP_COLORS.outlineVariant,
    overflow: 'hidden',
    marginBottom: 12
  },
  overallProgressFill: {
    height: '100%',
    borderRadius: 999
  },
  dashboardCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    ...(Platform.select({
      ios: {
        shadowColor: APP_COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18
      },
      android: {
        elevation: 4
      }
    }) as any)
  },
  filterContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    padding: 4,
    borderRadius: 16,
    backgroundColor: APP_COLORS.surfaceVariant,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentItemActive: {
    backgroundColor: APP_COLORS.surface,
    ...(Platform.select({
      ios: {
        shadowColor: APP_COLORS.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18
      },
      android: {
        elevation: 4
      }
    }) as any)
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: APP_COLORS.textMuted
  },
  segmentLabelActive: {
    color: APP_COLORS.text
  },
  listHeader: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  listHeaderMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textMuted
  },
  recordsListContainer: {
    paddingHorizontal: 16,
    zIndex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  loadingText: {
    fontSize: 16,
    color: APP_COLORS.textMuted
  },
  listFooterSpacer: {
    height: 40
  }
})
