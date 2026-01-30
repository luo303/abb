import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Card from '../common/Card'

export default function BabyStats() {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconBg}>
            <Ionicons name="body-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.title}>宝宝档案</Text>
        </View>
        <Text style={styles.subtitle}>已出生 100 天</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* 身高卡片 */}
        <LinearGradient
          colors={['#e0f2fe', '#bae6fd']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statBox}
        >
          <View style={styles.statIcon}>
            <Ionicons name="resize-outline" size={24} color="#0284c7" />
          </View>
          <View>
            <Text style={styles.statLabel}>身高</Text>
            <View style={styles.valueContainer}>
              <Text style={styles.statValue}>65.5</Text>
              <Text style={styles.statUnit}>cm</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 体重卡片 */}
        <LinearGradient
          colors={['#fce7f3', '#fbcfe8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statBox}
        >
          <View style={styles.statIcon}>
            <Ionicons name="scale-outline" size={24} color="#db2777" />
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
    borderRadius: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#4A8B95',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  subtitle: {
    fontSize: 14,
    color: '#4A8B95',
    fontWeight: '600',
    backgroundColor: '#e6fffa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden'
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
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginRight: 4
  },
  statUnit: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  }
})
