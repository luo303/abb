import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  DeviceEventEmitter,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from 'react-native-paper'
import {
  AngleRightSmall,
  ArrowsRotate,
  CalendarDay,
  CheckCircle,
  Clock,
  Droplet,
  Pen,
  WavePulse,
  Xmark
} from '@zappicon/react-native'
import dayjs from 'dayjs'
import { RootState, AppDispatch } from '../store'
import {
  Option,
  DiaperType,
  PeeColor,
  PoopColor,
  PoopConsistency,
  DiaperRecordRequest,
  DiaperItem
} from '../types/diaper'

import {
  addDiaperRecord,
  updateDiaperRecord,
  addDiaperItem,
  updateDiaperItem
} from '../store/modules/diaperStore'
import { useMessage } from '../components/Message'
import { TimePicker } from '../components/DailyRecord/DiaperRecord/TimePicker'
import { PeeColorSelector } from '../components/DailyRecord/DiaperRecord/PeeColorSelector'
import { PoopColorSelector } from '../components/DailyRecord/DiaperRecord/PoopColorSelector'
import { PoopConsistencySelector } from '../components/DailyRecord/DiaperRecord/PoopConsistencySelector'
import { RemarkInput } from '../components/DailyRecord/DiaperRecord/RemarkInput'
import { generateTempId } from '../utils/idGenerator'
import { APP_COLORS, APP_GRADIENTS } from '../theme/paperTheme'

interface RouteParams {
  diaper_id?: string
}

type ConfirmMode = 'closeEntry' | 'leaveScreen'

type DiaperDraft = {
  diaperType: Option
  changeTimeMs: number
  peeColor?: Option
  poopColor?: Option
  poopConsistency?: Option
  remark: string
}

const DIAPER_TYPE_OPTIONS: Option[] = [
  { id: DiaperType.PEE, name: '嘘嘘' },
  { id: DiaperType.POOP, name: '便便' },
  { id: DiaperType.BOTH, name: '嘘嘘+便便' },
  { id: DiaperType.DRY, name: '干爽' }
]

const getDefaultDraftForType = (
  diaperType: Option,
  baseTimeMs: number
): DiaperDraft => {
  switch (diaperType.id) {
    case DiaperType.PEE:
      return {
        diaperType,
        changeTimeMs: baseTimeMs,
        peeColor: { id: PeeColor.NORMAL, name: '正常' },
        remark: ''
      }
    case DiaperType.POOP:
      return {
        diaperType,
        changeTimeMs: baseTimeMs,
        poopColor: { id: PoopColor.YELLOW, name: '黄色' },
        poopConsistency: { id: PoopConsistency.PASTE, name: '膏状' },
        remark: ''
      }
    case DiaperType.BOTH:
      return {
        diaperType,
        changeTimeMs: baseTimeMs,
        peeColor: { id: PeeColor.NORMAL, name: '正常' },
        poopColor: { id: PoopColor.YELLOW, name: '黄色' },
        poopConsistency: { id: PoopConsistency.PASTE, name: '膏状' },
        remark: ''
      }
    case DiaperType.DRY:
    default:
      return {
        diaperType,
        changeTimeMs: baseTimeMs,
        remark: ''
      }
  }
}

