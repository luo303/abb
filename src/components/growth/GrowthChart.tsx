import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { NavigationProps } from '../../types/navigation'

export default function GrowthChart() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>成长曲线</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('GrowthCurve')}>
          <View style={styles.moreBtn}>
            <Text style={styles.moreText}>详情</Text>
            <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
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
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  moreText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500'
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
