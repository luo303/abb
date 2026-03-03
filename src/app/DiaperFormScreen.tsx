import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import {
  DiaperType,
  PeeColor,
  PoopColor,
  PoopConsistency,
  DiaperRecordRequest
} from '../types/diaper'
import {
  addDiaperRecordReq,
  updateDiaperRecordReq,
  deleteDiaperRecordReq
} from '../api/diaper'
import { fetchDiaperList } from '../store/modules/diaperStore'
import { TimePicker } from '../components/DailyRecord/DiaperRecord/TimePicker'
import { DiaperTypeSelector } from '../components/DailyRecord/DiaperRecord/DiaperTypeSelector'
import { PeeColorSelector } from '../components/DailyRecord/DiaperRecord/PeeColorSelector'
import { PoopColorSelector } from '../components/DailyRecord/DiaperRecord/PoopColorSelector'
import { PoopConsistencySelector } from '../components/DailyRecord/DiaperRecord/PoopConsistencySelector'
import { RemarkInput } from '../components/DailyRecord/DiaperRecord/RemarkInput'

interface RouteParams {
  diaper_id?: string
}

const DiaperFormScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>()
  const dispatch = useDispatch<AppDispatch>()

  const babyId = useSelector((state: RootState) => state.baby.currentBabyId)
  const diaperList = useSelector((state: RootState) => state.diaper.diaperList)

  const diaperId = route.params?.diaper_id
  const isEditMode = !!diaperId

  const [selectedType, setSelectedType] = useState<DiaperType>(DiaperType.PEE)
  const [selectedPeeColor, setSelectedPeeColor] = useState<
    PeeColor | undefined
  >(PeeColor.NORMAL)
  const [selectedPoopColor, setSelectedPoopColor] = useState<
    PoopColor | undefined
  >(PoopColor.YELLOW)
  const [selectedPoopConsistency, setSelectedPoopConsistency] = useState<
    PoopConsistency | undefined
  >(PoopConsistency.NORMAL)
  const [selectedTime, setSelectedTime] = useState(new Date())
  const [remark, setRemark] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 初始化数据
  useEffect(() => {
    if (isEditMode && babyId) {
      const diaperItem = diaperList.find(item => item.diaper_id === diaperId)
      if (diaperItem) {
        setSelectedType(diaperItem.diaper_type)
        setSelectedPeeColor(diaperItem.pee_color)
        setSelectedPoopColor(diaperItem.poop_color)
        setSelectedPoopConsistency(diaperItem.poop_consistency)
        setSelectedTime(new Date(diaperItem.change_time))
        setRemark(diaperItem.remark || '')
      }
    }
  }, [isEditMode, diaperId, diaperList, babyId])

  // 处理保存
  const handleSave = async () => {
    if (!babyId) {
      Alert.alert('提示', '请先选择宝宝')
      return
    }

    setIsLoading(true)
    try {
      const requestData: DiaperRecordRequest = {
        diaper_type: selectedType,
        change_time: selectedTime.getTime(),
        remark
      }

      // 根据类型添加相应的字段
      if (selectedType === DiaperType.PEE || selectedType === DiaperType.BOTH) {
        requestData.pee_color = selectedPeeColor
      }
      if (
        selectedType === DiaperType.POOP ||
        selectedType === DiaperType.BOTH
      ) {
        requestData.poop_color = selectedPoopColor
        requestData.poop_consistency = selectedPoopConsistency
      }

      if (isEditMode && diaperId) {
        // 编辑模式
        await updateDiaperRecordReq(babyId, diaperId, requestData)
        Alert.alert('成功', '记录已更新')
      } else {
        // 新增模式
        await addDiaperRecordReq(babyId, requestData)
        Alert.alert('成功', '记录已保存')
      }

      // 刷新数据
      dispatch(fetchDiaperList(babyId))
      navigation.goBack()
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理删除
  const handleDelete = () => {
    if (!babyId || !diaperId) return

    Alert.alert('确认删除', '确定要删除这条记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true)
          try {
            await deleteDiaperRecordReq(babyId, diaperId)
            Alert.alert('成功', '记录已删除')
            dispatch(fetchDiaperList(babyId))
            navigation.goBack()
          } catch (error) {
            Alert.alert('错误', '删除失败，请重试')
          } finally {
            setIsLoading(false)
          }
        }
      }
    ])
  }

  return (
    <LinearGradient
      colors={['#fff1f2', '#ffe4e6']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>换尿布</Text>
        {isEditMode ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>删除记录</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
        {(selectedType === DiaperType.PEE ||
          selectedType === DiaperType.BOTH) && (
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
        {(selectedType === DiaperType.POOP ||
          selectedType === DiaperType.BOTH) && (
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

        {/* 占位空间 */}
        <View style={{ height: 100 }} />
      </ScrollView>

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
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
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
    width: 80,
    alignItems: 'flex-end'
  },
  deleteButtonText: {
    color: '#f43f5e',
    fontSize: 14
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
