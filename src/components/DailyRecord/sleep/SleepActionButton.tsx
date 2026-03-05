import React from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

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
    <TouchableOpacity
      style={[
        styles.actionButton,
        isTimerRunning ? styles.stopButton : styles.startButton
      ]}
      onPress={handlePress}
    >
      <View style={styles.buttonContent}>
        <Ionicons
          name={isTimerRunning ? 'stopwatch' : 'time'}
          size={24}
          color={isTimerRunning ? 'white' : '#f43f5e'}
          style={styles.buttonIcon}
        />
        <Text
          style={[
            styles.actionButtonText,
            isTimerRunning ? styles.stopButtonText : styles.startButtonText
          ]}
        >
          {isTimerRunning ? '结束睡眠' : '开始计时'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  actionButton: {
    paddingHorizontal: 64,
    paddingVertical: 18,
    borderRadius: 36,
    alignItems: 'center',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonIcon: {
    marginRight: 8
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
