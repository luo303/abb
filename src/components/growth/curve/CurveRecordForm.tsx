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
  DateTimePickerAndroid,
  DateTimePickerEvent
} from '@react-native-community/datetimepicker'

interface CurveRecordFormProps {
  height: string
  setHeight: (text: string) => void
  weight: string
  setWeight: (text: string) => void
  headCircumference: string
  setHeadCircumference: (text: string) => void
  date: Date
  onDateChange: (date: Date) => void
}

export default function CurveRecordForm({
  height,
  setHeight,
  weight,
  setWeight,
  headCircumference,
  setHeadCircumference,
  date,
  onDateChange
}: CurveRecordFormProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)

  // 格式化日期 YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formattedDate = formatDate(date)

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'set' && selectedDate) {
      onDateChange(selectedDate)
    }
  }

  const showMode = (currentMode: 'date' | 'time') => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: date,
        onChange: handleDateChange,
        mode: currentMode,
        is24Hour: true
      })
    } else {
      setShowDatePicker(!showDatePicker)
    }
  }

  return (
    <View style={styles.formContainer}>
      <Text style={styles.dateHint}>今天是 {formattedDate}</Text>

      <View style={styles.titleRow}>
        <Text style={styles.pageTitle}>记录宝宝的成长</Text>
        <View style={styles.babyIconWrapper}>
          <MaterialCommunityIcons
            name="baby-face-outline"
            size={24}
            color="#FF9F43"
          />
        </View>
      </View>

      {/* 测量日期 */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>测量日期</Text>
        <TouchableOpacity
          style={styles.dateInputContainer}
          onPress={() => showMode('date')}
        >
          <Text style={styles.dateValue}>{formattedDate}</Text>
          <Ionicons name="calendar-outline" size={20} color="#FF9F43" />
        </TouchableOpacity>
      </View>

      {/* iOS DatePicker */}
      {Platform.OS === 'ios' && showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            style={styles.datePicker}
            locale="zh-CN"
          />
        </View>
      )}

      {/* 身高 */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>身高 (cm)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor="#CCC"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
          <View style={styles.inputDecoration}>
            <MaterialCommunityIcons
              name="sprout-outline"
              size={20}
              color="#AED581"
            />
          </View>
        </View>
      </View>

      {/* 体重 */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>体重 (kg)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor="#CCC"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <View style={styles.inputDecoration}>
            <MaterialCommunityIcons
              name="shoe-print"
              size={20}
              color="#FFCC80"
            />
          </View>
        </View>
      </View>

      {/* 头围 */}
      <View style={styles.inputRow}>
        <Text style={styles.label}>头围 (cm)</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor="#CCC"
            keyboardType="numeric"
            value={headCircumference}
            onChangeText={setHeadCircumference}
          />
          <View style={styles.inputDecoration}>
            <Ionicons name="heart-outline" size={20} color="#F48FB1" />
          </View>
        </View>
      </View>

      {/* 提示信息 */}
      <View style={styles.tipContainer}>
        <Ionicons
          name="bulb"
          size={18}
          color="#FFD54F"
          style={styles.tipIcon}
        />
        <Text style={styles.tipText}>
          定期记录宝宝的生长数据可以帮助医疗专家更好地评估宝宝的健康发育状态情况哦。
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 20
  },
  dateHint: {
    fontSize: 14,
    color: '#FFB74D',
    marginBottom: 8
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  babyIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  label: {
    width: 90,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555'
  },
  dateInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFF3E0'
  },
  dateValue: {
    fontSize: 16,
    color: '#333'
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    shadowColor: '#FF9F43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%'
  },
  inputDecoration: {
    marginLeft: 8,
    opacity: 0.8
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFDE7', // 极淡的黄色
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFF9C4'
  },
  tipIcon: {
    marginTop: 2,
    marginRight: 10
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#757575',
    lineHeight: 20
  }
})
