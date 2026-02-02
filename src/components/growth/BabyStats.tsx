import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function BabyStats() {
  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>宝宝档案</Text>
          <View style={styles.ageBadge}>
            <Text style={styles.ageText}>出生 100 天</Text>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
      </View>

      <View style={styles.statsRow}>
        {/* 身高卡片 */}
        <View style={[styles.statCard, styles.heightCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="resize-outline" size={18} color="#0ea5e9" />
            </View>
            <Text style={styles.cardLabel}>身高</Text>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>65.5</Text>
            <Text style={styles.unitText}>cm</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name="arrow-up" size={10} color="#0ea5e9" />
            <Text style={[styles.trendText, { color: '#0ea5e9' }]}>+1.2</Text>
          </View>
        </View>

        {/* 体重卡片 */}
        <View style={[styles.statCard, styles.weightCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="scale-outline" size={18} color="#db2777" />
            </View>
            <Text style={styles.cardLabel}>体重</Text>
          </View>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>7.2</Text>
            <Text style={styles.unitText}>kg</Text>
          </View>
          <View style={[styles.trendBadge, { backgroundColor: '#fff1f2' }]}>
            <Ionicons name="arrow-up" size={10} color="#db2777" />
            <Text style={[styles.trendText, { color: '#db2777' }]}>+0.4</Text>
          </View>
        </View>
      </View>
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
  ageBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  ageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706'
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#fff',
    // 软阴影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  heightCard: {
    // 可以在这里添加特定的背景色或样式
  },
  weightCard: {
    // 可以在这里添加特定的背景色或样式
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563'
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8
  },
  valueText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
    marginRight: 4
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af'
  },
  trendBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700'
  }
})
