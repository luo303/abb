import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import AppKeyboardAvoidingView from '../../components/common/AppKeyboardAvoidingView'

// 导入拆分后的组件
import CurveTabs from '../../components/growth/curve/CurveTabs'
import CurveRecordForm from '../../components/growth/curve/CurveRecordForm'
import CurveHeightChart from '../../components/growth/curve/CurveHeightChart'
import CurveWeightChart from '../../components/growth/curve/CurveWeightChart'
import CurveHeadChart from '../../components/growth/curve/CurveHeadChart'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import {
  fetchGrowthCurve,
  fetchBabyProfile,
  upsertGrowthRecord,
  applyGrowthRecordLocal
} from '../../store/modules/BabyStore'
import { useMessage } from '../../components/Message'
import {
  GrowthAnalysisPayload,
  GrowthAnalysisMetric,
  GrowthAnalysisUnit
} from '../../api/ai'

export default function GrowthCurveScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState('record') // record, height, weight, head
  const { currentBabyId, currentBabyDetail, babiesList } = useSelector(
    (state: RootState) => state.baby
  )
  const growthCurve = useSelector((state: RootState) => state.baby.growthCurve)
  const hasBaby = !!currentBabyId || (babiesList && babiesList.length > 0)
  const dispatch = useDispatch<any>()
  const { showMessage } = useMessage()

  useEffect(() => {
    if (!currentBabyId) return
    if (!currentBabyDetail || currentBabyDetail.baby_id !== currentBabyId) {
      dispatch(fetchBabyProfile(currentBabyId))
    }
  }, [dispatch, currentBabyId, currentBabyDetail])

  useFocusEffect(
    React.useCallback(() => {
      if (!currentBabyId) return
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
    }, [dispatch, currentBabyId])
  )

  // 表单状态
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [headCircumference, setHeadCircumference] = useState('')
  const [date, setDate] = useState<number>(Date.now())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 检查表单是否已填写（所有项都必须填写）
  const isFormValid = height && weight && headCircumference

  const tabs = [
    { key: 'record', label: '记录' },
    { key: 'height', label: '身高曲线' },
    { key: 'weight', label: '体重曲线' },
    { key: 'head', label: '头围曲线' }
  ]

  const handleSaveRecord = async () => {
    if (!currentBabyId || isSubmitting) return

    const parsedHeight = Number(height)
    const parsedWeight = Number(weight)
    const parsedHead = Number(headCircumference)

    if (
      Number.isNaN(parsedHeight) ||
      Number.isNaN(parsedWeight) ||
      Number.isNaN(parsedHead)
    ) {
      showMessage('请输入有效的数值')
      return
    }

    if (parsedHeight <= 0 || parsedWeight <= 0 || parsedHead <= 0) {
      showMessage('数值需大于 0')
      return
    }

    setIsSubmitting(true)
    try {
      const resultAction = await dispatch(
        upsertGrowthRecord({
          baby_id: currentBabyId,
          record_time: date,
          height: parsedHeight,
          weight: parsedWeight,
          head_circumference: parsedHead,
          remark: ''
        })
      )

      if (upsertGrowthRecord.fulfilled.match(resultAction)) {
        if (resultAction.payload?.code === 0) {
          setHeight('')
          setWeight('')
          setHeadCircumference('')

          dispatch(
            applyGrowthRecordLocal({
              baby_id: currentBabyId,
              record_time: date,
              height: parsedHeight,
              weight: parsedWeight,
              head_circumference: parsedHead,
              remark: ''
            })
          )
        } else {
          showMessage(resultAction.payload?.message || '保存失败')
        }
      } else {
        showMessage((resultAction.payload as string) || '保存失败')
      }
    } catch {
      Alert.alert('提示', '保存失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* 固定在顶部的 Tabs */}
      <View style={{ zIndex: 10 }}>
        <CurveTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      <AppKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            hasBaby ? styles.scrollContent : styles.scrollContentEmpty
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!hasBaby && (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={48} color="#c5d9ff" />
              <Text style={[styles.emptyText, { marginTop: 12 }]}>
                暂无宝宝信息，添加宝宝后可查看成长曲线
              </Text>
            </View>
          )}
          {hasBaby && activeTab === 'record' && (
            <CurveRecordForm
              height={height}
              setHeight={setHeight}
              weight={weight}
              setWeight={setWeight}
              headCircumference={headCircumference}
              setHeadCircumference={setHeadCircumference}
              date={date}
              onDateChange={setDate}
              minDate={currentBabyDetail?.birthday}
            />
          )}

          {hasBaby && activeTab === 'height' && <CurveHeightChart />}
          {hasBaby && activeTab === 'weight' && <CurveWeightChart />}
          {hasBaby && activeTab === 'head' && <CurveHeadChart />}
        </ScrollView>

        {/* 底部按钮 */}
        {activeTab === 'record' ? (
          hasBaby && (
            <View
              style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}
            >
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!isFormValid || isSubmitting) && styles.saveButtonDisabled
                ]}
                disabled={!isFormValid || isSubmitting}
                onPress={handleSaveRecord}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    (!isFormValid || isSubmitting) &&
                      styles.saveButtonTextDisabled
                  ]}
                >
                  {isSubmitting
                    ? '保存中...'
                    : isFormValid
                      ? '保存记录'
                      : '请填写数据'}
                </Text>
                {isFormValid && !isSubmitting && (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            {hasBaby ? (
              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => {
                  if (!currentBabyDetail) {
                    showMessage('未获取到宝宝信息')
                    return
                  }
                  let metric: GrowthAnalysisMetric = 'height'
                  let unit: GrowthAnalysisUnit = 'cm'
                  let items: { time: number; value: number }[] = []
                  if (activeTab === 'height') {
                    metric = 'height'
                    unit = 'cm'
                    items = growthCurve.height
                  } else if (activeTab === 'weight') {
                    metric = 'weight'
                    unit = 'kg'
                    items = growthCurve.weight
                  } else {
                    metric = 'head_circumference'
                    unit = 'cm'
                    items = growthCurve.head
                  }
                  const payload: GrowthAnalysisPayload = {
                    birthday: currentBabyDetail.birthday!,
                    metric,
                    unit,
                    items
                  }
                  // @ts-ignore
                  navigation.navigate('GrowthAnalysis', {
                    growthAnalysis: payload
                  })
                }}
              >
                <View style={styles.aiButtonContent}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.aiButtonText}>AI 智能分析</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#fff"
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </AppKeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  keyboardView: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20
  },
  footer: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingTop: 10
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#EE6666',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EE6666',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, // 降低阴影不透明度
    shadowRadius: 8,
    elevation: 4
  },
  saveButtonDisabled: {
    backgroundColor: '#F0F0F0',
    shadowOpacity: 0,
    elevation: 0
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  saveButtonTextDisabled: {
    color: '#CCC'
  },
  aiButton: {
    backgroundColor: '#5470C6',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5470C6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  aiButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#999',
    fontSize: 16
  }
})
