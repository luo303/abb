import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '@/types/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/store'
import { fetchBabies, fetchBabyProfile } from '@/store/modules/BabyStore'
import VaccineCard from '@/components/vaccine/VaccineCard'
import {
  getVaccineListReq,
  changeVaccineStatusReq,
  VaccineItem
} from '@/api/vaccine'
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { openDatePicker } from '@/utils/datePicker'
import { useMessage } from '@/components/Message'

type FilterType = 'all' | 'completed' | 'pending'

export default function VaccineRecordScreen() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useDispatch<AppDispatch>()
  const { showMessage } = useMessage()
  const { currentBabyId, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )
  const birthdayMinDate = currentBabyDetail?.birthday
    ? new Date(currentBabyDetail.birthday)
    : undefined

  const [filter, setFilter] = useState<FilterType>('all')
  const [vaccines, setVaccines] = useState<VaccineItem[]>([])
  const [loading, setLoading] = useState(false)

  // 日期选择相关状态
  const targetIdRef = useRef<string | null>(null) // 使用 Ref 解决 Android 回调闭包问题
  const [showIOSPicker, setShowIOSPicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())

  // 获取 API 对应的 status 参数
  const getApiStatus = (currentFilter: FilterType) => {
    switch (currentFilter) {
      case 'completed':
        return 'given'
      case 'pending':
        return 'not_given'
      default:
        return 'all'
    }
  }

  // 排序函数
  const sortVaccines = (items: VaccineItem[]) => {
    return items.sort((a, b) => {
      const getDate = (item: VaccineItem) => {
        // 如果已接种且有接种时间，优先使用接种时间
        if (item.status === 'given' && item.actual_time) {
          return item.actual_time
        }
        // 否则使用推荐接种时间
        return item.due_time
      }
      return getDate(a) - getDate(b)
    })
  }

  // 获取疫苗列表
  const fetchVaccineList = useCallback(async () => {
    if (!currentBabyId) return

    setLoading(true)
    try {
      const apiStatus = getApiStatus(filter)
      const res = await getVaccineListReq(currentBabyId, apiStatus)
      if (res.code === 0 && res.data) {
        const items = res.data.items || []
        // 按照时间升序排序（从上到下）
        const sortedList = sortVaccines(items)
        setVaccines(sortedList)
      } else {
        showMessage(res.message || '获取疫苗列表失败')
      }
    } catch (error) {
      console.error('Fetch vaccine error:', error)
      showMessage('网络请求失败')
    } finally {
      setLoading(false)
    }
  }, [currentBabyId, filter])

  // 如果没有宝宝ID，尝试获取宝宝列表
  useEffect(() => {
    if (!currentBabyId) {
      dispatch(fetchBabies())
    }
  }, [currentBabyId, dispatch])

  useEffect(() => {
    if (!currentBabyId) return
    if (!currentBabyDetail || currentBabyDetail.baby_id !== currentBabyId) {
      dispatch(fetchBabyProfile(currentBabyId))
    }
  }, [currentBabyId, currentBabyDetail, dispatch])

  // 进入页面或切换 Filter 时获取数据
  useEffect(() => {
    fetchVaccineList()
  }, [fetchVaccineList])

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
      const finalDate =
        birthdayMinDate && selectedDate < birthdayMinDate
          ? birthdayMinDate
          : selectedDate
      updateVaccineStatus(targetIdRef.current, true, finalDate)
    }
    setShowIOSPicker(false)
    targetIdRef.current = null
  }

  // 取消iOS日期选择
  const cancelIOSDate = () => {
    setShowIOSPicker(false)
    targetIdRef.current = null
  }

  const updateVaccineStatus = async (
    id: string,
    completed: boolean,
    date?: Date
  ) => {
    if (!currentBabyId) return

    const status: 'given' | 'not_given' = completed ? 'given' : 'not_given'
    const actual_time = completed && date ? date.getTime() : 0

    // 乐观更新：先更新 UI，并重新排序
    const originalVaccines = [...vaccines]

    let updatedList = vaccines.map(item =>
      item.dose_id === id
        ? ({
            ...item,
            status,
            actual_time
          } as VaccineItem)
        : item
    )

    // 如果当前处于特定筛选状态（非全部），则移除不符合当前筛选条件的项
    if (filter === 'completed' && status === 'not_given') {
      updatedList = updatedList.filter(item => item.dose_id !== id)
    } else if (filter === 'pending' && status === 'given') {
      updatedList = updatedList.filter(item => item.dose_id !== id)
    }

    // 重新排序
    setVaccines(sortVaccines(updatedList))

    try {
      const res = await changeVaccineStatusReq({
        baby_id: currentBabyId,
        dose_id: id,
        status,
        actual_time
      })

      if (res.code === 0) {
        showMessage('更新成功')
      } else {
        // 失败回滚
        setVaccines(originalVaccines)
        showMessage(res.message || '更新失败')
      }
    } catch (error) {
      console.error('Update vaccine status error:', error)
      // 失败回滚
      setVaccines(originalVaccines)
      showMessage('网络请求失败')
    }
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
    const initialDate =
      birthdayMinDate && now < birthdayMinDate ? birthdayMinDate : now
    setSelectedDate(initialDate)

    const handled = openDatePicker(
      initialDate,
      handleDateChange,
      'date',
      new Date(),
      birthdayMinDate
    )
    if (!handled) {
      setShowIOSPicker(true)
    }
  }

  // 点击卡片日期
  const handleDateClick = (id: string, date?: number) => {
    targetIdRef.current = id
    // 如果已有日期，使用该日期初始化；否则使用当前日期
    const baseDate = date ? new Date(date) : new Date()
    const initialDate =
      birthdayMinDate && baseDate < birthdayMinDate ? birthdayMinDate : baseDate
    setSelectedDate(initialDate)

    const handled = openDatePicker(
      initialDate,
      handleDateChange,
      'date',
      new Date(),
      birthdayMinDate
    )
    if (!handled) {
      setShowIOSPicker(true)
    }
  }

  const handleCardPress = (item: VaccineItem) => {
    // 如果有链接，跳转到详情页
    if (item.link) {
      navigation.navigate('VaccineDetail', {
        url: item.link,
        title: item.name
      })
    } else {
      // 否则提示暂无详情
      showMessage('暂无详情')
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={vaccines}
          keyExtractor={item => item.dose_id}
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
              <Text style={styles.emptyText}>
                {currentBabyId ? '暂无记录' : '请先添加或选择宝宝'}
              </Text>
            </View>
          }
        />
      )}

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
              minimumDate={birthdayMinDate}
              maximumDate={new Date()}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
