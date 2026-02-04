import React, { useState } from 'react'
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

// 导入拆分后的组件
import CurveTabs from '../../components/growth/curve/CurveTabs'
import CurveRecordForm from '../../components/growth/curve/CurveRecordForm'

export default function GrowthCurveScreen() {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState('record') // record, height, weight, head

  // 表单状态
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [headCircumference, setHeadCircumference] = useState('')

  const tabs = [
    { key: 'record', label: '记录' },
    { key: 'height', label: '身高曲线' },
    { key: 'weight', label: '体重曲线' },
    { key: 'head', label: '头围曲线' }
  ]

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CurveTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'record' ? (
            <CurveRecordForm
              height={height}
              setHeight={setHeight}
              weight={weight}
              setWeight={setWeight}
              headCircumference={headCircumference}
              setHeadCircumference={setHeadCircumference}
              date="2026-02-04"
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {tabs.find(t => t.key === activeTab)?.label} 功能开发中...
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 底部按钮 */}
      {activeTab === 'record' && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>保存记录</Text>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5' // 米黄色背景
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFDF5', // 与背景同色
    paddingHorizontal: 20,
    paddingTop: 10
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9F43',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9F43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
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
