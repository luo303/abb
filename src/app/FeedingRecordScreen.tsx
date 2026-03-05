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
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import {
  addFeedingItem,
  updateFeedingItem,
  saveFeedingRecord,
  updateFeedingRecord
} from '../store/modules/feedingStore'
import type { AppDispatch } from '../store'
import { FeedingType } from '../types/feeding'
import {
  FeedingTypeTabs,
  AmountInput,
  TimePicker,
  RemarkInput
} from '../components/DailyRecord/FeedingRecord'
import { useMessage } from '../components/Message'
import dayjs from 'dayjs'
import { generateTempId } from '../utils/idGenerator'

interface FeedingRecord {
  type: '奶粉' | '母乳' | '辅食'
  amount: string
  time: string
  remark: string
}

interface RouteParams {
  feeding_id?: string
}

const FeedingRecordScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>()
  const feedId = route.params?.feeding_id
  const dispatch = useDispatch<AppDispatch>()
  const routeParams = route.params as { baby_id?: string } | undefined
  const reduxBabyId = useSelector(
    (state: RootState) => state.baby.currentBabyId
  )
  const babyState = useSelector((state: RootState) => state.baby)
  const babyId = routeParams?.baby_id || reduxBabyId

  const feedingList = useSelector(
    (state: RootState) => state.feeding.feedingList
  )
  // 获取当前选中的日期
  const currentDate = useSelector((state: RootState) => state.daily.currentDate)

  const [selectedType, setSelectedType] = useState<'奶粉' | '母乳' | '辅食'>(
    '母乳'
  )
  const [amount, setAmount] = useState('')
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
  const [remark, setRemark] = useState('')
  const [isFormModified, setIsFormModified] = useState(false)
  const { showMessage } = useMessage()

  // 当feedId存在时，从feedingList中找到对应的记录并回显数据
  useEffect(() => {
    console.log('收到的路由参数:', route.params)
    if (feedId) {
      const feedingRecord = feedingList.find(item => item.feeding_id === feedId)
      if (feedingRecord) {
        // 将feed_type转换为UI中的类型
        let uiType: '奶粉' | '母乳' | '辅食' = '母乳'
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
        setSelectedType(uiType)
        setAmount(feedingRecord.amount?.toString() || '')
        setFeedingTime(new Date(feedingRecord.feed_time))
        setRemark(feedingRecord.remark || '')
      }
    }
  }, [feedId, feedingList])

  // 根据喂养类型获取渐变色
  const getGradientColors = (
    type: '奶粉' | '母乳' | '辅食'
  ): [string, string] => {
    switch (type) {
      case '奶粉':
        return ['#fff0f0', '#ffb3b3'] // 浅红色（奶粉）
      case '母乳':
        return ['#fff5f5', '#fecdd3'] // 浅珊瑚粉
      case '辅食':
        return ['#ffe6e6', '#ff9999'] // 浅红色（辅食）
      default:
        return ['#ffffff', '#f8f9fa']
    }
  }

  // 根据喂养类型获取按钮颜色
  const getButtonColor = (type: '奶粉' | '母乳' | '辅食'): string => {
    switch (type) {
      case '奶粉':
        return '#f43f5e' // 亮红色（奶粉）
      case '母乳':
        return '#e11d48' // 深珊瑚粉
      case '辅食':
        return '#b91c1c' // 深红色（辅食）
      default:
        return '#333333'
    }
  }

  // 根据喂养类型获取提示信息和颜色
  const getTipInfo = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return {
          title: '奶粉喂养提示',
          color: '#f43f5e',
          backgroundColor: '#fff0f0',
          borderColor: '#ffb3b3',
          tips: [
            '• 奶粉喂养建议按照奶粉说明书的比例进行调配',
            '• 水温建议在40-50℃之间，避免破坏营养成分',
            '• 奶瓶使用后要及时清洗消毒',
            '• 注意观察宝宝的消化情况，如出现不适要及时调整'
          ]
        }
      case '母乳':
        return {
          title: '母乳喂养提示',
          color: '#e11d48',
          backgroundColor: '#fff5f5',
          borderColor: '#fecdd3',
          tips: [
            '• 母乳喂养时间一般建议在15-20分钟左右',
            '• 喂奶前要清洁乳头，保持卫生',
            '• 两侧乳房交替喂养，保证乳汁分泌',
            '• 注意观察宝宝的吸吮情况和吞咽声音'
          ]
        }
      case '辅食':
        return {
          title: '辅食添加提示',
          color: '#b91c1c',
          backgroundColor: '#ffe6e6',
          borderColor: '#ff9999',
          tips: [
            '• 辅食添加应遵循由少到多、由稀到稠的原则',
            '• 首次添加建议从米粉开始，逐渐引入其他食物',
            '• 每次只添加一种新食物，观察3-5天无不良反应后再添加其他',
            '• 注意食物的卫生和新鲜度，避免给宝宝食用过期食物'
          ]
        }
      default:
        return {
          title: '温馨提示',
          color: '#666666',
          backgroundColor: '#f8f9fa',
          borderColor: '#e2e8f0',
          tips: [
            '• 记录喂养情况有助于了解宝宝的饮食规律',
            '• 注意观察宝宝的食欲和消化情况',
            '• 保持喂养环境的安静和舒适',
            '• 定期咨询医生关于宝宝的喂养建议'
          ]
        }
    }
  }

  const formatDate = (date: Date) => {
    if (!date || !(date instanceof Date)) {
      return ''
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  const handleSave = async () => {
    // 将UI中的喂养类型转换为FeedingType枚举
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

    const record = {
      feed_type: feedType,
      start_time: feedingTime.getTime(),
      amount: amount ? Number(amount) : undefined,
      duration: undefined, // 暂时设置为undefined，根据实际需求调整
      remark,
      summary_text: remark
    }

    // 调用Redux action保存数据
    if (babyId) {
      if (feedId) {
        // 如果有feedId，说明是编辑模式，调用updateFeedingRecord
        try {
          await dispatch(
            updateFeedingRecord({ babyId, feedingId: feedId, data: record })
          ).unwrap()
          // 更新成功后，使用 showMessage 提示用户
          showMessage('更新成功')
          // 通知主页面刷新
          DeviceEventEmitter.emit('refreshDashboard')
          // 导航回上一页
          navigation.goBack()
        } catch (error) {
          console.error('更新喂养记录失败:', error)
          // 添加错误提示
          showMessage('更新失败，请重试')
        }
      } else {
        // 发送请求：调用saveFeedingRecord接口
        try {
          if (!babyId) {
            showMessage('获取宝宝信息失败，请重试')
            return
          }
          await dispatch(saveFeedingRecord({ babyId, data: record })).unwrap()
          // 保存成功后，使用 showMessage 提示用户
          showMessage('保存成功')
          // 通知主页面刷新
          DeviceEventEmitter.emit('refreshDashboard')
          // 导航回“日常记录”列表页
          navigation.goBack()
        } catch (error) {
          showMessage('保存失败，请重试')
        }
      }
    }
  }

  return (
    <LinearGradient
      colors={getGradientColors(selectedType)}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                '提示',
                '是否要保存喂养记录？',
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
            <Text
              style={[
                styles.backButtonText,
                { color: getButtonColor(selectedType) }
              ]}
            >
              返回
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: getButtonColor(selectedType) }]}>
            喂养记录
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <FeedingTypeTabs
            selectedType={selectedType}
            onTypeChange={value => {
              setSelectedType(value)
              setIsFormModified(true)
            }}
          />

          {/* 表单卡片 */}
          <View style={styles.formCard}>
            <View style={styles.formItem}>
              <AmountInput
                value={amount}
                onChange={value => {
                  setAmount(value)
                  setIsFormModified(true)
                }}
                type={selectedType}
                placeholder="请输入数值"
              />
            </View>

            <View style={styles.formItem}>
              <TimePicker
                value={feedingTime}
                onChange={value => {
                  setFeedingTime(value)
                  setIsFormModified(true)
                }}
                label="时间"
                type={selectedType}
              />
            </View>

            <View style={styles.formItem}>
              <RemarkInput
                value={remark}
                onChange={value => {
                  setRemark(value)
                  setIsFormModified(true)
                }}
                label="喂养状态"
                placeholder="宝宝今天胃口怎么样？可以记录在这里哦..."
                type={selectedType}
              />
            </View>
          </View>

          {/* 温馨提示卡片 */}
          {(() => {
            const tipInfo = getTipInfo(selectedType)
            return (
              <View
                style={[
                  styles.tipCard,
                  { backgroundColor: tipInfo.backgroundColor }
                ]}
              >
                <View
                  style={[
                    styles.tipHeader,
                    { borderBottomColor: tipInfo.borderColor }
                  ]}
                >
                  <Text style={[styles.tipTitle, { color: tipInfo.color }]}>
                    {tipInfo.title}
                  </Text>
                </View>
                <View style={styles.tipContent}>
                  {tipInfo.tips.map((tip, index) => (
                    <Text
                      key={index}
                      style={[styles.tipText, { color: tipInfo.color }]}
                    >
                      {tip}
                    </Text>
                  ))}
                </View>
              </View>
            )
          })()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: getButtonColor(selectedType) }
            ]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  safeArea: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 0
  },
  backButton: {
    padding: 8
  },
  backButtonText: {
    fontSize: 16,
    color: '#333'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1,
    padding: 16
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16
  },
  formItem: {
    marginBottom: 20
  },
  tipCard: {
    backgroundColor: '#fff3f4',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  tipHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fecdd3',
    paddingBottom: 8
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f43f5e'
  },
  tipContent: {
    marginTop: 8
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8
  },
  footer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0
  },
  saveButton: {
    backgroundColor: '#f43f5e',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold'
  }
})

export default FeedingRecordScreen
