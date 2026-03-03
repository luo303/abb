import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet,
  Platform
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { startSleep, getActiveSleep, endSleep } from '../../../api/sleep'
import {
  saveOngoingTimer,
  getOngoingTimer,
  clearOngoingTimer
} from '../../../utils/sleepStorage'
import { SleepSession, SleepRecord } from '../../../types/sleep'
import { useNavigationHelper } from '../../../utils/navigation'
import SleepClockDisplay from '../../../components/DailyRecord/sleep/SleepClockDisplay'
import SleepActionButton from '../../../components/DailyRecord/sleep/SleepActionButton'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker, {
  DateTimePickerAndroid
} from '@react-native-community/datetimepicker'

// 格式化秒数为 HH:MM:SS 格式
const formatTime = (seconds: number) => {
  // 处理NaN情况
  if (isNaN(seconds)) {
    return '00:00:00'
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

const SleepRecordScreen = () => {
  const { goBack } = useNavigationHelper()
  const babyId = useSelector((state: RootState) => state.baby.currentBabyId)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [showManualInput, setShowManualInput] = useState(false)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState(new Date())
  const sessionIdRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 组件初始化日志
  console.log('SleepRecordScreen组件初始化')
  console.log('初始babyId:', babyId)
  console.log('初始sessionIdRef:', sessionIdRef.current)

  // 页面加载时检查本地缓存和服务器状态
  useEffect(() => {
    const checkOngoingTimer = async () => {
      try {
        // 检查本地是否有缓存的计时
        const ongoingTimer = await getOngoingTimer()
        console.log('检查本地缓存:', ongoingTimer)
        if (ongoingTimer && babyId && ongoingTimer.started_at) {
          try {
            // 向服务器确认是否仍在进行中
            const activeSleep = await getActiveSleep(babyId)
            console.log('服务器返回的活跃睡眠:', activeSleep)
            if (activeSleep) {
              // 计算已过秒数，恢复计时
              const elapsedSeconds = Math.floor(
                (Date.now() - ongoingTimer.started_at) / 1000
              )
              console.log('计算的已过秒数:', elapsedSeconds)
              setSeconds(elapsedSeconds)
              setIsTimerRunning(true)
              sessionIdRef.current = ongoingTimer.session_id
              console.log('恢复计时，sessionId:', sessionIdRef.current)

              // 启动定时器
              startTimer()
            } else {
              // 服务器返回null，清除本地缓存
              console.log('服务器返回null，清除本地缓存')
              await clearOngoingTimer()
              setIsTimerRunning(false)
              setSeconds(0)
            }
          } catch (error) {
            // 服务器请求失败，清除本地缓存
            console.log('服务器请求失败，清除本地缓存', error)
            await clearOngoingTimer()
            setIsTimerRunning(false)
            setSeconds(0)
          }
        } else {
          // 没有本地缓存或babyId，重置状态
          console.log('没有本地缓存或babyId，重置状态')
          setIsTimerRunning(false)
          setSeconds(0)
        }
      } catch (error) {
        console.error('检查睡眠计时失败:', error)
        // 发生错误时重置状态
        setIsTimerRunning(false)
        setSeconds(0)
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
    console.log('启动定时器')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        const newSeconds = prev + 1
        console.log('定时器更新，秒数:', newSeconds)
        return newSeconds
      })
    }, 1000)
    console.log('定时器已启动，timerRef:', timerRef.current)
  }

  // 停止定时器
  const stopTimer = () => {
    console.log('停止定时器')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      console.log('定时器已停止')
    }
  }

  // 开始计时
  const handleStartTimer = async () => {
    console.log('开始计时按钮点击')
    console.log('当前babyId:', babyId)
    if (!babyId) {
      Alert.alert('提示', '请先选择宝宝')
      return
    }

    try {
      // 模拟API返回数据，用于测试
      console.log('模拟API返回数据')
      const sleepSession: SleepSession = {
        session_id: `test-session-${Date.now()}`,
        started_at: Date.now()
      }
      console.log('模拟的睡眠会话:', sleepSession)

      // 检查模拟数据
      if (
        !sleepSession ||
        !sleepSession.session_id ||
        !sleepSession.started_at
      ) {
        console.error('模拟的睡眠会话无效:', sleepSession)
        Alert.alert('操作失败', '请重试')
        return
      }

      // 保存到本地缓存
      console.log('保存到本地缓存')
      await saveOngoingTimer({
        session_id: sleepSession.session_id,
        started_at: sleepSession.started_at
      })
      console.log('本地缓存已保存')

      // 保存session_id到ref
      sessionIdRef.current = sleepSession.session_id
      console.log('保存sessionId到ref:', sessionIdRef.current)

      // 启动定时器
      console.log('启动定时器')
      setIsTimerRunning(true)
      setSeconds(0)
      startTimer()
      console.log('计时已开始')
    } catch (error) {
      console.log('操作失败，清除本地缓存', error)
      Alert.alert('操作失败', '请重试')
    }
  }

  // 结束睡眠
  const handleStopTimer = () => {
    console.log('结束睡眠按钮点击')
    console.log('当前babyId:', babyId)
    console.log('当前sessionIdRef.current:', sessionIdRef.current)
    console.log('当前isTimerRunning:', isTimerRunning)

    if (!babyId) {
      console.log('babyId为空，无法结束睡眠')
      Alert.alert('提示', '请先选择宝宝')
      return
    }

    if (!sessionIdRef.current) {
      console.log('sessionId为空，无法结束睡眠')
      // 重置状态
      setIsTimerRunning(false)
      setSeconds(0)
      Alert.alert('提示', '睡眠记录未开始')
      return
    }

    // 停止定时器
    console.log('停止定时器')
    stopTimer()

    // 显示确认弹窗
    Alert.alert(
      '确认结束睡眠',
      `当前睡眠时长：${formatTime(seconds)}，确定要结束吗？`,
      [
        {
          text: '取消',
          style: 'cancel',
          onPress: () => {
            console.log('用户取消结束睡眠')
            // 恢复定时器
            startTimer()
          }
        },
        {
          text: '确定',
          onPress: async () => {
            console.log('用户确认结束睡眠')
            try {
              // 再次检查sessionId
              console.log('确认操作时的sessionId:', sessionIdRef.current)
              if (!sessionIdRef.current) {
                throw new Error('sessionId为空')
              }

              // 模拟API返回数据，用于测试
              console.log('模拟API返回数据')
              const sleepRecord: SleepRecord = {
                session_id: sessionIdRef.current!,
                started_at: Date.now() - seconds * 1000,
                ended_at: Date.now(),
                duration_ms: seconds * 1000
              }
              console.log('模拟的睡眠记录:', sleepRecord)

              // 清除本地缓存
              console.log('清除本地缓存')
              await clearOngoingTimer()
              console.log('本地缓存已清除')

              // 计算睡眠时长
              const hours = Math.floor(
                sleepRecord.duration_ms / (1000 * 60 * 60)
              )
              const minutes = Math.floor(
                (sleepRecord.duration_ms % (1000 * 60 * 60)) / (1000 * 60)
              )
              console.log('计算的睡眠时长:', hours, '小时', minutes, '分钟')

              // 弹出提示
              Alert.alert('睡眠已记录', `睡眠时长 ${hours}小时${minutes}分钟`)

              // 重置状态
              console.log('重置状态')
              setIsTimerRunning(false)
              setSeconds(0)
              sessionIdRef.current = null
              console.log('状态已重置')
            } catch (error) {
              console.log('操作失败，清除本地缓存', error)
              Alert.alert('操作失败', '请重试')
              // 恢复定时器
              console.log('恢复定时器')
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
    if (selectedDate) {
      if (type === 'start') {
        setStartTime(selectedDate)
      } else {
        setEndTime(selectedDate)
      }
    }
  }

  // 提交手动记录
  const handleSubmitManualRecord = () => {
    if (!babyId) {
      Alert.alert('提示', '请先选择宝宝')
      return
    }

    // 处理跨天的情况
    let adjustedEndTime = new Date(endTime)
    if (adjustedEndTime < startTime) {
      adjustedEndTime.setDate(adjustedEndTime.getDate() + 1)
    }

    // 计算睡眠时长
    const durationMs = adjustedEndTime.getTime() - startTime.getTime()
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    const durationMinutes = Math.floor(
      (durationMs % (1000 * 60 * 60)) / (1000 * 60)
    )

    // 模拟API返回数据，用于测试
    const sleepRecord: SleepRecord = {
      session_id: `manual-session-${Date.now()}`,
      started_at: startTime.getTime(),
      ended_at: adjustedEndTime.getTime(),
      duration_ms: durationMs
    }

    // 弹出提示
    Alert.alert(
      '睡眠已记录',
      `睡眠时长 ${durationHours}小时${durationMinutes}分钟`
    )

    // 重置表单
    setStartTime(new Date())
    setEndTime(new Date())
    setShowManualInput(false)
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
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="default"
                    onChange={(event, date) =>
                      handleTimeChange(event, date, 'start')
                    }
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>结束时间</Text>
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="default"
                    onChange={(event, date) =>
                      handleTimeChange(event, date, 'end')
                    }
                  />
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
