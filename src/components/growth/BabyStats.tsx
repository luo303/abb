import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Card } from '../common/Card'

export default function BabyStats() {
  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={['#ffffff', '#fff1f2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={styles.iconBg}>
              <Ionicons name="body-outline" size={20} color="#f43f5e" />
            </View>
            <View>
              <Text style={styles.title}>宝宝档案</Text>
              <Text style={styles.subtitle}>出生 100 天</Text>
            </View>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
        </View>

        <View style={styles.statsContainer}>
          {/* 身高卡片 - 使用暖色渐变，与主题保持一致 */}
          <LinearGradient
            colors={['#fff1f2', '#ffe4e6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statBox}
          >
            <View style={styles.statIcon}>
              <Ionicons name="resize-outline" size={24} color="#f43f5e" />
            </View>
            <View>
              <Text style={styles.statLabel}>身高</Text>
              <View style={styles.valueContainer}>
                <Text style={styles.statValue}>65.5</Text>
                <Text style={styles.statUnit}>cm</Text>
              </View>
            </View>
          </LinearGradient>

          {/* 体重卡片 - 使用暖色渐变，与主题保持一致 */}
          <LinearGradient
            colors={['#fff7ed', '#ffedd5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statBox}
          >
            <View style={styles.statIcon}>
              <Ionicons name="scale-outline" size={24} color="#f97316" />
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
      </LinearGradient>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#fff1f2',
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
    color: '#f43f5e',
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
