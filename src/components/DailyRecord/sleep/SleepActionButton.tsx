import React from 'react'
import { StyleSheet, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'

interface SleepActionButtonProps {
  isTimerRunning: boolean
  onStart: () => void
  onStop: () => void
}

const SleepActionButton: React.FC<SleepActionButtonProps> = ({
  isTimerRunning,
  onStart,
  onStop
}) => {
  const handlePress = () => {
    if (isTimerRunning) {
      onStop()
    } else {
      onStart()
    }
  }

  return (
    <Button
      mode={isTimerRunning ? 'contained' : 'outlined'}
      style={[
        styles.actionButton,
        isTimerRunning ? styles.stopButton : styles.startButton
      ]}
      contentStyle={styles.actionButtonContent}
      labelStyle={[
        styles.actionButtonText,
        isTimerRunning ? styles.stopButtonText : styles.startButtonText
      ]}
      onPress={handlePress}
      icon={({ size, color }) => (
        <Ionicons
          name={isTimerRunning ? 'stopwatch' : 'time'}
          size={size}
          color={color}
        />
      )}
      buttonColor={isTimerRunning ? 'rgba(255,255,255,0.3)' : '#ffffff'}
      textColor={isTimerRunning ? '#ffffff' : '#f43f5e'}
      uppercase={false}
    >
      {isTimerRunning ? '结束睡眠' : '开始计时'}
    </Button>
  )
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 36,
    marginHorizontal: 48,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    })
  },
  actionButtonContent: {
    minHeight: 60,
    paddingHorizontal: 24
  },
  startButton: {
    backgroundColor: 'white'
  },
  stopButton: {
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  actionButtonText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System'
  },
  startButtonText: {
    color: '#f43f5e'
  },
  stopButtonText: {
    color: 'white'
  }
})

export default SleepActionButton
