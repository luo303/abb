import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
  Platform,
  DeviceEventEmitter
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'
import { RootState } from '../../../store'
import { startSleep, getActiveSleep, endSleep } from '../../../api/sleep'
import {
  saveOngoingTimer,
  getOngoingTimer,
  clearOngoingTimer
} from '../../../utils/sleepStorage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SleepSession, SleepRecord } from '../../../types/sleep'
import { useNavigationHelper } from '../../../utils/navigation'
import {
  addSleepItem,
  addSleepRecord,
  updateSleepItem
} from '../../../store/modules/sleepStore'
import type { AppDispatch } from '../../../store'
import SleepClockDisplay from '../../../components/DailyRecord/sleep/SleepClockDisplay'
import SleepActionButton from '../../../components/DailyRecord/sleep/SleepActionButton'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker, {
  DateTimePickerAndroid
} from '@react-native-community/datetimepicker'

// 格式化秒数为 HH:MM:SS 格式
const formatTime = (seconds: number, isManual: boolean = false) => {
  // 处理NaN情况
  if (isNaN(seconds)) {
    return '00:00:00'
  }
  const h = Math.floor(seconds / 3600) % 24 // 对小时数取模 24
  const m = Math.floor((seconds % 3600) / 60)
  const s = isManual ? 0 : seconds % 60
  // 确保小时显示为两位数
  const formattedH = String(h).padStart(2, '0')
  const formattedM = String(m).padStart(2, '0')
  const formattedS = String(s).padStart(2, '0')
  return `${formattedH}:${formattedM}:${formattedS}`
}

const formatPickerTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const mergeTimeToDate = (base: Date, time: Date) => {
  // 使用当前日期作为基准，确保 startTime 和 endTime 的日期部分始终相同
  const next = new Date()
  next.setHours(time.getHours(), time.getMinutes(), 0, 0)
  return next
}

type RouteParams = {
  SleepRecord: {
    session_id?: string
  }
}

