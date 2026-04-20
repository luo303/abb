import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
  Platform,
  Pressable
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import {
  Clock,
  CalendarDay,
  Droplet,
  FoodTray,
  HeartCircle,
  SparklesAi
} from '@zappicon/react-native'
import dayjs from 'dayjs'
import { RootState } from '../store'
import {
  saveFeedingRecord,
  updateFeedingRecord
} from '../store/modules/feedingStore'
import type { AppDispatch } from '../store'
import { FeedingType } from '../types/feeding'
import {
  AmountInput,
  DurationInput,
  TimePicker,
  RemarkInput
} from '../components/DailyRecord/FeedingRecord'
import { useMessage } from '../components/Message'
import { APP_COLORS, APP_GRADIENTS } from '../theme/paperTheme'

interface RouteParams {
  feeding_id?: string
}

type FeedingUiType = '奶粉' | '母乳' | '辅食'

type FeedingDraft = {
  feedingTimeMs: number
  note: string
  formulaMl: string
  milkDurationMin: string
  foodGrams: string
}

type ConfirmMode = 'closeEntry' | 'leaveScreen'

const getFirstLine = (text: string) => {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return trimmed.split('\n')[0]?.trim() || ''
}

const stripDetailLineFromRemark = (text: string, type: FeedingUiType) => {
  const trimmed = text.trim()
  if (!trimmed) return ''
  const lines = trimmed.split('\n')
  const firstLine = (lines[0] || '').trim()
  const hasMoreLines = lines.length > 1

  const isLegacyTypedLine = /^#(奶粉|母乳|泵奶|辅食)\b/i.test(firstLine)
  if (isLegacyTypedLine) {
    return lines.slice(1).join('\n').trim()
  }

  if (type === '奶粉') {
    if (
      hasMoreLines
        ? /^([0-9]+(?:\.[0-9]+)?)\s*ml\b/i.test(firstLine)
        : /^([0-9]+(?:\.[0-9]+)?)\s*ml$/i.test(firstLine)
    ) {
      return lines.slice(1).join('\n').trim()
    }
  }

  if (type === '母乳') {
    if (
      hasMoreLines
        ? /^([0-9]+(?:\.[0-9]+)?)\s*(min|分钟)\b/i.test(firstLine) ||
          /^([0-9]+(?:\.[0-9]+)?)\s*秒\b/i.test(firstLine)
        : /^([0-9]+(?:\.[0-9]+)?)\s*(min|分钟)$/i.test(firstLine) ||
          /^([0-9]+(?:\.[0-9]+)?)\s*秒$/i.test(firstLine)
    ) {
      return lines.slice(1).join('\n').trim()
    }
  }

  if (type === '辅食') {
    if (
      hasMoreLines
        ? /^([0-9]+(?:\.[0-9]+)?)\s*g\b/i.test(firstLine)
        : /^([0-9]+(?:\.[0-9]+)?)\s*g$/i.test(firstLine)
    ) {
      return lines.slice(1).join('\n').trim()
    }
  }

  return trimmed
}

