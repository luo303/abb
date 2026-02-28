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
import { List } from '@ant-design/react-native'
import { useNavigation } from '@react-navigation/native'
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>喂养记录</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <FeedingTypeTabs
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

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
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Text style={styles.tipTitle}>温馨提示</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipText}>
              • 奶粉喂养建议按照奶粉说明书的比例进行调配
            </Text>
            <Text style={styles.tipText}>
              • 母乳喂养时间一般建议在15-20分钟左右
            </Text>
            <Text style={styles.tipText}>
              • 辅食添加应遵循由少到多、由稀到稠的原则
            </Text>
            <Text style={styles.tipText}>
              • 记录喂养情况有助于了解宝宝的饮食规律
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8'
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8'
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
