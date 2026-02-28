import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

interface TimePickerProps {
  value: Date
  onChange: (date: Date) => void
  label: string
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label }) => {
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate)
    }
  }

  // 确保 value 是一个有效的 Date 对象
  const validDate =
    value instanceof Date && !isNaN(value.getTime()) ? value : new Date()

  return (
    <View style={styles.container}>
      <Text style={styles.timeLabel}>{label}</Text>
      <DateTimePicker
        value={validDate}
        mode="datetime"
        display="default"
        onChange={handleDateChange}
      />
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
  }
})

export default TimePicker
