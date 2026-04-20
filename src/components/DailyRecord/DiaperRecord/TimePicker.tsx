import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { AngleRightSmall, Clock } from '@zappicon/react-native'
import { APP_COLORS } from '@/theme/paperTheme'

interface TimePickerProps {
  selectedTime: Date
  onTimeChange: (time: Date) => void
}

export const TimePicker: React.FC<TimePickerProps> = ({
  selectedTime,
  onTimeChange
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const arrowRotation = useState(new Animated.Value(0))[0]

  const togglePicker = () => {
    const newState = !showPicker
    setShowPicker(newState)

    // 动画旋转箭头
    Animated.timing(arrowRotation, {
      toValue: newState ? 90 : 0,
      duration: 200,
      useNativeDriver: true
    }).start()
  }

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false)
    // 重置箭头旋转
    Animated.timing(arrowRotation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start()

    if (selectedDate) {
      onTimeChange(selectedDate)
    }
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const arrowStyle = {
    transform: [
      {
        rotate: arrowRotation.interpolate({
          inputRange: [0, 90],
          outputRange: ['0deg', '90deg']
        })
      }
    ]
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.timeButton} onPress={togglePicker}>
        <View style={styles.timeLeft}>
          <Clock size={18} color={APP_COLORS.iconMuted} variant="regular" />
          <Text style={styles.timeText}>{formatTime(selectedTime)}</Text>
        </View>
        <Animated.View style={arrowStyle}>
          <AngleRightSmall
            size={20}
            color={APP_COLORS.iconMuted}
            variant="regular"
          />
        </Animated.View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  timeText: {
    fontSize: 16,
    color: APP_COLORS.text,
    fontWeight: '500'
  }
})
