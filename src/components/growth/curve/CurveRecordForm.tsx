import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { openDatePicker } from '@/utils/datePicker'

interface CurveRecordFormProps {
  height: string
  setHeight: (text: string) => void
  weight: string
  setWeight: (text: string) => void
  headCircumference: string
  setHeadCircumference: (text: string) => void
  date: number
  onDateChange: (date: number) => void
  minDate?: number
}

export default function CurveRecordForm({
  height,
  setHeight,
  weight,
  setWeight,
  headCircumference,
  setHeadCircumference,
  date,
  onDateChange,
  minDate
}: CurveRecordFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  // 转换时间戳为 Date 对象
  const dateObj = new Date(date)
  const minDateObj = typeof minDate === 'number' ? new Date(minDate) : undefined

  // 格式化日期 YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formattedDate = formatDate(dateObj)

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'set' && selectedDate) {
      const selectedTime = selectedDate.getTime()
      if (typeof minDate === 'number' && selectedTime < minDate) {
        onDateChange(minDate)
        return
      }
      onDateChange(selectedTime)
    }
  }

  const showMode = (currentMode: 'date' | 'time') => {
    const handled = openDatePicker(
      dateObj,
      handleDateChange,
      currentMode,
      new Date(),
      minDateObj
    )
    if (!handled) {
      setShowDatePicker(!showDatePicker)
    }
  }

  return (
    <View style={styles.formContainer}>
      {/* 测量日期 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.label}>测量日期</Text>
        <TouchableOpacity
          style={styles.dateInputContainer}
          onPress={() => showMode('date')}
        >
          <View style={styles.dateContentLeft}>
            <Ionicons name="calendar-outline" size={22} color="#5470C6" />
            <Text style={styles.dateValue}>{formattedDate}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* iOS DatePicker */}
      {Platform.OS === 'ios' && showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            testID="dateTimePicker"
            value={dateObj}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            style={styles.datePicker}
            locale="zh-CN"
            maximumDate={new Date()}
            minimumDate={minDateObj}
          />
        </View>
      )}

      {/* 身高 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.label}>身高</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="sprout-outline"
              size={24}
              color="#EE6666"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor="#CCC"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
          <Text style={styles.unitText}>cm</Text>
        </View>
      </View>

      {/* 体重 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.label}>体重</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name="shoe-print"
              size={24}
              color="#EE6666"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor="#CCC"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <Text style={styles.unitText}>kg</Text>
        </View>
      </View>

      {/* 头围 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.label}>头围</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="heart-outline" size={24} color="#EE6666" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor="#CCC"
            keyboardType="numeric"
            value={headCircumference}
            onChangeText={setHeadCircumference}
          />
          <Text style={styles.unitText}>cm</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 30
  },
  sectionContainer: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64
  },
  dateContentLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateValue: {
    fontSize: 18,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500'
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFF3E0'
  },
  datePicker: {
    width: '100%',
    height: 150
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 56
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0F0', // 浅红背景
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  input: {
    flex: 1,
    fontSize: 20, // 大字体
    fontWeight: 'bold',
    color: '#333',
    height: '100%'
  },
  unitText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
    fontWeight: '500'
  }
})
