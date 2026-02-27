import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'

// 导入拆分后的组件
import CurveTabs from '../../components/growth/curve/CurveTabs'
import CurveRecordForm from '../../components/growth/curve/CurveRecordForm'
import CurveHeightChart from '../../components/growth/curve/CurveHeightChart'
import CurveWeightChart from '../../components/growth/curve/CurveWeightChart'
import CurveHeadChart from '../../components/growth/curve/CurveHeadChart'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { fetchGrowthCurve } from '../../store/modules/BabyStore'

export default function GrowthCurveScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState('record') // record, height, weight, head
  const { currentBabyId, babiesList } = useSelector(
    (state: RootState) => state.baby
  )
  const hasBaby = !!currentBabyId || (babiesList && babiesList.length > 0)
  const dispatch = useDispatch<any>()

  useEffect(() => {
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
  }, [dispatch])

  // 表单状态
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [headCircumference, setHeadCircumference] = useState('')
  const [date, setDate] = useState<number>(Date.now())

  // 检查表单是否已填写（所有项都必须填写）
  const isFormValid = height && weight && headCircumference

  const tabs = [
    { key: 'record', label: '记录' },
    { key: 'height', label: '身高曲线' },
    { key: 'weight', label: '体重曲线' },
    { key: 'head', label: '头围曲线' }
  ]

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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={
            hasBaby ? styles.scrollContent : styles.scrollContentEmpty
          }
          showsVerticalScrollIndicator={false}
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
            />
          )}

          {hasBaby && activeTab === 'height' && <CurveHeightChart />}
          {hasBaby && activeTab === 'weight' && <CurveWeightChart />}
          {hasBaby && activeTab === 'head' && <CurveHeadChart />}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 底部按钮 */}
      {activeTab === 'record' ? (
        hasBaby && (
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled
              ]}
              disabled={!isFormValid}
            >
              <Text
                style={[
                  styles.saveButtonText,
                  !isFormValid && styles.saveButtonTextDisabled
                ]}
              >
                {isFormValid ? '保存记录' : '请填写数据'}
              </Text>
              {isFormValid && (
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
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          {hasBaby ? (
            <TouchableOpacity
              style={styles.aiButton}
              onPress={() => {
                navigation.goBack()
                // @ts-ignore
                navigation.navigate('AIAssistant')
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA' // 浅灰蓝背景
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  scrollContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F7FA', // 与背景同色
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
