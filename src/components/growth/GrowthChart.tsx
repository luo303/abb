import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Card from '../common/Card'
import { NavigationProps } from '../../types/navigation'

export default function GrowthChart() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('GrowthCurve')}
    >
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="trending-up-outline" size={20} color="#1f99b0" />
          </View>
          <Text style={styles.title}>成长曲线</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('GrowthCurve')}>
          <Text style={styles.moreText}>记录 &gt;</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {/* 图表区域 */}
        <LinearGradient
          colors={['#fff', '#f0f9ff']}
          style={styles.chartContainer}
        >
          <Image
            source={require('../../assets/ChartMock.png')}
            style={styles.chartImage}
            resizeMode="contain"
          />
        </LinearGradient>

        {/* 数据摘要浮层 */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <View style={styles.dot} />
            <Text style={styles.summaryLabel}>上次测量</Text>
            <Text style={styles.summaryDate}>10月24日</Text>
          </View>
          <View style={styles.growthBadge}>
            <Ionicons name="arrow-up" size={12} color="#fff" />
            <Text style={styles.growthText}>较上月长高 1.2cm</Text>
          </View>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  moreText: {
    fontSize: 13,
    color: '#0ea5e9',
    fontWeight: '600'
  },
  contentContainer: {
    gap: 12
  },
  chartContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    overflow: 'hidden',
    padding: 10
  },
  chartImage: {
    width: '100%',
    height: '100%'
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4299e1'
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748b'
  },
  summaryDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2
  },
  growthText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600'
  }
})
