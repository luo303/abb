import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import BabyProgressRing from '../common/BabyProgressRing'
import { RecordType } from '../../types/recordTypes'

interface DashboardRingProps {
  type: RecordType
  value: string
  percent: number
  onPress: () => void
}

export default function DashboardRing({
  type,
  value,
  percent,
  onPress
}: DashboardRingProps) {
  const getIcon = () => {
    switch (type) {
      case 'feeding':
        return 'baby-bottle'
      case 'sleep':
        return 'weather-night'
      case 'diaper':
        return 'baby-carriage'
      default:
        return 'help-circle'
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'feeding':
        return '喂养'
      case 'sleep':
        return '睡眠'
      case 'diaper':
        return '换尿布'
      default:
        return '未知'
    }
  }

  return (
    <TouchableOpacity
      style={styles.dashboardRing}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.ringContainer}>
        <BabyProgressRing
          percent={percent}
          color="#f43f5e"
          size={100}
          strokeWidth={8}
          unfilledColor="#f0f0f0"
          backgroundColor="#fff1f2"
          centerText={
            <View style={styles.progressContent}>
              <MaterialCommunityIcons
                name={getIcon() as any}
                size={24}
                color="#f43f5e"
              />
              <Text style={styles.ringValue}>{value}</Text>
            </View>
          }
        />
        <Text style={styles.ringLabel}>{getLabel()}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  dashboardRing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    paddingVertical: 12
  },
  ringContainer: {
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#f43f5e'
  },
  ringLabel: {
    fontSize: 14,
    color: '#f43f5e',
    fontWeight: '600',
    marginTop: 4
  }
})