const DiaperFormScreen = () => {
  const navigation = useNavigation<any>()
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>()
  const dispatch = useDispatch<AppDispatch>()
  const { showMessage } = useMessage()

  const babyId = useSelector((state: RootState) => state.baby.currentBabyId)
  const diaperList = useSelector((state: RootState) => state.diaper.diaperList)

  const diaperId = route.params?.diaper_id
  const isEditMode = !!diaperId

  const [selectedType, setSelectedType] = useState<Option>(
    DIAPER_TYPE_OPTIONS[0]
  )
  const [selectedPeeColor, setSelectedPeeColor] = useState<Option | undefined>({
    id: PeeColor.NORMAL,
    name: '正常'
  })
  const [selectedPoopColor, setSelectedPoopColor] = useState<
    Option | undefined
  >({ id: PoopColor.YELLOW, name: '黄色' })
  const [selectedPoopConsistency, setSelectedPoopConsistency] = useState<
    Option | undefined
  >({ id: PoopConsistency.PASTE, name: '膏状' })
  const [selectedTime, setSelectedTime] = useState(() => new Date())
  const [remark, setRemark] = useState('')
  const [activeEntry, setActiveEntry] = useState<Option | null>(null)
  const [confirmMode, setConfirmMode] = useState<ConfirmMode | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const didHydrateEditRef = useRef(false)
  const allowLeaveRef = useRef(false)
  const pendingNavActionRef = useRef<any>(null)
  const draftRef = useRef<DiaperDraft | null>(null)
  const initialDraftRef = useRef<DiaperDraft | null>(null)

  const getCurrentDraft = useCallback((): DiaperDraft => {
    return {
      diaperType: selectedType,
      changeTimeMs: selectedTime.getTime(),
      ...(selectedType.id === DiaperType.PEE ||
      selectedType.id === DiaperType.BOTH
        ? { peeColor: selectedPeeColor }
        : {}),
      ...(selectedType.id === DiaperType.POOP ||
      selectedType.id === DiaperType.BOTH
        ? {
            poopColor: selectedPoopColor,
            poopConsistency: selectedPoopConsistency
          }
        : {}),
      remark
    }
  }, [
    remark,
    selectedPeeColor,
    selectedPoopColor,
    selectedPoopConsistency,
    selectedTime,
    selectedType
  ])

  const isDraftEqual = useCallback((a: DiaperDraft, b: DiaperDraft) => {
    const sameType = a.diaperType.id === b.diaperType.id
    const sameTime = a.changeTimeMs === b.changeTimeMs
    const sameRemark = a.remark === b.remark
    const samePee = (a.peeColor?.id || '') === (b.peeColor?.id || '')
    const samePoopColor = (a.poopColor?.id || '') === (b.poopColor?.id || '')
    const samePoopConsistency =
      (a.poopConsistency?.id || '') === (b.poopConsistency?.id || '')
    return (
      sameType &&
      sameTime &&
      sameRemark &&
      samePee &&
      samePoopColor &&
      samePoopConsistency
    )
  }, [])

  const syncDraftRef = useCallback(() => {
    draftRef.current = getCurrentDraft()
  }, [getCurrentDraft])

  const isTypeDirty = useCallback(() => {
    if (!activeEntry) return false
    syncDraftRef()
    const current = draftRef.current
    const initial = initialDraftRef.current
    if (!current && !initial) return false
    if (!current || !initial) return true
    return !isDraftEqual(current, initial)
  }, [activeEntry, isDraftEqual, syncDraftRef])

  const applyDraft = useCallback((draft: DiaperDraft) => {
    setSelectedType(draft.diaperType)
    setSelectedTime(new Date(draft.changeTimeMs))
    setSelectedPeeColor(draft.peeColor)
    setSelectedPoopColor(draft.poopColor)
    setSelectedPoopConsistency(draft.poopConsistency)
    setRemark(draft.remark)
  }, [])

  useEffect(() => {
    if (!isEditMode || !babyId || !diaperId) return
    if (didHydrateEditRef.current) return

    const diaperItem = diaperList.find(item => item.diaper_id === diaperId)
    if (!diaperItem) return

    didHydrateEditRef.current = true

    const hydratedDraft: DiaperDraft = {
      diaperType: diaperItem.diaper_type,
      changeTimeMs: diaperItem.change_time,
      ...(diaperItem.diaper_type.id === DiaperType.PEE ||
      diaperItem.diaper_type.id === DiaperType.BOTH
        ? { peeColor: diaperItem.pee_color || undefined }
        : {}),
      ...(diaperItem.diaper_type.id === DiaperType.POOP ||
      diaperItem.diaper_type.id === DiaperType.BOTH
        ? {
            poopColor: diaperItem.poop_color || undefined,
            poopConsistency: diaperItem.poop_consistency || undefined
          }
        : {}),
      remark: diaperItem.remark || ''
    }

    applyDraft(hydratedDraft)
    draftRef.current = hydratedDraft
    initialDraftRef.current = hydratedDraft
    setActiveEntry(diaperItem.diaper_type)
  }, [applyDraft, babyId, diaperId, diaperList, isEditMode])

  useEffect(() => {
    if (!activeEntry) return
    syncDraftRef()
  }, [
    activeEntry,
    remark,
    selectedPeeColor,
    selectedPoopColor,
    selectedPoopConsistency,
    selectedTime,
    selectedType,
    syncDraftRef
  ])

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

  const performSave = useCallback(async (): Promise<boolean> => {
    if (!babyId || isSaving) return false
    const currentDraft = getCurrentDraft()
    const activeType = activeEntry || currentDraft.diaperType
    const activeTypeId = activeType.id
    const currentChangeTimeMs = currentDraft.changeTimeMs
    const currentRemark = currentDraft.remark
    const currentPeeColor = currentDraft.peeColor
    const currentPoopColor = currentDraft.poopColor
    const currentPoopConsistency = currentDraft.poopConsistency

    if (activeTypeId === DiaperType.POOP || activeTypeId === DiaperType.BOTH) {
      if (!currentPoopColor) {
        showMessage('请选择便便颜色')
        return false
      }
      if (!currentPoopConsistency) {
        showMessage('请选择便便性状')
        return false
      }
    }

    if (activeTypeId === DiaperType.PEE || activeTypeId === DiaperType.BOTH) {
      if (!currentPeeColor) {
        showMessage('请选择嘘嘘颜色')
        return false
      }
    }

    setIsSaving(true)
    try {
      const baseData = {
        diaper_type: activeTypeId,
        change_time: currentChangeTimeMs,
        remark: currentRemark
      }

      const requestData: DiaperRecordRequest = { ...baseData }

      if (
        (activeTypeId === DiaperType.PEE || activeTypeId === DiaperType.BOTH) &&
        currentPeeColor?.id
      ) {
        requestData.pee_color = currentPeeColor.id
      }

      if (
        activeTypeId === DiaperType.POOP ||
        activeTypeId === DiaperType.BOTH
      ) {
        if (currentPoopColor?.id) {
          requestData.poop_color = currentPoopColor.id
        }
        if (currentPoopConsistency?.id) {
          requestData.poop_consistency = currentPoopConsistency.id
        }
      }

      const normalizedPee =
        activeTypeId === DiaperType.PEE || activeTypeId === DiaperType.BOTH
          ? currentPeeColor || null
          : null

      const normalizedPoopColor =
        activeTypeId === DiaperType.POOP || activeTypeId === DiaperType.BOTH
          ? currentPoopColor || null
          : null

      const normalizedPoopConsistency =
        activeTypeId === DiaperType.POOP || activeTypeId === DiaperType.BOTH
          ? currentPoopConsistency || null
          : null

      if (isEditMode && diaperId) {
        await dispatch(
          updateDiaperItem({ babyId, diaperId, data: requestData })
        ).unwrap()

        const updatedRecord: DiaperItem = {
          diaper_id: diaperId,
          baby_id: babyId,
          diaper_type: activeType,
          change_time: requestData.change_time,
          pee_color: normalizedPee,
          poop_color: normalizedPoopColor,
          poop_consistency: normalizedPoopConsistency,
          remark: requestData.remark
        }

        dispatch(updateDiaperRecord(updatedRecord))
        showMessage('记录已更新')
      } else {
        const tempId = generateTempId('diaper')
        const newRecord: DiaperItem = {
          diaper_id: tempId,
          baby_id: babyId,
          diaper_type: activeType,
          change_time: requestData.change_time,
          pee_color: normalizedPee,
          poop_color: normalizedPoopColor,
          poop_consistency: normalizedPoopConsistency,
          remark: requestData.remark
        }

        dispatch(addDiaperRecord(newRecord))
        await dispatch(addDiaperItem({ babyId, data: requestData })).unwrap()
        showMessage('记录已保存')
      }

      DeviceEventEmitter.emit('refreshDashboard')
      const savedDraft = getCurrentDraft()
      draftRef.current = savedDraft
      initialDraftRef.current = savedDraft
      return true
    } catch {
      showMessage('保存失败，请重试')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [
    activeEntry,
    babyId,
    diaperId,
    dispatch,
    getCurrentDraft,
    isEditMode,
    isSaving,
    showMessage
  ])

  const saveAndCloseActiveEntry = useCallback(async () => {
    const ok = await performSave()
    if (!ok) return
    setActiveEntry(null)
    goToDailyRecord()
  }, [goToDailyRecord, performSave])

  const closeActiveEntry = useCallback(() => {
    if (!activeEntry) return
    if (!isTypeDirty()) {
      setActiveEntry(null)
      return
    }
    setConfirmMode('closeEntry')
  }, [activeEntry, isTypeDirty])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (allowLeaveRef.current) return
      if (!isTypeDirty()) return

      event.preventDefault()
      pendingNavActionRef.current = event.data.action
      setConfirmMode('leaveScreen')
    })
    return unsubscribe
  }, [isTypeDirty, navigation])

  const handleEntryPress = useCallback(
    (nextType: Option) => {
      const baseTimeMs = selectedTime.getTime()
      const nextDraft = getDefaultDraftForType(nextType, baseTimeMs)
      applyDraft(nextDraft)
      draftRef.current = nextDraft
      initialDraftRef.current = nextDraft
      setActiveEntry(nextType)
    },
    [applyDraft, selectedTime]
  )

  const heroSubtitle = useMemo(() => {
    if (isEditMode) return '在弹窗内修改并保存，日常记录会自动刷新'
    return '选择状态后在弹窗内补充信息并保存'
  }, [isEditMode])

  const EntryButton = ({
    title,
    subtitle,
    icon,
    onPress
  }: {
    title: string
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
          <View style={styles.entryButtonTopRow}>
            <View style={styles.entryIconWrap}>{icon}</View>
            <AngleRightSmall
              size={20}
              color={APP_COLORS.iconMuted}
              variant="regular"
            />
          </View>
          <View style={styles.entryButtonTextBlock}>
            <Text numberOfLines={1} style={styles.entryButtonTitle}>
              {title}
            </Text>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.entryButtonSubtitle}
            >
              {subtitle}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    )
  }

  const renderSheetContent = () => {
    const entryTypeId = activeEntry?.id || selectedType.id
    const showPee =
      entryTypeId === DiaperType.PEE || entryTypeId === DiaperType.BOTH
    const showPoop =
      entryTypeId === DiaperType.POOP || entryTypeId === DiaperType.BOTH
    const sheetHint =
      entryTypeId === DiaperType.PEE
        ? '补充嘘嘘相关信息'
        : entryTypeId === DiaperType.POOP
          ? '补充便便相关信息'
          : entryTypeId === DiaperType.BOTH
            ? '一次记录完整状态'
            : '记录时间和备注即可'

    return (
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.sheetContent}
      >
        <View style={styles.sheetHeroCard}>
          <View style={styles.sheetHeroIconWrap}>
            <ArrowsRotate
              size={20}
              color={APP_COLORS.primary}
              variant="filled"
            />
          </View>
          <View style={styles.sheetHeroTextBlock}>
            <Text style={styles.sheetHeroTitle}>
              {activeEntry?.name || '尿布'}编辑
            </Text>
            <Text style={styles.sheetHeroSubtitle}>{sheetHint}</Text>
          </View>
        </View>

        <View style={styles.sheetSectionCard}>
          <View style={styles.formItemTitleRow}>
            <View style={styles.formItemIconWrap}>
              <Clock size={16} color={APP_COLORS.primary} variant="filled" />
            </View>
            <Text style={styles.formItemTitle}>更换时间</Text>
          </View>
          <TimePicker
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
          />
        </View>

        {showPee && (
          <View style={styles.sheetSectionCard}>
            <View style={styles.formItemTitleRow}>
              <View style={styles.formItemIconWrap}>
                <Droplet
                  size={16}
                  color={APP_COLORS.primary}
                  variant="filled"
                />
              </View>
              <Text style={styles.formItemTitle}>嘘嘘颜色</Text>
            </View>
            <PeeColorSelector
              selectedColor={selectedPeeColor}
              onSelectColor={setSelectedPeeColor}
            />
          </View>
        )}

        {showPoop && (
          <>
            <View style={styles.sheetSectionCard}>
              <View style={styles.formItemTitleRow}>
                <View style={styles.formItemIconWrap}>
                  <WavePulse
                    size={16}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                </View>
                <Text style={styles.formItemTitle}>便便颜色</Text>
              </View>
              <PoopColorSelector
                selectedColor={selectedPoopColor}
                onSelectColor={setSelectedPoopColor}
              />
            </View>
            <View style={styles.sheetSectionCard}>
              <View style={styles.formItemTitleRow}>
                <View style={styles.formItemIconWrap}>
                  <ArrowsRotate
                    size={16}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                </View>
                <Text style={styles.formItemTitle}>便便性状</Text>
              </View>
              <PoopConsistencySelector
                selectedConsistency={selectedPoopConsistency}
                onSelectConsistency={setSelectedPoopConsistency}
              />
            </View>
          </>
        )}

        <View style={[styles.sheetSectionCard, styles.formItemLast]}>
          <View style={styles.formItemTitleRow}>
            <View style={styles.formItemIconWrap}>
              <Pen size={16} color={APP_COLORS.primary} variant="filled" />
            </View>
            <Text style={styles.formItemTitle}>备注</Text>
          </View>
          <RemarkInput value={remark} onChangeText={setRemark} />
        </View>
      </ScrollView>
    )
  }

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
                onPress={() => navigation.goBack()}
                style={styles.iconButton}
              >
                <AngleRightSmall
                  size={22}
                  color={APP_COLORS.primary}
                  variant="regular"
                  style={styles.backIcon}
                />
              </TouchableOpacity>

              <Text style={styles.topTitle}>换尿布</Text>
              <View style={styles.iconButtonPlaceholder} />
            </View>

            <Text style={styles.topMetaText}>
              {isEditMode ? '编辑记录' : '快速记录'}
            </Text>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroIconWrap}>
                <ArrowsRotate
                  size={22}
                  color={APP_COLORS.primary}
                  variant="filled"
                />
              </View>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroTitle}>尿布状态快速记录</Text>
                <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
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
                  {dayjs(selectedTime).format('YYYY-MM-DD')}
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
                  {dayjs(selectedTime).format('HH:mm')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.entryGrid}>
            <View style={styles.entryGridItem}>
              <EntryButton
                title="嘘嘘"
                subtitle="记录尿液颜色"
                onPress={() => handleEntryPress(DIAPER_TYPE_OPTIONS[0])}
                icon={
                  <Droplet
                    size={20}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                }
              />
            </View>
            <View style={styles.entryGridItem}>
              <EntryButton
                title="便便"
                subtitle="记录颜色与性状"
                onPress={() => handleEntryPress(DIAPER_TYPE_OPTIONS[1])}
                icon={
                  <WavePulse
                    size={20}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                }
              />
            </View>
            <View style={styles.entryGridItem}>
              <EntryButton
                title="嘘嘘+便便"
                subtitle="一次记录更完整"
                onPress={() => handleEntryPress(DIAPER_TYPE_OPTIONS[2])}
                icon={
                  <ArrowsRotate
                    size={20}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                }
              />
            </View>
            <View style={styles.entryGridItem}>
              <EntryButton
                title="干爽"
                subtitle="只记录状态"
                onPress={() => handleEntryPress(DIAPER_TYPE_OPTIONS[3])}
                icon={
                  <CheckCircle
                    size={20}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                }
              />
            </View>
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
                <Xmark size={20} color="#ffffff" variant="regular" />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetContainer}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {activeEntry?.name || '尿布'}记录
                </Text>
              </View>

              {renderSheetContent()}

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
                {confirmMode === 'closeEntry' ? '关闭编辑' : '离开换尿布'}
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
                      const initial = initialDraftRef.current
                      if (initial) applyDraft(initial)
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
  backIcon: {
    transform: [{ rotate: '180deg' }]
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
  entryGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  entryGridItem: {
    flexBasis: '48%',
    flexGrow: 1
  },
  entryButtonCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    height: 116
  },
  entryButtonTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
    marginTop: 10
  },
  entryButtonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  entryButtonSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: APP_COLORS.textMuted
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.30)'
  },
  sheetFloatingCloseRow: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'flex-end',
    paddingHorizontal: 16
  },
  sheetFloatingCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetContainer: {
    backgroundColor: APP_COLORS.backgroundSoft,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 12,
    maxHeight: '88%'
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: APP_COLORS.outlineVariant,
    alignSelf: 'center',
    marginTop: 10
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: APP_COLORS.text
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16
  },
  sheetHeroCard: {
    marginBottom: 10,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  sheetHeroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceVariant
  },
  sheetHeroTextBlock: {
    marginLeft: 10,
    flex: 1
  },
  sheetHeroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  sheetHeroSubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: APP_COLORS.textMuted
  },
  sheetSectionCard: {
    marginBottom: 10,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant,
    paddingVertical: 12
  },
  formItem: {
    marginBottom: 12
  },
  formItemLast: {
    marginBottom: 4
  },
  formItemTitleRow: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  formItemIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceVariant
  },
  formItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: APP_COLORS.textMuted,
    marginLeft: 8
  },
  sheetFooter: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: APP_COLORS.outlineVariant
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
  },
  confirmOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.30)'
  },
  confirmCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: '900',
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8
  }
})

export default DiaperFormScreen
