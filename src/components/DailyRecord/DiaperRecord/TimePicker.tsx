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
        <Text style={styles.timeText}>{formatTime(selectedTime)}</Text>
        <Animated.Text style={[styles.arrowIcon, arrowStyle]}>›</Animated.Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  arrowIcon: {
    fontSize: 20,
    color: '#999'
  }
})
