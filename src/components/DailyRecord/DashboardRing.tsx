import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ArrowsRotate, Clock, Flask } from '@zappicon/react-native'
import BabyProgressRing from '../common/BabyProgressRing'
import { RecordType } from '../../types/recordTypes'
import { APP_COLORS } from '@/theme/paperTheme'

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
  const toneColor = (() => {
    switch (type) {
      case 'feeding':
        return APP_COLORS.primary
      case 'sleep':
        return APP_COLORS.secondaryStrong
      case 'diaper':
        return APP_COLORS.primaryStrong
      default:
        return APP_COLORS.primary
    }
  })()

  const renderIcon = () => {
    const size = 22
    const color = toneColor
    const variant = 'filled' as const

    switch (type) {
      case 'feeding':
        return <Flask size={size} color={color} variant={variant} />
      case 'sleep':
        return <Clock size={size} color={color} variant={variant} />
      case 'diaper':
        return <ArrowsRotate size={size} color={color} variant={variant} />
      default:
        return <Flask size={size} color={color} variant={variant} />
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
          color={toneColor}
          progressGradient={[APP_COLORS.secondary, APP_COLORS.primaryStrong]}
          size={100}
          strokeWidth={8}
          unfilledColor={APP_COLORS.outlineVariant}
          backgroundColor={APP_COLORS.surface}
          centerText={
            <View style={styles.progressContent}>
              {renderIcon()}
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
    gap: 12
  },
  progressContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: APP_COLORS.text
  },
  ringLabel: {
    fontSize: 14,
    color: APP_COLORS.textMuted,
    fontWeight: '600',
    marginTop: 4
  }
})
