import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform
} from 'react-native'
import DateTimePicker, {
  DateTimePickerAndroid
} from '@react-native-community/datetimepicker'

interface TimePickerProps {
  value: Date
  onChange: (date: Date) => void
  label: string
  type?: '奶粉' | '母乳' | '辅食'
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  type = '母乳'
}) => {
  // 根据类型获取颜色
  const getColor = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return '#f43f5e'
      case '母乳':
        return '#e11d48'
      case '辅食':
        return '#b91c1c'
      default:
        return '#e11d48'
    }
  }

  // 根据类型获取背景颜色
  const getBackgroundColor = (type: '奶粉' | '母乳' | '辅食') => {
    switch (type) {
      case '奶粉':
        return '#fff0f0'
      case '母乳':
        return '#fff5f5'
      case '辅食':
        return '#ffe6e6'
      default:
        return '#fff5f5'
    }
  }

  const color = getColor(type)
  const backgroundColor = getBackgroundColor(type)
  // 确保 value 是一个有效的 Date 对象
  const validDate =
    value instanceof Date && !isNaN(value.getTime()) ? value : new Date()

  const openAndroidPicker = () => {
    DateTimePickerAndroid.open({
      value: validDate,
      mode: 'date',
      display: 'default',
      onChange: (event, selectedDate) => {
        if (event?.type !== 'set' || !selectedDate) return
        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: 'time',
          display: 'default',
          onChange: (timeEvent, selectedTime) => {
            if (timeEvent?.type !== 'set' || !selectedTime) return
            const merged = new Date(selectedDate)
            merged.setHours(
              selectedTime.getHours(),
              selectedTime.getMinutes(),
              0,
              0
            )
            onChange(merged)
          }
        })
      }
    })
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.timeLabel, { color: color }]}>{label}</Text>
      {Platform.OS === 'android' ? (
        <>
          <TouchableOpacity
            style={[
              styles.timeButton,
              { borderColor: color, backgroundColor: backgroundColor }
            ]}
            onPress={openAndroidPicker}
            activeOpacity={0.8}
          >
            <Text style={[styles.timeButtonText, { color: color }]}>
              {validDate.toLocaleString()}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <DateTimePicker
          value={validDate}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
          textColor={color}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16
  },
  timeLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  timeButtonText: {
    fontSize: 14,
    color: '#111827'
  }
})

export default TimePicker
