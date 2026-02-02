import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Card } from '../common/Card'

export default function BabyStats() {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBg}>
            <Ionicons name="body-outline" size={20} color="#00acc1" />
          </View>
          <View>
            <Text style={styles.title}>宝宝档案</Text>
            <Text style={styles.subtitle}>出生 100 天</Text>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
      </View>

      <View style={styles.statsContainer}>
        {/* 身高卡片 - 使用青色渐变，与主题保持一致 */}
        <LinearGradient
          colors={['#e0f2fe', '#bae6fd']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statBox}
        >
          <View style={styles.statIcon}>
            <Ionicons name="resize-outline" size={24} color="#1f99b0" />
          </View>
          <View>
            <Text style={styles.statLabel}>身高</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.statValue}>65.5</Text>
              <Text style={styles.statUnit}>cm</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 体重卡片 - 使用青色渐变，与主题保持一致 */}
        <LinearGradient
          colors={['#e0f7fa', '#b2ebf2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statBox}
        >
          <View style={styles.statIcon}>
            <Ionicons name="scale-outline" size={24} color="#00acc1" />
          </View>
          <View>
            <Text style={styles.statLabel}>体重</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.statValue}>7.2</Text>
              <Text style={styles.statUnit}>kg</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  subtitle: {
    fontSize: 12,
    color: '#00acc1',
    fontWeight: '600',
    marginTop: 2
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15
  },
  statBox: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    marginBottom: 2
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  statUnit: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginLeft: 2
  }
})
