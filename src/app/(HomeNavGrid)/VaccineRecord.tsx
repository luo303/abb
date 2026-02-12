import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import VaccineCard from '@/components/vaccine/VaccineCard'
import { Vaccine } from '@/types/vaccine'
import { MOCK_VACCINES } from '@/data/mock/homePosts'
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { openDatePicker } from '@/utils/datePicker'

type FilterType = 'all' | 'completed' | 'pending'

export default function VaccineRecordScreen() {
  const navigation = useNavigation<any>()
  const [filter, setFilter] = useState<FilterType>('all')
  const [vaccines, setVaccines] = useState<Vaccine[]>(MOCK_VACCINES)

  // 日期选择相关状态
  const targetIdRef = useRef<string | null>(null) // 使用 Ref 解决 Android 回调闭包问题
  const [showIOSPicker, setShowIOSPicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const filteredData = vaccines
    .filter(item => {
      if (filter === 'all') return true
      return item.status === filter
    })
    .sort((a, b) => {
      // 获取排序用的日期
      // 如果已接种，使用 vaccinationDate；如果未接种，使用 recommendedDate
      const getDate = (item: Vaccine) => {
        if (item.status === 'completed' && item.vaccinationDate) {
          return item.vaccinationDate
        }
        return item.recommendedDate
      }

      const dateA = getDate(a)
      const dateB = getDate(b)

      // 按日期升序排序（早的时间在前）
      return dateA - dateB
    })

  // 处理日期变更
  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date && targetIdRef.current) {
        updateVaccineStatus(targetIdRef.current, true, date)
      }
      targetIdRef.current = null
    } else {
      // iOS
      if (date) setSelectedDate(date)
    }
  }

  // 确认iOS日期选择
  const confirmIOSDate = () => {
    if (targetIdRef.current) {
      updateVaccineStatus(targetIdRef.current, true, selectedDate)
    }
    setShowIOSPicker(false)
    targetIdRef.current = null
  }

  // 取消iOS日期选择
  const cancelIOSDate = () => {
    setShowIOSPicker(false)
    targetIdRef.current = null
  }

  const updateVaccineStatus = (id: string, completed: boolean, date?: Date) => {
    setVaccines(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: completed ? 'completed' : 'pending',
              vaccinationDate: completed && date ? date.getTime() : undefined
            }
          : item
      )
    )
  }

  const handleToggleStatus = (id: string, value: boolean) => {
    if (!value) {
      // 取消接种，直接更新
      updateVaccineStatus(id, false)
      return
    }

    // 接种，需要选择日期
    targetIdRef.current = id
    const now = new Date()
    setSelectedDate(now)

    const handled = openDatePicker(now, handleDateChange)
    if (!handled) {
      setShowIOSPicker(true)
    }
  }

  const handleDateClick = (id: string, date?: number) => {
    targetIdRef.current = id
    // 如果已有日期，使用该日期初始化；否则使用当前日期
    const initialDate = date ? new Date(date) : new Date()
    setSelectedDate(initialDate)

    const handled = openDatePicker(initialDate, handleDateChange)
    if (!handled) {
      setShowIOSPicker(true)
    }
  }

  const handleCardPress = (item: Vaccine) => {
    if (item.detail) {
      // 使用 navigation.navigate 进行跳转，兼容 React Navigation
      navigation.navigate('VaccineDetail', {
        url: item.detail,
        title: item.name
      })
    }
  }

  const renderTab = (type: FilterType, label: string) => (
    <TouchableOpacity
      style={[styles.tabItem, filter === type && styles.activeTabItem]}
      onPress={() => setFilter(type)}
    >
      <Text style={[styles.tabText, filter === type && styles.activeTabText]}>
        {label}
      </Text>
      {/* 移除原本的线条，改为胶囊样式，或者在样式表中重新定义 activeTabItem */}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* 分类 Tab - 悬浮胶囊风格 */}
      <View style={styles.headerContainer}>
        <View style={styles.tabContainer}>
          {renderTab('all', '全部')}
          <View style={styles.divider} />
          {renderTab('completed', '已接种')}
          <View style={styles.divider} />
          {renderTab('pending', '未接种')}
        </View>
      </View>

      {/* 列表内容 */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleCardPress(item)}
          >
            <VaccineCard
              data={item}
              onToggleStatus={handleToggleStatus}
              onDatePress={handleDateClick}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无记录</Text>
          </View>
        }
      />

      {/* iOS DatePicker 覆盖层 */}
      {Platform.OS === 'ios' && showIOSPicker && (
        <View style={styles.iosPickerOverlay}>
          <View style={styles.iosPickerContent}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={cancelIOSDate}>
                <Text style={styles.iosPickerCancel}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.iosPickerTitle}>选择接种日期</Text>
              <TouchableOpacity onPress={confirmIOSDate}>
                <Text style={styles.iosPickerConfirm}>确认</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={styles.iosPicker}
              locale="zh-CN"
            />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    zIndex: 10
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center'
  },
  activeTabItem: {
    backgroundColor: '#ecfdf5' // 选中时的浅绿色背景
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#f1f5f9'
  },
  tabText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600'
  },
  activeTabText: {
    color: '#10b981', // 选中时的绿色文字
    fontWeight: '700'
  },
  listContent: {
    padding: 16,
    paddingTop: 8
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '500'
  },
  // iOS Picker 样式
  iosPickerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    zIndex: 100
  },
  iosPickerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155'
  },
  iosPickerCancel: {
    fontSize: 16,
    color: '#94a3b8'
  },
  iosPickerConfirm: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600'
  },
  iosPicker: {
    height: 200,
    width: '100%'
  }
})
