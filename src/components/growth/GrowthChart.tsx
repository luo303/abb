import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { NavigationProps } from '../../types/navigation'
import { Card } from '../common/Card'

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
          <View style={styles.moreBtn}>
            <Text style={styles.moreText}>详情</Text>
            <Ionicons name="chevron-forward" size={14} color="#0ea5e9" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('GrowthCurve')}
      >
        <View style={styles.chartCard}>
          <LinearGradient
            colors={['#fff', '#f8fafc']}
            style={styles.chartContent}
          >
            {/* 模拟图表区域 */}
            <View style={styles.chartPlaceholder}>
              <Image
                source={require('../../assets/ChartMock.png')}
                style={styles.chartImage}
                resizeMode="contain"
              />
            </View>

            {/* 底部数据栏 */}
            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <View style={styles.dot} />
                <Text style={styles.dataLabel}>最新身高</Text>
                <Text style={styles.dataValue}>65.5 cm</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.dataItem}>
                <View style={[styles.dot, { backgroundColor: '#db2777' }]} />
                <Text style={styles.dataLabel}>最新体重</Text>
                <Text style={styles.dataValue}>7.2 kg</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3
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
    gap: 8
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f2fe'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  moreText: {
    fontSize: 13,
    color: '#0ea5e9',
    fontWeight: '600'
  },
  chartCard: {
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden'
  },
  chartContent: {
    padding: 16
  },
  chartPlaceholder: {
    height: 160,
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartImage: {
    width: '100%',
    height: '100%'
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  dataItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0ea5e9'
  },
  dataLabel: {
    fontSize: 12,
    color: '#64748b'
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 'auto'
  }
})
