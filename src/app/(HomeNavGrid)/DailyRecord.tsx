import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Text,
  Animated,
  DeviceEventEmitter
} from 'react-native'
import { Stack, useNavigation } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { Button } from '@ant-design/react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigationHelper } from '../../utils/navigation'

// 导入日常记录组件
import DashboardRing from '../../components/DailyRecord/DashboardRing'
import RecordCard from '../../components/DailyRecord/RecordCard'
import EmptyState from '../../components/DailyRecord/EmptyState'

// 导入类型定义和模拟数据
import { RecordType, RecordItem, Statistics } from '../../types/recordTypes'
import { DiaperItem } from '../../types/diaper'
import { FeedingItem } from '../../types/feeding'
import { SleepRecord } from '../../types/sleep'
import mockData from '../../data/mock/dailyRecordMock'
import { fetchDiaperList } from '../../store/modules/diaperStore'
import { fetchFeedingList } from '../../store/modules/feedingStore'
import { fetchSleepList } from '../../store/modules/sleepStore'
import { fetchDailyStatistics } from '../../store/modules/dailyStore'
import { RootState, AppDispatch } from '../../store'

export default function DailyRecordScreen() {
  const { navigateToRecord } = useNavigationHelper()
  const navigation = useNavigation()
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
  const [statistics, setStatistics] = useState<Statistics>({
    feedingCount: 0,
    feedingVolume: 0,
    sleepCount: 0,
    sleepDuration: 0,
    diaperCount: 0
  })
  const animatedBackgroundValue = useState(new Animated.Value(0))[0]

  // 初始化数据 - 添加防抖处理
  useEffect(() => {
    if (babyId) {
      // 防抖处理，避免快速切换日期时的重复请求
      const timer = setTimeout(() => {
        dispatch(fetchDiaperList(babyId))
        dispatch(fetchFeedingList({ babyId, date: selectedDate }))
        dispatch(fetchSleepList({ babyId, date: selectedDate }))
        dispatch(fetchDailyStatistics({ babyId, date: selectedDate }))
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [babyId, selectedDate, dispatch])

  // 监听仪表盘刷新事件
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'refreshDashboard',
      () => {
        if (babyId) {
          dispatch(fetchFeedingList({ babyId, date: selectedDate }))
          dispatch(fetchDiaperList(babyId))
          dispatch(fetchSleepList({ babyId, date: selectedDate }))
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
    // 获取 mock 数据
    const mockRecords = mockData[selectedDate] || []

    // 从 diaperList 中筛选出当前日期的记录
    const diaperRecords = diaperList
      .filter(item => {
        const itemDate = dayjs(item.change_time).format('YYYY-MM-DD')
        return itemDate === selectedDate
      })
      .map(item => {
        // 构建描述文本
        let description = ''
        if (item.diaper_type.id === 'dry') {
          // 如果是干爽类型，显示备注信息并适当省略，过滤掉换行符
          if (item.remark) {
            const cleanRemark = item.remark.replace(/\n/g, ' ').trim()
            description =
              cleanRemark.length > 10
                ? cleanRemark.substring(0, 10) + '...'
                : cleanRemark
          }
        } else {
          // 其他类型显示颜色和性状信息
          if (item.poop_color || item.poop_consistency) {
            const parts = []
            if (item.poop_color) {
              parts.push(item.poop_color.name)
            }
            if (item.poop_consistency) {
              parts.push(item.poop_consistency.name)
            }
            description = parts.join(' | ')
          }
        }

        return {
          id: item.diaper_id,
          type: 'diaper' as const,
          time: item.change_time,
          details: description,
          icon: 'baby-carriage',
          name: '尿布',
          title: '尿布',
          description: description
        }
      })

    // 从 feedingList 中筛选出当前日期的记录
    const feedingRecords = feedingList
      .filter(item => {
        const itemDate = dayjs(item.feed_time).format('YYYY-MM-DD')
        return itemDate === selectedDate
      })
      .map(item => {
        // 固定图标为baby-bottom
        const icon = 'baby-bottle'

        // 将feed_type枚举值转换为中文名称
        let feedTypeName = '喂养'
        switch (item.feed_type) {
          case 'breast':
            feedTypeName = '母乳'
            break
          case 'pump':
            feedTypeName = '泵奶'
            break
          case 'formula':
            feedTypeName = '奶粉'
            break
          case 'food':
            feedTypeName = '辅食'
            break
        }

        // 构建副标题：喂养类型 + 时长或备注
        let description = feedTypeName
        if (item.duration) {
          description += ` · ${item.duration}分钟`
        } else if (item.remark) {
          description += ` · ${item.remark.length > 10 ? item.remark.substring(0, 10) + '...' : item.remark}`
        }

        return {
          id: item.feeding_id,
          type: 'feeding' as const,
          time: item.feed_time,
          details: description,
          icon: icon,
          name: '喂养',
          title: '喂养',
          description: description
        }
      })

    // 从 sleepList 中筛选出当前日期的记录
    const sleepRecords = sleepList
      .filter(item => {
        const itemDate = dayjs(item.started_at).format('YYYY-MM-DD')
        return itemDate === selectedDate
      })
      .map(item => {
        const durationMs = item.duration_ms || 0
        const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
        const durationMinutes = Math.floor(
          (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        )

        // 格式化开始时间和结束时间
        const startTime = dayjs(item.started_at).format('HH:mm')
        const endTime = dayjs(item.ended_at).format('HH:mm')

        // 构建时长文本
        let durationText = ''
        if (durationHours > 0) {
          durationText = `${durationHours}小时${durationMinutes}分`
        } else {
          durationText = `${durationMinutes}分`
        }

        // 构建副标题
        const description = `${startTime} - ${endTime} · ${durationText}`

        return {
          id: item.session_id,
          type: 'sleep' as const,
          time: item.started_at,
          details: description,
          icon: 'sleep',
          name: '睡眠',
          title: '睡眠',
          description: description
        }
      })

    // 合并并按时间降序排序
    const allRecords = [
      ...mockRecords,
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

    // 使用从 Redux store 中获取的统计数据
    if (dailyStatistics) {
      setStatistics({
        feedingCount: dailyStatistics.feeding.totalCount || 0,
        feedingVolume: 0, // 保留字段但不使用
        sleepCount: 0, // 保留字段但不使用
        sleepDuration:
          (dailyStatistics.sleep.totalDuration || 0) / (1000 * 60 * 60), // 转换为小时
        diaperCount: dailyStatistics.diaper.totalCount || 0
      })
    } else {
      // 如果没有统计数据，使用本地计算的统计数据
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
            // 计算实际睡眠时长（从details中提取或使用默认值）
            // 假设details格式为 "HH:MM - HH:MM · X小时X分"
            const durationMatch = record.details?.match(/(\d+)小时(\d+)分/)
            if (durationMatch) {
              const hours = parseInt(durationMatch[1])
              const minutes = parseInt(durationMatch[2])
              sleepDuration += hours + minutes / 60
            } else {
              // 如果无法提取时长，使用默认值1.5小时
              sleepDuration += 0
            }
            break
          case 'diaper':
            diaperCount++
            break
        }
      })

      setStatistics({
        feedingCount,
        feedingVolume,
        sleepCount,
        sleepDuration,
        diaperCount
      })
    }
  }, [selectedDate, diaperList, feedingList, sleepList, dailyStatistics])

  // 计算整体进度并更新背景颜色
  useEffect(() => {
    // 目标值设置
    const feedingTarget = 8 // 每日喂养目标8次
    const sleepTarget = 12 // 每日睡眠目标12小时
    const diaperTarget = 8 // 每日换尿布目标8次

    // 计算各项目进度
    const feedingProgress = Math.min(
      (statistics.feedingCount / feedingTarget) * 100,
      100
    )
    const sleepProgress = Math.min(
      (statistics.sleepDuration / sleepTarget) * 100,
      100
    )
    const diaperProgress = Math.min(
      (statistics.diaperCount / diaperTarget) * 100,
      100
    )

    // 计算平均进度
    const averageProgress =
      (feedingProgress + sleepProgress + diaperProgress) / 3

    // 启动背景颜色动画
    Animated.timing(animatedBackgroundValue, {
      toValue: averageProgress,
      duration: 1000,
      useNativeDriver: false
    }).start()
  }, [statistics, animatedBackgroundValue])

  // 处理底部按钮点击
  const handleActionPress = (type: RecordType) => {
    navigateToRecord(type)
  }

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

  // 处理无数据情况
  const getDisplayValue = (value: number, unit: string) => {
    if (value === 0) {
      return '--'
    }

    // 对于睡眠时长，显示为小时和分钟格式
    if (unit === 'h') {
      const hours = Math.floor(value)
      const minutes = Math.round((value - hours) * 60)
      if (minutes === 0) {
        return `${hours}h`
      } else {
        return `${hours}h${minutes}m`
      }
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

  // 动态计算背景颜色
  const animatedBackgroundColor = animatedBackgroundValue.interpolate({
    inputRange: [0, 25, 50, 75, 100],
    outputRange: ['#ffffff', '#ffeeee', '#ffdddd', '#ffcccc', '#ffaaaa']
  })

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '日常记录' }} />

      {/* 动态背景颜色 */}
      <Animated.View
        style={[
          styles.backgroundView,
          { backgroundColor: animatedBackgroundColor }
        ]}
      />

      {/* 1. 日历Header - 保持固定 */}
      <View style={styles.calendarHeader}>
        <View style={styles.headerContent}>
          <Button
            type="ghost"
            size="large"
            onPress={handlePreviousDay}
            style={{
              borderWidth: 0,
              paddingVertical: 8,
              paddingHorizontal: 12
            }}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#f43f5e"
            />
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
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateTextContainer}
                >
                  <Text style={styles.dateText}>{selectedDate}</Text>
                </TouchableOpacity>
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
            type="ghost"
            size="large"
            onPress={handleNextDay}
            style={{
              borderWidth: 0,
              paddingVertical: 8,
              paddingHorizontal: 12
            }}
          >
            <MaterialCommunityIcons
              name="chevron-right"
              size={28}
              color="#f43f5e"
            />
          </Button>
        </View>
      </View>

      {/* 2. 主滚动区域 */}
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 三环仪表盘 */}
        <View style={styles.dashboardContainer}>
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
        </View>

        {/* 记录列表 - 这里不再嵌套 FlatList */}
        <View style={styles.recordsListContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : currentRecords.length > 0 ? (
            currentRecords.map(item => <RecordCard key={item.id} item={item} />)
          ) : (
            <EmptyState />
          )}
        </View>

        {/* 底部留白，防止内容被遮挡 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff' // 默认白色背景
  },
  backgroundView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
  },
  calendarHeader: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 10 // 确保在 iOS 上层级正确
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  datePickerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateTextContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f43f5e'
  },
  dateNavigation: {
    flexDirection: 'row',
    gap: 12
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f43f5e'
  },
  mainScroll: {
    flex: 1,
    zIndex: 1
  },
  dashboardContainer: {
    padding: 16,
    zIndex: 1
  },
  dashboardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between', // 改为 between 让间距更均匀
    // 阴影适配
    ...(Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10
      },
      android: {
        elevation: 5
      }
    }) as any)
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
    color: '#f43f5e'
  }
})
