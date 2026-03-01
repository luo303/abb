import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'

interface SleepClockDisplayProps {
  seconds: number
  formatTime: (seconds: number) => string
}

const SleepClockDisplay: React.FC<SleepClockDisplayProps> = ({
  seconds,
  formatTime
}) => {
  return (
    <View style={styles.timerContainer}>
      <View style={styles.timerCircle}>
        {/* 装饰元素 - 简单的设计感 */}
        <View style={styles.decorationDot} />

        {/* 时间显示 */}
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.timerLabel}>睡眠时长</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: 'rgba(244,63,94,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10
      },
      android: {
        elevation: 6
      }
    })
  },
  timerText: {
    color: '#333',
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'System'
  },
  timerLabel: {
    color: '#f43f5e',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600'
  },
  decorationDot: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f43f5e'
  }
})

export default SleepClockDisplay