const SleepRecordScreen = () => {
  const { goBack } = useNavigationHelper()
  const navigation = useNavigation()
  const route = useRoute<RouteProp<RouteParams, 'SleepRecord'>>()
  const sessionId = route.params?.session_id
  const dispatch = useDispatch<AppDispatch>()
  const babyId = useSelector((state: RootState) => state.baby.currentBabyId)
  const sleepList = useSelector((state: RootState) => state.sleep.sleepList)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [showManualInput, setShowManualInput] = useState(false)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const sessionIdRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const secondsRef = useRef(0)
  const startTimestampRef = useRef<number>(0)

  // 根据session_id回显数据
  useEffect(() => {
    if (sessionId && sleepList.length > 0) {
      const sleepItem = sleepList.find(item => item.session_id === sessionId)
      if (sleepItem) {
        setStartTime(new Date(sleepItem.started_at))
        setEndTime(new Date(sleepItem.ended_at))
        // 计算睡眠时长（秒）
        const durationSeconds = Math.floor((sleepItem.duration_ms || 0) / 1000)
        setSeconds(durationSeconds)
        // 显示手动记录表单
        setShowManualInput(true)
      }
    }
  }, [sessionId, sleepList])

  // 页面加载时检查本地缓存和服务器状态
  useEffect(() => {
    const checkOngoingTimer = async () => {
      try {
        // 检查本地是否有缓存的计时
        const ongoingTimer = await getOngoingTimer()
        if (ongoingTimer && babyId && ongoingTimer.started_at) {
          const CACHE_KEY = `sleep_active_${babyId}`

          try {
            // 尝试从缓存获取
            const cachedStatus = await AsyncStorage.getItem(CACHE_KEY)
            if (cachedStatus) {
              // 计算已过秒数，恢复计时
              const elapsedSeconds = Math.floor(
                (Date.now() - ongoingTimer.started_at) / 1000
              )
              setSeconds(elapsedSeconds)
              secondsRef.current = elapsedSeconds
              setIsTimerRunning(true)
              sessionIdRef.current = ongoingTimer.session_id
              startTimestampRef.current = ongoingTimer.started_at

              // 启动定时器
              startTimer()
              return
            }

            // 缓存不存在，从API获取
            const activeSleep = await getActiveSleep(babyId)
            if (activeSleep) {
              // 计算已过秒数，恢复计时
              const elapsedSeconds = Math.floor(
                (Date.now() - ongoingTimer.started_at) / 1000
              )
              setSeconds(elapsedSeconds)
              secondsRef.current = elapsedSeconds
              setIsTimerRunning(true)
              sessionIdRef.current = ongoingTimer.session_id
              startTimestampRef.current = ongoingTimer.started_at

              // 启动定时器
              startTimer()

              // 缓存结果
              await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(activeSleep))
            } else {
              // 服务器返回null，清除本地缓存
              await clearOngoingTimer()
              await AsyncStorage.removeItem(CACHE_KEY)
              setIsTimerRunning(false)
              setSeconds(0)
            }
          } catch (error) {
            console.error('获取睡眠状态失败:', error)
            // 服务器请求失败，尝试从本地正在进行的计时器获取
            if (ongoingTimer) {
              // 计算已过秒数，恢复计时
              const elapsedSeconds = Math.floor(
                (Date.now() - ongoingTimer.started_at) / 1000
              )
              setSeconds(elapsedSeconds)
              secondsRef.current = elapsedSeconds
              setIsTimerRunning(true)
              sessionIdRef.current = ongoingTimer.session_id
              startTimestampRef.current = ongoingTimer.started_at

              // 启动定时器
              startTimer()
            } else {
              // 清除本地缓存
              await clearOngoingTimer()
              await AsyncStorage.removeItem(CACHE_KEY)
              setIsTimerRunning(false)
              setSeconds(0)
            }
          }
        } else {
          // 没有本地缓存或babyId，重置状态
          setIsTimerRunning(false)
          setSeconds(0)
          // 清除缓存
          if (babyId) {
            const CACHE_KEY = `sleep_active_${babyId}`
            await AsyncStorage.removeItem(CACHE_KEY)
          }
        }
      } catch (error) {
        console.error('检查睡眠状态失败:', error)
        // 发生错误时重置状态
        setIsTimerRunning(false)
        setSeconds(0)
        // 清除缓存
        if (babyId) {
          const CACHE_KEY = `sleep_active_${babyId}`
          await AsyncStorage.removeItem(CACHE_KEY)
        }
      }
    }

    checkOngoingTimer()

    // 组件卸载时清除定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [babyId])

  // 启动定时器
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    // 设置定时器，每秒钟更新一次
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        const newSeconds = prev + 1
        secondsRef.current = newSeconds
        return newSeconds
      })
    }, 1000)
  }

  // 停止定时器
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // 开始计时
  const handleStartTimer = async () => {
    if (!babyId) {
      Alert.alert('提示', '请先选择宝宝')
      return
    }

    try {
      // 调用API开始睡眠记录
      const sleepSession = await startSleep(babyId)

      // 检查API返回数据
      if (!sleepSession?.session_id || !sleepSession?.started_at) {
        Alert.alert('操作失败', '请重试')
        return
      }

      // 保存session_id到ref
      sessionIdRef.current = sleepSession.session_id

      // 先保存缓存（异步，不等待）
      saveOngoingTimer({
        session_id: sleepSession.session_id,
        started_at: Date.now()
      })

      // 缓存睡眠状态
      const CACHE_KEY = `sleep_active_${babyId}`
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(sleepSession))

      // 启动定时器和记录时间戳放在一起，消除异步间隔
      const now = Date.now()
      startTimestampRef.current = now
      setIsTimerRunning(true)
      setSeconds(0)
      secondsRef.current = 0
      startTimer()
    } catch (error) {
      Alert.alert('操作失败', '请重试')
    }
  }

  // 结束睡眠
  const handleStopTimer = () => {
    if (!babyId || !sessionIdRef.current) {
      setIsTimerRunning(false)
      setSeconds(0)
      Alert.alert('提示', '睡眠记录未开始')
      return
    }

    stopTimer()

    // 使用定时器记录的秒数，确保与显示的时间一致
    const currentSeconds = secondsRef.current

    Alert.alert(
      '确认结束睡眠',
      `当前睡眠时长：${formatTime(currentSeconds)}，确定要结束吗？`,
      [
        { text: '取消', onPress: () => startTimer() },
        {
          text: '确定',
          onPress: async () => {
            try {
              if (!sessionIdRef.current) throw new Error('sessionId为空')

              // 确保 duration_ms 与弹窗显示的时间一致
              const started_at = startTimestampRef.current
              const ended_at = started_at + currentSeconds * 1000 // 基于 secondsRef.current 计算
              // 直接使用 addSleepItem action，与手动记录的行为一致
              const sleepRecord: SleepRecord = {
                session_id: sessionIdRef.current!,
                started_at: started_at,
                ended_at: ended_at,
                duration_ms: ended_at - started_at
              }

              // 添加到 sleepList
              dispatch(addSleepItem({ record: sleepRecord, babyId }))

              // 清除正在进行的计时
              await clearOngoingTimer()
              // 清除睡眠状态缓存
              const CACHE_KEY = `sleep_active_${babyId}`
              await AsyncStorage.removeItem(CACHE_KEY)

              // 显示提示
              Alert.alert(
                '睡眠已记录',
                `睡眠时长 ${formatTime(currentSeconds)}`
              )

              // 通知主页面刷新
              DeviceEventEmitter.emit('refreshDashboard')

              // 重置状态
              setIsTimerRunning(false)
              setSeconds(0)
              sessionIdRef.current = null
              navigation.goBack()
            } catch (error) {
              Alert.alert('操作失败', '请重试')
              startTimer()
            }
          }
        }
      ]
    )
  }

  // 切换手动记录表单
  const handleManualRecord = () => {
    setShowManualInput(!showManualInput)
  }

  // 处理时间选择器变化
  const handleTimeChange = (
    event: any,
    selectedDate?: Date,
    type: 'start' | 'end' = 'start'
  ) => {
    if (event?.type !== 'set' || !selectedDate) {
      return
    }

    if (type === 'start') {
      setStartTime(prev => mergeTimeToDate(prev, selectedDate))
    } else {
      setEndTime(prev => mergeTimeToDate(prev, selectedDate))
    }
  }

  const openAndroidTimePicker = (type: 'start' | 'end') => {
    const value = type === 'start' ? startTime : endTime

    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      display: 'default',
      is24Hour: true,
      onChange: (event, selectedDate) =>
        handleTimeChange(event, selectedDate, type)
    })
  }

  // 提交手动记录
  const handleSubmitManualRecord = () => {
    if (!babyId) {
      Alert.alert('提示', '请先选择宝宝')
      return
    }

    // 处理跨天的情况
    let adjustedEndTime = new Date(endTime)
    if (adjustedEndTime.getTime() < startTime.getTime()) {
      adjustedEndTime.setDate(adjustedEndTime.getDate() + 1)
    }

    // 计算睡眠时长
    const durationMs = Math.max(
      0,
      adjustedEndTime.getTime() - startTime.getTime()
    )
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    // 计算分钟数时加 1，防止因为本地操作时间导致时间计算错误
    const durationMinutes =
      Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60)) + 1

    // 模拟API返回数据，用于测试
    // 调整 duration_ms，确保与 durationMinutes 的计算一致
    const adjustedDurationMs = durationMs + 60000 // 增加 1 分钟的毫秒数
    const sleepRecord: SleepRecord = {
      session_id: sessionId || `manual-session-${Date.now()}`,
      started_at: startTime.getTime(),
      ended_at: adjustedEndTime.getTime(),
      duration_ms: adjustedDurationMs
    }

    // 根据是否有 sessionId 决定是更新还是添加记录
    if (sessionId) {
      // 更新现有记录
      dispatch(updateSleepItem({ record: sleepRecord, babyId }))
      console.log('手动睡眠记录已更新')
    } else {
      // 添加新记录
      dispatch(addSleepItem({ record: sleepRecord, babyId }))
      console.log('手动睡眠记录已添加到sleepList')
    }

    // 计算总秒数
    const totalSeconds = Math.floor(adjustedDurationMs / 1000)

    // 弹出提示
    Alert.alert('睡眠已记录', `睡眠时长 ${formatTime(totalSeconds, true)}`)

    // 通知主页面刷新
    DeviceEventEmitter.emit('refreshDashboard')

    // 重置表单
    setStartTime(new Date())
    setEndTime(new Date())
    setShowManualInput(false)

    // 返回上一页
    console.log('返回上一页')
    navigation.goBack()
  }

  // 返回按钮
  const handleBack = () => {
    goBack()
  }

  return (
    <LinearGradient
      colors={[
        '#ffffff',
        '#fff5f5',
        '#ffe0e0',
        '#ffd0d0',
        '#ffc0c0',
        '#fca5a5',
        '#f472b6'
      ]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>记录睡眠</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 中央时钟区域 */}
      <SleepClockDisplay seconds={seconds} formatTime={formatTime} />

      {/* 计时按钮 */}
      <SleepActionButton
        isTimerRunning={isTimerRunning}
        onStart={handleStartTimer}
        onStop={handleStopTimer}
      />

      {/* 手动记录按钮 */}
      <TouchableOpacity
        style={styles.manualButton}
        onPress={handleManualRecord}
      >
        <Ionicons
          name="hand-left"
          size={20}
          color="#f43f5e"
          style={styles.manualButtonIcon}
        />
        <Text style={styles.manualButtonText}>手动记录</Text>
        <View
          style={[
            styles.arrowContainer,
            showManualInput && styles.arrowRotated
          ]}
        >
          <Ionicons name="chevron-forward" size={20} color="#f43f5e" />
        </View>
      </TouchableOpacity>

      {/* 底部占位视图，使按钮离底部更远 */}
      <View style={styles.bottomSpacer} />

      {/* 手动记录表单 - 弹窗样式 */}
      {showManualInput && (
        <TouchableWithoutFeedback onPress={() => setShowManualInput(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.manualInputContainer}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>开始时间</Text>
                  {Platform.OS === 'android' ? (
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => openAndroidTimePicker('start')}
                    >
                      <Text style={styles.timeButtonText}>
                        {formatPickerTime(startTime)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      display="default"
                      onChange={(event, date) =>
                        handleTimeChange(event, date, 'start')
                      }
                    />
                  )}
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>结束时间</Text>
                  {Platform.OS === 'android' ? (
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => openAndroidTimePicker('end')}
                    >
                      <Text style={styles.timeButtonText}>
                        {formatPickerTime(endTime)}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      display="default"
                      onChange={(event, date) =>
                        handleTimeChange(event, date, 'end')
                      }
                    />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitManualRecord}
                >
                  <Text style={styles.submitButtonText}>提交记录</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: 'transparent'
  },
  backButton: {
    padding: 8
  },
  backButtonText: {
    color: '#f43f5e',
    fontSize: 24
  },
  headerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600'
  },
  headerRight: {
    width: 40
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 64,
    paddingVertical: 16,
    borderRadius: 32,
    marginHorizontal: 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3
  },
  manualButtonIcon: {
    marginRight: 8
  },
  manualButtonText: {
    color: '#f43f5e',
    fontSize: 16,
    fontWeight: '600'
  },
  arrowContainer: {
    marginLeft: 8
  },
  arrowRotated: {
    transform: [{ rotate: '90deg' }]
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  manualInputContainer: {
    backgroundColor: 'white',
    marginHorizontal: 48,
    padding: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: '80%',
    maxWidth: 400
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  inputLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginRight: 16
  },
  timeButton: {
    minWidth: 110,
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff5f5',
    alignItems: 'center'
  },
  timeButtonText: {
    color: '#be123c',
    fontSize: 15,
    fontWeight: '500'
  },

  submitButton: {
    backgroundColor: '#f43f5e',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  bottomSpacer: {
    height: 60
  }
})

export default SleepRecordScreen
