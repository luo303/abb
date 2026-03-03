import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface SleepClockDisplayProps {
  seconds: number
  formatTime: (seconds: number) => string
}

const SleepClockDisplay: React.FC<SleepClockDisplayProps> = ({
  seconds,
  formatTime
}) => {
  // 计算边框动画值，根据秒数变化
  const borderOpacity = 0.4 + Math.sin(seconds * 0.1) * 0.2
  const borderWidth = 4 + Math.sin(seconds * 0.1) * 1

  return (
    <View style={styles.timerContainer}>
      <View
        style={[
          styles.timerCircle,
          {
            borderWidth: borderWidth,
            borderColor: `rgba(244,63,94,${borderOpacity})`
          }
        ]}
      >
        {/* 圆形渐变效果 - 中间白色，外面红色 */}
        <LinearGradient
          colors={[
            'white',
            'rgba(255,255,255,0.95)',
            'rgba(255,255,255,0.9)',
            'rgba(255,255,255,0.85)',
            'rgba(247, 227, 227, 0.8)',
            'rgba(251, 196, 196, 0.75)',
            'rgba(242, 180, 189, 0.1)',
            'rgba(248, 110, 133, 0.15)'
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradientBackground}
        >
          {/* 时间显示 */}
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          <Text style={styles.timerLabel}>睡眠时长</Text>
        </LinearGradient>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  timerCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12
      },
      android: {
        elevation: 8
      }
    })
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    alignItems: 'center',
    justifyContent: 'center'
  },
  timerText: {
    color: '#f43f5e',
    fontSize: 52,
    fontWeight: 'bold',
    fontFamily: 'System',
    textShadowColor: 'rgba(244,63,94,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  timerLabel: {
    color: '#f43f5e',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(244,63,94,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  decorationDot: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(244,63,94,0.6)',
    ...Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3
      },
      android: {
        elevation: 3
      }
    })
  }
})

export default SleepClockDisplay
