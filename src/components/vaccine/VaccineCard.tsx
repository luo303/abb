import React from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Vaccine } from '@/types/vaccine'

interface VaccineCardProps {
  data: Vaccine
  onToggleStatus?: (id: string, value: boolean) => void
  onDatePress?: (id: string, date?: number) => void
}

export default function VaccineCard({
  data,
  onToggleStatus,
  onDatePress
}: VaccineCardProps) {
  const isCompleted = data.status === 'completed'

  // 格式化日期
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '未知'
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <View
      style={[
        styles.card,
        isCompleted ? styles.cardCompleted : styles.cardPending
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{data.name}</Text>
            {data.dose ? (
              <View style={styles.doseBadge}>
                <Text style={styles.doseText}>{data.dose}</Text>
              </View>
            ) : null}
          </View>
          <Switch
            value={isCompleted}
            onValueChange={val => onToggleStatus?.(data.id, val)}
            trackColor={{ false: '#e2e8f0', true: '#86efac' }}
            thumbColor={isCompleted ? '#22c55e' : '#f1f5f9'}
            ios_backgroundColor="#e2e8f0"
          />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {data.description}
        </Text>

        <View style={styles.footerRow}>
          {isCompleted ? (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => onDatePress?.(data.id, data.vaccinationDate)}
            >
              <View style={[styles.statusBadge, styles.completedBadge]}>
                <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                <Text style={styles.completedText}>
                  接种时间: {formatDate(data.vaccinationDate)}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Ionicons name="calendar-outline" size={16} color="#1d4ed8" />
              <Text style={styles.pendingText}>
                推荐时间: {formatDate(data.recommendedDate)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  cardCompleted: {
    backgroundColor: '#f0fdf4', // 极淡的绿色背景
    borderColor: '#dcfce7'
  },
  cardPending: {
    backgroundColor: '#fff',
    borderColor: '#f1f5f9'
  },
  contentContainer: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8
  },
  doseBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  doseText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 14
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  completedBadge: {
    backgroundColor: '#dcfce7'
  },
  pendingBadge: {
    backgroundColor: '#dbeafe'
  },
  completedText: {
    fontSize: 13,
    color: '#15803d',
    marginLeft: 6,
    fontWeight: '600'
  },
  pendingText: {
    fontSize: 13,
    color: '#1d4ed8',
    marginLeft: 6,
    fontWeight: '600'
  }
})
