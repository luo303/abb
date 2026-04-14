import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter,
  Alert
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import AppKeyboardAvoidingView from '../components/common/AppKeyboardAvoidingView'
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
import { DiaperTypeSelector } from '../components/DailyRecord/DiaperRecord/DiaperTypeSelector'
import { PeeColorSelector } from '../components/DailyRecord/DiaperRecord/PeeColorSelector'
import { PoopColorSelector } from '../components/DailyRecord/DiaperRecord/PoopColorSelector'
import { PoopConsistencySelector } from '../components/DailyRecord/DiaperRecord/PoopConsistencySelector'
import { RemarkInput } from '../components/DailyRecord/DiaperRecord/RemarkInput'
import { generateTempId } from '../utils/idGenerator'

interface RouteParams {
  diaper_id?: string
}

const DiaperFormScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>()
  const dispatch = useDispatch<AppDispatch>()
  const { showMessage } = useMessage()

  const babyId = useSelector((state: RootState) => state.baby.currentBabyId)
  const diaperList = useSelector((state: RootState) => state.diaper.diaperList)

  const diaperId = route.params?.diaper_id
  const isEditMode = !!diaperId

  const [selectedType, setSelectedType] = useState<Option>({
    id: DiaperType.PEE,
    name: '嘘嘘'
  })
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
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [remark, setRemark] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 初始化数据
  useEffect(() => {
    if (isEditMode && babyId) {
      const diaperItem = diaperList.find(item => item.diaper_id === diaperId)
      if (diaperItem) {
        setSelectedType(diaperItem.diaper_type)
        setSelectedPeeColor(diaperItem.pee_color || undefined)
        setSelectedPoopColor(diaperItem.poop_color || undefined)
        setSelectedPoopConsistency(diaperItem.poop_consistency || undefined)
        setSelectedTime(new Date(diaperItem.change_time))
        setRemark(diaperItem.remark || '')
      }
    }
  }, [isEditMode, diaperId, diaperList, babyId])

  // 处理保存
  const handleSave = async () => {
    if (!babyId) {
      showMessage('请先选择宝宝')
      return
    }

    // 数据校验
    if (
      selectedType.id === DiaperType.POOP ||
      selectedType.id === DiaperType.BOTH
    ) {
      if (!selectedPoopColor) {
        showMessage('请选择便便颜色')
        return
      }
      if (!selectedPoopConsistency) {
        showMessage('请选择便便性状')
        return
      }
    }

    if (
      selectedType.id === DiaperType.PEE ||
      selectedType.id === DiaperType.BOTH
    ) {
      if (!selectedPeeColor) {
        showMessage('请选择嘘嘘颜色')
        return
      }
    }

    setIsLoading(true)
    try {
      // 先创建基本数据
      const baseData = {
        diaper_type: selectedType.id,
        change_time: selectedTime.getTime(),
        remark
      }

      // 根据类型添加相应的字段，只在有值时添加
      let requestData: DiaperRecordRequest = { ...baseData }

      // 只在需要且有值时添加 pee_color
      if (
        (selectedType.id === DiaperType.PEE ||
          selectedType.id === DiaperType.BOTH) &&
        selectedPeeColor?.id
      ) {
        requestData.pee_color = selectedPeeColor.id
      }

      // 只在需要且有值时添加 poop_color 和 poop_consistency
      if (
        selectedType.id === DiaperType.POOP ||
        selectedType.id === DiaperType.BOTH
      ) {
        if (selectedPoopColor?.id) {
          requestData.poop_color = selectedPoopColor.id
        }
        if (selectedPoopConsistency?.id) {
          requestData.poop_consistency = selectedPoopConsistency.id
        }
      }

      if (isEditMode && diaperId) {
        // 编辑模式
        const updatedRecord: DiaperItem = {
          diaper_id: diaperId,
          baby_id: babyId,
          diaper_type: selectedType,
          change_time: requestData.change_time,
          pee_color: selectedPeeColor || null,
          poop_color: selectedPoopColor || null,
          poop_consistency: selectedPoopConsistency || null,
          remark: requestData.remark
        }
        await dispatch(
          updateDiaperItem({ babyId, diaperId, data: requestData })
        ).unwrap()
        dispatch(updateDiaperRecord(updatedRecord))
        showMessage('记录已更新')
      } else {
        // 新增模式
        const tempId = generateTempId('diaper')
        const newRecord: DiaperItem = {
          diaper_id: tempId,
          baby_id: babyId,
          diaper_type: selectedType,
          change_time: requestData.change_time,
          pee_color: selectedPeeColor || null,
          poop_color: selectedPoopColor || null,
          poop_consistency: selectedPoopConsistency || null,
          remark: requestData.remark
        }
        // 先添加到本地状态
        dispatch(addDiaperRecord(newRecord))
        // 调用API
        await dispatch(addDiaperItem({ babyId, data: requestData })).unwrap()
        showMessage('记录已保存')
      }

      // 通知主页面刷新
      DeviceEventEmitter.emit('refreshDashboard')
      navigation.goBack()
    } catch {
      showMessage('保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#fff1f2', '#ffe4e6']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <AppKeyboardAvoidingView
        behavior={undefined}
        style={styles.keyboardAvoidingView}
      >
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                '提示',
                '是否要保存换尿布记录？',
                [
                  {
                    text: '取消',
                    style: 'cancel',
                    onPress: () => navigation.goBack()
                  },
                  {
                    text: '保存',
                    onPress: handleSave
                  }
                ],
                { cancelable: false }
              )
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>换尿布</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 时间选择卡片 */}
          <LinearGradient
            colors={['#ffffff', '#fff1f2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>更换时间</Text>
            <TimePicker
              selectedTime={selectedTime}
              onTimeChange={setSelectedTime}
            />
          </LinearGradient>

          {/* 尿布状态选择卡片 */}
          <LinearGradient
            colors={['#ffffff', '#fff1f2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>尿布状态</Text>
            <DiaperTypeSelector
              selectedType={selectedType}
              onSelectType={setSelectedType}
            />
          </LinearGradient>

          {/* 嘘嘘颜色选择卡片 */}
          {(selectedType.id === DiaperType.PEE ||
            selectedType.id === DiaperType.BOTH) && (
            <LinearGradient
              colors={['#ffffff', '#fff1f2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <Text style={styles.sectionTitle}>嘘嘘颜色</Text>
              <PeeColorSelector
                selectedColor={selectedPeeColor}
                onSelectColor={setSelectedPeeColor}
              />
            </LinearGradient>
          )}

          {/* 便便颜色选择卡片 */}
          {(selectedType.id === DiaperType.POOP ||
            selectedType.id === DiaperType.BOTH) && (
            <>
              <LinearGradient
                colors={['#ffffff', '#fff1f2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.sectionTitle}>便便颜色</Text>
                <PoopColorSelector
                  selectedColor={selectedPoopColor}
                  onSelectColor={setSelectedPoopColor}
                />
              </LinearGradient>

              {/* 便便性状选择卡片 */}
              <LinearGradient
                colors={['#ffffff', '#fff1f2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <Text style={styles.sectionTitle}>便便性状</Text>
                <PoopConsistencySelector
                  selectedConsistency={selectedPoopConsistency}
                  onSelectConsistency={setSelectedPoopConsistency}
                />
              </LinearGradient>
            </>
          )}

          {/* 备注输入卡片 */}
          <LinearGradient
            colors={['#ffffff', '#fff1f2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>添加备注</Text>
            <RemarkInput value={remark} onChangeText={setRemark} />
          </LinearGradient>

          {/* 保存按钮 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? '保存中...' : '保存'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 占位空间 */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </AppKeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  keyboardAvoidingView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16
  },
  backButton: {
    padding: 8,
    width: 40
  },
  backButtonText: {
    color: '#f43f5e',
    fontSize: 24
  },
  headerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center'
  },
  deleteButton: {
    padding: 8,
    width: 40,
    alignItems: 'flex-end'
  },
  deleteButtonText: {
    color: '#f43f5e',
    fontSize: 12,
    textAlign: 'right'
  },
  headerRight: {
    width: 40
  },
  content: {
    flex: 1
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#f43f5e',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fff'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  footer: {
    padding: 16,
    backgroundColor: 'transparent'
  },
  saveButton: {
    backgroundColor: '#f43f5e',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default DiaperFormScreen
