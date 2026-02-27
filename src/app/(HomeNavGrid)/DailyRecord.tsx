import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { Stack } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { Toast, Button } from '@ant-design/react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

// 导入日常记录组件
import DashboardRing from '../../components/DailyRecord/DashboardRing'
import RecordCard from '../../components/DailyRecord/RecordCard'
import EmptyState from '../../components/DailyRecord/EmptyState'

// 导入类型定义和模拟数据
import { RecordType, RecordItem, Statistics } from '../../types/recordTypes'
import mockData from '../../data/mock/dailyRecordMock'

export default function DailyRecordScreen() {
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  )
  const [currentRecords, setCurrentRecords] = useState<RecordItem[]>([])
  const [statistics, setStatistics] = useState<Statistics>({
    feedingCount: 0,
    feedingVolume: 0,
    sleepDuration: 0,
    diaperCount: 0
  })

  // 根据选中日期更新记录和统计
  useEffect(() => {
    const records = mockData[selectedDate] || []
    setCurrentRecords(records)

    // 计算统计数据
    let feedingCount = 0
    let feedingVolume = 0
    let sleepDuration = 0
    let diaperCount = 0

    records.forEach(record => {
      switch (record.type) {
        case 'feeding':
          feedingCount++
          // 提取喂养量（假设格式为"奶粉 Xml"或"母乳 X分钟"）
          const milkMatch = record.details.match(/奶粉\s*(\d+)ml/)
          if (milkMatch) {
            feedingVolume += parseInt(milkMatch[1])
          }
          break
        case 'sleep':
          // 提取睡眠时长（假设格式为"睡眠时长：X小时"）
          const sleepMatch = record.details.match(/睡眠时长：(\d+(\.\d+)?)小时/)
          if (sleepMatch) {
            sleepDuration += parseFloat(sleepMatch[1])
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
      sleepDuration,
      diaperCount
    })
  }, [selectedDate])

  // 处理底部按钮点击
  const handleActionPress = (type: RecordType) => {
    const typeMap = {
      feeding: '喂养',
      sleep: '睡眠',
      diaper: '换尿布'
    }
    Toast.info(`跳转至${typeMap[type]}记录表单`)
  }

  // 处理日期选择器确认
  const handleDatePickerConfirm = (event: any, date?: Date) => {
    if (date) {
      const selectedDate = dayjs(date).format('YYYY-MM-DD')
      setSelectedDate(selectedDate)
    }
  }

  // 目标值设置
  const feedingTarget = 1000 // 每日喂养目标1000ml
  const sleepTarget = 12 // 每日睡眠目标12小时
  const diaperTarget = 8 // 每日换尿布目标8次

  // 计算百分比
  const feedingPercent = Math.min(
    Math.round((statistics.feedingVolume / feedingTarget) * 100),
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
    return value === 0 ? '--' : `${value}${unit}`
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '日常记录' }} />

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
            <DateTimePicker
              value={new Date(selectedDate)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={handleDatePickerConfirm}
            />
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
              value={getDisplayValue(statistics.feedingVolume, 'ml')}
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
          {currentRecords.length > 0 ? (
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
    backgroundColor: '#f8f9fa' // 稍微浅一点的底色
  },
  calendarHeader: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
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
    alignItems: 'center'
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
    flex: 1
  },
  dashboardContainer: {
    padding: 16
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between', // 改为 between 让间距更均匀
    // 阴影适配
    ...(Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10
      },
      android: {
        elevation: 4
      }
    }) as any)
  },
  recordsListContainer: {
    paddingHorizontal: 16
  }
})