const parseFormulaMlFromRemark = (text: string) => {
  const firstLine = getFirstLine(text)
  const legacyMatch = firstLine.match(/^#奶粉\s*([0-9]+(?:\.[0-9]+)?)\s*ml\b/i)
  if (legacyMatch?.[1]) return legacyMatch[1]
  const match = firstLine.match(/^([0-9]+(?:\.[0-9]+)?)\s*ml\b/i)
  return match?.[1] || ''
}

const parseMilkDurationFromRemark = (text: string) => {
  const firstLine = getFirstLine(text)
  const legacyMatch = firstLine.match(
    /^#母乳\s*([0-9]+(?:\.[0-9]+)?)\s*(min|分钟)\b/i
  )
  if (legacyMatch?.[1]) return legacyMatch[1]
  const match = firstLine.match(/^([0-9]+(?:\.[0-9]+)?)\s*(min|分钟)\b/i)
  return match?.[1] || ''
}

const parseFoodGramsFromRemark = (text: string) => {
  const firstLine = getFirstLine(text)
  const legacyMatch = firstLine.match(/^#辅食\s*([0-9]+(?:\.[0-9]+)?)\s*g\b/i)
  if (legacyMatch?.[1]) return legacyMatch[1]
  const match = firstLine.match(/^([0-9]+(?:\.[0-9]+)?)\s*g\b/i)
  return match?.[1] || ''
}

const FeedingRecordScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>()
  const feedId = route.params?.feeding_id
  const dispatch = useDispatch<AppDispatch>()
  const routeParams = route.params as { baby_id?: string } | undefined
  const reduxBabyId = useSelector(
    (state: RootState) => state.baby.currentBabyId
  )
  const babyId = routeParams?.baby_id || reduxBabyId

  const feedingList = useSelector(
    (state: RootState) => state.feeding.feedingList
  )
  // 获取当前选中的日期
  const currentDate = useSelector((state: RootState) => state.daily.currentDate)

  const [selectedType, setSelectedType] = useState<FeedingUiType>('母乳')
  const [activeEntry, setActiveEntry] = useState<FeedingUiType | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const draftByTypeRef = useRef(new Map<FeedingUiType, FeedingDraft>())
  const initialDraftByTypeRef = useRef(new Map<FeedingUiType, FeedingDraft>())
  const allowLeaveRef = useRef(false)
  const didHydrateEditRef = useRef(false)
  const pendingNavActionRef = useRef<any>(null)
  const [formulaMl, setFormulaMl] = useState('')
  const [milkDurationMin, setMilkDurationMin] = useState('')
  const [foodGrams, setFoodGrams] = useState('')
  // 初始化feedingTime为当前选中日期的时间
  const [feedingTime, setFeedingTime] = useState(() => {
    // 解析currentDate (YYYYMMDD) 为日期对象
    if (currentDate && currentDate.length === 8) {
      const year = parseInt(currentDate.substring(0, 4))
      const month = parseInt(currentDate.substring(4, 6)) - 1 // 月份从0开始
      const day = parseInt(currentDate.substring(6, 8))
      return new Date(
        year,
        month,
        day,
        new Date().getHours(),
        new Date().getMinutes()
      )
    }
    return new Date()
  })
  const [note, setNote] = useState('')
  const { showMessage } = useMessage()
  const [confirmMode, setConfirmMode] = useState<ConfirmMode | null>(null)

  const getCurrentDraft = useCallback((): FeedingDraft => {
    return {
      feedingTimeMs: feedingTime.getTime(),
      note,
      formulaMl,
      milkDurationMin,
      foodGrams
    }
  }, [feedingTime, note, formulaMl, milkDurationMin, foodGrams])

  const syncCurrentDraftToCache = useCallback(() => {
    draftByTypeRef.current.set(selectedType, getCurrentDraft())
  }, [selectedType, getCurrentDraft])

  const isDraftEqual = useCallback((a: FeedingDraft, b: FeedingDraft) => {
    return (
      a.feedingTimeMs === b.feedingTimeMs &&
      a.note === b.note &&
      a.formulaMl === b.formulaMl &&
      a.milkDurationMin === b.milkDurationMin &&
      a.foodGrams === b.foodGrams
    )
  }, [])

  const isDirty = useCallback(() => {
    syncCurrentDraftToCache()
    const types: FeedingUiType[] = ['辅食', '母乳', '奶粉']
    for (const type of types) {
      const current = draftByTypeRef.current.get(type)
      const initial = initialDraftByTypeRef.current.get(type)
      if (!current && !initial) continue
      if (!current && initial) return true
      if (current && !initial) return true
      if (current && initial && !isDraftEqual(current, initial)) return true
    }
    return false
  }, [syncCurrentDraftToCache, isDraftEqual])

  const isTypeDirty = useCallback(
    (type: FeedingUiType) => {
      syncCurrentDraftToCache()
      const current = draftByTypeRef.current.get(type)
      const initial = initialDraftByTypeRef.current.get(type)
      if (!current && !initial) return false
      if (!current && initial) return true
      if (current && !initial) return true
      if (current && initial && !isDraftEqual(current, initial)) return true
      return false
    },
    [isDraftEqual, syncCurrentDraftToCache]
  )

  // 当feedId存在时，从feedingList中找到对应的记录并回显数据
  useEffect(() => {
    if (!feedId) return
    if (didHydrateEditRef.current) return

    const feedingRecord = feedingList.find(item => item.feeding_id === feedId)
    if (!feedingRecord) return

    didHydrateEditRef.current = true

    let uiType: FeedingUiType = '母乳'
    switch (feedingRecord.feed_type) {
      case 'formula':
        uiType = '奶粉'
        break
      case 'breast':
      case 'pump':
        uiType = '母乳'
        break
      case 'food':
        uiType = '辅食'
        break
    }

    const parsedFormulaMl = parseFormulaMlFromRemark(feedingRecord.remark || '')
    const parsedMilkDuration = parseMilkDurationFromRemark(
      feedingRecord.remark || ''
    )
    const parsedFoodGrams = parseFoodGramsFromRemark(feedingRecord.remark || '')

    const nextDraft: FeedingDraft = {
      feedingTimeMs: feedingRecord.feed_time,
      note: stripDetailLineFromRemark(feedingRecord.remark || '', uiType),
      formulaMl:
        uiType === '奶粉'
          ? typeof feedingRecord.amount === 'number'
            ? String(feedingRecord.amount)
            : parsedFormulaMl
          : '',
      milkDurationMin:
        uiType === '母乳'
          ? typeof feedingRecord.duration === 'number'
            ? String(feedingRecord.duration)
            : parsedMilkDuration
          : '',
      foodGrams:
        uiType === '辅食'
          ? typeof feedingRecord.amount === 'number'
            ? String(feedingRecord.amount)
            : parsedFoodGrams
          : ''
    }

    draftByTypeRef.current.set(uiType, nextDraft)
    initialDraftByTypeRef.current.set(uiType, nextDraft)
    setSelectedType(uiType)
    setFormulaMl(nextDraft.formulaMl)
    setMilkDurationMin(nextDraft.milkDurationMin)
    setFoodGrams(nextDraft.foodGrams)
    setFeedingTime(new Date(nextDraft.feedingTimeMs))
    setNote(nextDraft.note)
    setActiveEntry(uiType)
  }, [feedId, feedingList])

  useEffect(() => {
    if (feedId) return
    if (initialDraftByTypeRef.current.size > 0) return
    const initialDraft = getCurrentDraft()
    initialDraftByTypeRef.current.set(selectedType, initialDraft)
    draftByTypeRef.current.set(selectedType, initialDraft)
  }, [feedId, getCurrentDraft, selectedType])

  const applyDraft = (draft: FeedingDraft) => {
    setFormulaMl(draft.formulaMl)
    setMilkDurationMin(draft.milkDurationMin)
    setFoodGrams(draft.foodGrams)
    setFeedingTime(new Date(draft.feedingTimeMs))
    setNote(draft.note)
  }

  const getOrInitDraft = (type: FeedingUiType, baseTimeMs: number) => {
    const existing = draftByTypeRef.current.get(type)
    if (existing) return existing
    const nextDraft: FeedingDraft = {
      feedingTimeMs: baseTimeMs,
      note: '',
      formulaMl: '',
      milkDurationMin: '',
      foodGrams: ''
    }
    draftByTypeRef.current.set(type, nextDraft)
    if (!initialDraftByTypeRef.current.has(type)) {
      initialDraftByTypeRef.current.set(type, nextDraft)
    }
    return nextDraft
  }

  const handleTypeChangeRequest = (
    nextType: FeedingUiType,
    afterSwitch?: () => void
  ) => {
    if (nextType === selectedType) return
    const baseTimeMs = feedingTime.getTime()
    const currentDraft: FeedingDraft = {
      feedingTimeMs: baseTimeMs,
      note,
      formulaMl,
      milkDurationMin,
      foodGrams
    }

    const hasInput =
      selectedType === '奶粉'
        ? Boolean(formulaMl.trim() || note.trim())
        : selectedType === '母乳'
          ? Boolean(milkDurationMin.trim() || note.trim())
          : Boolean(foodGrams.trim() || note.trim())

    const switchWithPolicy = (keepCurrentInput: boolean) => {
      if (keepCurrentInput) {
        draftByTypeRef.current.set(selectedType, currentDraft)
      } else {
        draftByTypeRef.current.set(selectedType, {
          feedingTimeMs: baseTimeMs,
          note: '',
          formulaMl: '',
          milkDurationMin: '',
          foodGrams: ''
        })
      }

      setSelectedType(nextType)
      const nextDraft = getOrInitDraft(nextType, baseTimeMs)
      applyDraft(nextDraft)
      afterSwitch?.()
    }

    if (!hasInput) {
      draftByTypeRef.current.set(selectedType, currentDraft)
      setSelectedType(nextType)
      const nextDraft = getOrInitDraft(nextType, baseTimeMs)
      applyDraft(nextDraft)
      afterSwitch?.()
      return
    }

    Alert.alert('切换喂养类型', '当前内容尚未保存，是否保留当前输入？', [
      {
        text: '保留并切换',
        onPress: () => switchWithPolicy(true)
      },
      {
        text: '清空并切换',
        style: 'destructive',
        onPress: () => switchWithPolicy(false)
      }
    ])
  }

  const handleEntryPress = (type: FeedingUiType) => {
    if (type === selectedType) {
      setActiveEntry(type)
      return
    }
    handleTypeChangeRequest(type, () => setActiveEntry(type))
  }

  const EntryButton = ({
    title,
    subtitle,
    icon,
    onPress
  }: {
    title: FeedingUiType
    subtitle: string
    icon: React.ReactNode
    onPress: () => void
  }) => {
    const scale = useRef(new Animated.Value(1)).current

    return (
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true
          }).start()
        }}
        onPressOut={() => {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true
          }).start()
        }}
      >
        <Animated.View
          style={[styles.entryButtonCard, { transform: [{ scale }] }]}
        >
          <View style={styles.entryButtonLeft}>
            <View style={styles.entryIconWrap}>{icon}</View>
            <View style={styles.entryButtonTextBlock}>
              <Text style={styles.entryButtonTitle}>{title}</Text>
              <Text style={styles.entryButtonSubtitle}>{subtitle}</Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={APP_COLORS.iconMuted}
          />
        </Animated.View>
      </Pressable>
    )
  }

  const performSave = useCallback(async (): Promise<boolean> => {
    if (!babyId || isSaving) return false
    let feedType: FeedingType
    switch (selectedType) {
      case '奶粉':
        feedType = FeedingType.FORMULA
        break
      case '母乳':
        feedType = FeedingType.BREAST
        break
      case '辅食':
        feedType = FeedingType.FOOD
        break
      default:
        feedType = FeedingType.BREAST
    }

    const normalizeNumber = (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return undefined
      const parsed = Number(trimmed)
      return Number.isFinite(parsed) ? parsed : undefined
    }

    const normalizedFormulaMl = normalizeNumber(formulaMl)
    const normalizedMilkDuration = normalizeNumber(milkDurationMin)
    const normalizedFoodGrams = normalizeNumber(foodGrams)
    const trimmedNote = note.trim()

    const record = {
      feed_type: feedType,
      start_time: feedingTime.getTime(),
      amount: selectedType === '奶粉' ? normalizedFormulaMl : undefined,
      duration: selectedType === '母乳' ? normalizedMilkDuration : undefined,
      ...(selectedType === '辅食' ? { amount: normalizedFoodGrams } : {}),
      remark: trimmedNote
    }

    // 调用Redux action保存数据
    setIsSaving(true)
    try {
      if (feedId) {
        await dispatch(
          updateFeedingRecord({ babyId, feedingId: feedId, data: record })
        ).unwrap()
        showMessage('更新成功')
      } else {
        await dispatch(saveFeedingRecord({ babyId, data: record })).unwrap()
        showMessage('保存成功')
      }

      DeviceEventEmitter.emit('refreshDashboard')
      const savedDraft = getCurrentDraft()
      draftByTypeRef.current.set(selectedType, savedDraft)
      initialDraftByTypeRef.current.set(selectedType, savedDraft)
      return true
    } catch (error) {
      console.error('保存喂养记录失败:', error)
      showMessage('保存失败，请重试')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [
    babyId,
    isSaving,
    selectedType,
    formulaMl,
    milkDurationMin,
    foodGrams,
    note,
    feedingTime,
    feedId,
    dispatch,
    getCurrentDraft,
    showMessage
  ])

  const closeActiveEntry = useCallback(() => {
    if (!activeEntry) return

    if (!isTypeDirty(activeEntry)) {
      setActiveEntry(null)
      return
    }

    setConfirmMode('closeEntry')
  }, [activeEntry, isTypeDirty])

  const goToDailyRecord = useCallback(() => {
    allowLeaveRef.current = true
    setTimeout(() => {
      if (navigation.canGoBack?.()) {
        navigation.goBack()
      } else {
        navigation.navigate('DailyRecord')
      }
    }, 0)
  }, [navigation])

  const saveAndCloseActiveEntry = useCallback(async () => {
    const ok = await performSave()
    if (!ok) return
    setActiveEntry(null)
    goToDailyRecord()
  }, [performSave, goToDailyRecord])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (allowLeaveRef.current) return
      if (!isDirty()) return

      event.preventDefault()
      pendingNavActionRef.current = event.data.action
      setConfirmMode('leaveScreen')
    })
    return unsubscribe
  }, [navigation, isDirty, performSave])

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={APP_GRADIENTS.softSurface}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topGradient}
        >
          <View style={styles.topCard}>
            <View style={styles.topRow}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  if (!isDirty()) {
                    allowLeaveRef.current = true
                    navigation.goBack()
                    return
                  }

                  pendingNavActionRef.current = null
                  setConfirmMode('leaveScreen')
                }}
                style={styles.iconButton}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color={APP_COLORS.text}
                />
              </TouchableOpacity>
              <Text style={styles.topTitle}>
                {feedId ? '编辑喂养记录' : '新增喂养记录'}
              </Text>
              <View style={styles.iconButtonPlaceholder} />
            </View>

            <Text style={styles.topMetaText}>
              {dayjs(feedingTime).format('YYYY-MM-DD HH:mm')}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroIconWrap}>
                <SparklesAi
                  size={22}
                  color={APP_COLORS.primary}
                  variant="filled"
                />
              </View>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>快速记录喂养</Text>
                <Text style={styles.heroSubtitle}>
                  选择类型后在弹窗内填写信息并保存
                </Text>
              </View>
            </View>

            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaItem}>
                <CalendarDay
                  size={18}
                  color={APP_COLORS.iconMuted}
                  variant="regular"
                />
                <Text style={styles.heroMetaText}>
                  {dayjs(feedingTime).format('YYYY-MM-DD')}
                </Text>
              </View>
              <View style={styles.heroMetaDot} />
              <View style={styles.heroMetaItem}>
                <Clock
                  size={18}
                  color={APP_COLORS.iconMuted}
                  variant="regular"
                />
                <Text style={styles.heroMetaText}>
                  {dayjs(feedingTime).format('HH:mm')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.entryButtons}>
            <EntryButton
              title="辅食"
              subtitle="记录克重"
              onPress={() => handleEntryPress('辅食')}
              icon={
                <FoodTray
                  size={20}
                  color={APP_COLORS.primary}
                  variant="filled"
                />
              }
            />
            <EntryButton
              title="母乳"
              subtitle="记录时长"
              onPress={() => handleEntryPress('母乳')}
              icon={
                <HeartCircle
                  size={20}
                  color={APP_COLORS.primary}
                  variant="filled"
                />
              }
            />
            <EntryButton
              title="奶粉"
              subtitle="记录毫升数"
              onPress={() => handleEntryPress('奶粉')}
              icon={
                <MaterialCommunityIcons
                  name="baby-bottle"
                  size={22}
                  color={APP_COLORS.primary}
                />
              }
            />
          </View>

          <View style={styles.funCard}>
            <View style={styles.funCardRow}>
              <SparklesAi
                size={20}
                color={APP_COLORS.primary}
                variant="filled"
              />
              <Text style={styles.funCardTitle}>小贴士</Text>
            </View>
            <Text style={styles.funCardText}>
              记录越完整，日常记录里的卡片越清晰，回顾也更轻松。
            </Text>
          </View>
        </ScrollView>

        <Modal
          visible={Boolean(activeEntry)}
          transparent
          animationType="slide"
          onRequestClose={closeActiveEntry}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={closeActiveEntry}
              style={styles.modalBackdrop}
            />

            <View style={styles.sheetFloatingCloseRow}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={closeActiveEntry}
                style={styles.sheetFloatingCloseButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#ffffff"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetContainer}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{activeEntry}记录</Text>
              </View>

              <ScrollView
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sheetContent}
              >
                {selectedType === '奶粉' ? (
                  <View style={styles.formItem}>
                    <AmountInput
                      value={formulaMl}
                      onChange={setFormulaMl}
                      type="奶粉"
                      placeholder="例如 120"
                    />
                  </View>
                ) : null}

                {selectedType === '母乳' ? (
                  <View style={styles.formItem}>
                    <DurationInput
                      value={milkDurationMin}
                      onChange={setMilkDurationMin}
                      placeholder="例如 15"
                    />
                  </View>
                ) : null}

                {selectedType === '辅食' ? (
                  <>
                    <View style={styles.formItem}>
                      <AmountInput
                        value={foodGrams}
                        onChange={setFoodGrams}
                        type="辅食"
                        placeholder="例如 30"
                      />
                    </View>
                  </>
                ) : null}

                <View style={styles.formItem}>
                  <TimePicker
                    value={feedingTime}
                    onChange={setFeedingTime}
                    label={Platform.OS === 'android' ? '日期与时间' : '时间'}
                    type={selectedType}
                  />
                </View>

                <View style={styles.formItemLast}>
                  <RemarkInput
                    value={note}
                    onChange={setNote}
                    label="备注"
                    placeholder={
                      selectedType === '奶粉'
                        ? '可选，例如：宝宝接受度、吐奶情况'
                        : selectedType === '辅食'
                          ? '可选，例如：吃了什么、过敏观察'
                          : '可选，例如：宝宝状态、左右侧等'
                    }
                    type={selectedType}
                  />
                </View>
              </ScrollView>

              <View style={styles.sheetFooter}>
                <Button
                  mode="contained"
                  style={styles.saveButton}
                  buttonColor={
                    !babyId || isSaving
                      ? 'rgba(15, 23, 42, 0.10)'
                      : APP_COLORS.primary
                  }
                  textColor={!babyId || isSaving ? '#94a3b8' : '#ffffff'}
                  contentStyle={styles.saveButtonContent}
                  labelStyle={styles.saveButtonText}
                  disabled={!babyId || isSaving}
                  loading={isSaving}
                  onPress={saveAndCloseActiveEntry}
                  uppercase={false}
                >
                  保存
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={confirmMode !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmMode(null)}
        >
          <View style={styles.confirmOverlay}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setConfirmMode(null)}
              style={styles.confirmBackdrop}
            />
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>
                {confirmMode === 'closeEntry' ? '关闭编辑' : '离开喂养记录'}
              </Text>
              <Text style={styles.confirmMessage}>
                当前内容尚未保存，是否要
                {confirmMode === 'closeEntry' ? '关闭' : '退出'}？
              </Text>

              <View style={styles.confirmActions}>
                <Button
                  mode="text"
                  onPress={() => setConfirmMode(null)}
                  textColor={APP_COLORS.textMuted}
                  uppercase={false}
                  disabled={isSaving}
                >
                  继续编辑
                </Button>

                <Button
                  mode="text"
                  onPress={() => {
                    const mode = confirmMode
                    setConfirmMode(null)
                    if (mode === 'closeEntry') {
                      setActiveEntry(null)
                      return
                    }
                    allowLeaveRef.current = true
                    const action = pendingNavActionRef.current
                    if (action) {
                      navigation.dispatch(action)
                    } else {
                      navigation.goBack()
                    }
                  }}
                  textColor={APP_COLORS.error}
                  uppercase={false}
                  disabled={isSaving}
                >
                  {confirmMode === 'closeEntry' ? '不保存关闭' : '不保存退出'}
                </Button>

                <Button
                  mode="contained"
                  onPress={async () => {
                    const ok = await performSave()
                    if (!ok) return
                    setConfirmMode(null)
                    goToDailyRecord()
                  }}
                  buttonColor={APP_COLORS.primary}
                  textColor="#ffffff"
                  uppercase={false}
                  loading={isSaving}
                  disabled={!babyId || isSaving}
                >
                  {confirmMode === 'closeEntry' ? '保存并关闭' : '保存并退出'}
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_COLORS.background
  },
  safeArea: {
    flex: 1
  },
  topGradient: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10
  },
  topCard: {
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: APP_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40
  },
  topTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: APP_COLORS.text
  },
  topMetaText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textMuted,
    textAlign: 'center'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16
  },
  heroCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 22,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceVariant
  },
  heroTextBlock: {
    flex: 1,
    marginLeft: 10
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textMuted
  },
  heroMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  heroMetaText: {
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.textMuted
  },
  heroMetaDot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: APP_COLORS.outlineVariant,
    marginHorizontal: 10
  },
  entryButtons: {
    marginTop: 12,
    gap: 10
  },
  entryButtonCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  entryButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  entryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceVariant
  },
  entryButtonTextBlock: {
    marginLeft: 10,
    flex: 1
  },
  entryButtonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  entryButtonSubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textMuted
  },
  funCard: {
    marginTop: 12,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant
  },
  funCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  funCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  funCardText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textMuted,
    lineHeight: 18
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    justifyContent: 'flex-end'
  },
  modalBackdrop: {
    flex: 1
  },
  sheetFloatingCloseRow: {
    alignItems: 'center',
    paddingBottom: 10
  },
  sheetFloatingCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)'
  },
  sheetContainer: {
    backgroundColor: APP_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant,
    overflow: 'hidden'
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: APP_COLORS.outlineVariant,
    marginTop: 10,
    marginBottom: 4
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  sheetContent: {
    paddingBottom: 16
  },
  sheetFooter: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: APP_COLORS.outlineVariant
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  confirmMessage: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: APP_COLORS.textMuted
  },
  confirmActions: {
    marginTop: 12,
    gap: 6
  },
  formItem: {
    marginBottom: 20
  },
  formItemLast: {
    marginBottom: 6
  },
  saveButton: {
    borderRadius: 16
  },
  saveButtonContent: {
    minHeight: 52
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700'
  }
})

export default FeedingRecordScreen
