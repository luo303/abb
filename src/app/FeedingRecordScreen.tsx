import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  DeviceEventEmitter
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  FeedingTypeTabs,
  AmountInput,
  TimePicker,
  RemarkInput
} from '@/components/FeedingRecord'

interface FeedingRecord {
  type: '奶粉' | '母乳' | '辅食'
  amount: string
  time: string
  remark: string
}

const FeedingRecordScreen = () => {
  const navigation = useNavigation()
  const [selectedType, setSelectedType] = useState<'奶粉' | '母乳' | '辅食'>(
    '母乳'
  )
  const [amount, setAmount] = useState('')
  const [feedingTime, setFeedingTime] = useState(new Date())
  const [remark, setRemark] = useState('')

  // 根据喂养类型获取渐变色
  const getGradientColors = (
    type: '奶粉' | '母乳' | '辅食'
  ): [string, string] => {
    switch (type) {
      case '奶粉':
        return ['#fff9e6', '#fff3cd'] // 浅奶黄色
      case '母乳':
        return ['#fff5f5', '#fecdd3'] // 浅珊瑚粉
      case '辅食':
        return ['#f0fdf4', '#bbf7d0'] // 浅苹果绿
      default:
        return ['#ffffff', '#f8f9fa']
    }
  }

  // 根据喂养类型获取按钮颜色
  const getButtonColor = (type: '奶粉' | '母乳' | '辅食'): string => {
    switch (type) {
      case '奶粉':
        return '#b45309' // 深奶黄色
      case '母乳':
        return '#e11d48' // 深珊瑚粉
      case '辅食':
        return '#166534' // 深苹果绿
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
          color: '#b45309',
          backgroundColor: '#fff9e6',
          borderColor: '#fde68a',
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
          color: '#166534',
          backgroundColor: '#f0fdf4',
          borderColor: '#bbf7d0',
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

  const handleSave = () => {
    const record: FeedingRecord = {
      type: selectedType,
      amount,
      time: formatDate(feedingTime),
      remark
    }

    // 这里可以添加保存逻辑，比如调用API
    console.log('保存喂养记录:', record)

    // 通知主页面刷新
    DeviceEventEmitter.emit('refreshDashboard')

    // 导航回上一页
    navigation.goBack()
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
            onPress={() => navigation.goBack()}
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
            onTypeChange={setSelectedType}
          />

          {/* 表单卡片 */}
          <View style={styles.formCard}>
            <View style={styles.formItem}>
              <AmountInput
                value={amount}
                onChange={setAmount}
                type={selectedType}
                placeholder="请输入数值"
              />
            </View>

            <View style={styles.formItem}>
              <TimePicker
                value={feedingTime}
                onChange={setFeedingTime}
                label="时间"
              />
            </View>

            <View style={styles.formItem}>
              <RemarkInput
                value={remark}
                onChange={setRemark}
                label="喂养状态"
                placeholder="宝宝今天胃口怎么样？可以记录在这里哦..."
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 232, 232, 0.8)'
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 232, 232, 0.8)'
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
