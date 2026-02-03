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
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('GrowthCurve')}
      >
        <LinearGradient
          colors={['#ffffff', '#fff1f2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleWrapper}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="trending-up-outline"
                  size={20}
                  color="#f43f5e"
                />
              </View>
              <Text style={styles.title}>成长曲线</Text>
            </View>
            <View style={styles.moreBtn}>
              <Text style={styles.moreText}>详情</Text>
              <Ionicons name="chevron-forward" size={14} color="#f43f5e" />
            </View>
          </View>

          <View style={styles.chartCard}>
            <LinearGradient
              colors={['#fff1f2', '#fff']}
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
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff'
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fff'
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
    backgroundColor: '#fff1f2'
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
    color: '#f43f5e',
    fontWeight: '600'
  },
  chartContainer: {
    flexDirection: 'row',
    gap: 12
  },
  chartCard: {
    flex: 1,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartContent: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  line: {
    width: '80%',
    height: 3,
    backgroundColor: '#f43f5e',
    borderRadius: 2
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
