import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigationHelper } from '../../../utils/navigation'

const SleepManualInputScreen = () => {
  const { goBack } = useNavigationHelper()

  return (
    <LinearGradient
      colors={['#fff1f2', '#ffe4e6']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>手动记录睡眠</Text>
        <View style={styles.headerRight} />
      </View>

      {/* 内容区域 */}
      <View style={styles.content}>
        <Text style={styles.placeholderText}>手动记录睡眠页面</Text>
        <Text style={styles.placeholderSubtext}>
          这里将实现手动输入睡眠开始和结束时间的功能
        </Text>
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
    padding: 8
  },
  backButtonText: {
    color: '#f43f5e',
    fontSize: 24
  },
  headerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600'
  },
  headerRight: {
    width: 40
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    color: '#f43f5e',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  placeholderSubtext: {
    color: '#f43f5e',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32
  }
})

export default SleepManualInputScreen
