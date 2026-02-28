import { Platform } from 'react-native'
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent
} from '@react-native-community/datetimepicker'

export { DateTimePicker }

/**
 * 打开日期选择器 (Android 使用 imperative API, iOS 返回 false 需自行处理 UI)
 * @param value 当前日期
 * @param onChange 回调函数
 * @param mode 模式 'date' | 'time'
 * @returns boolean 如果是 Android 并成功打开返回 true, iOS 返回 false
 */
export const openDatePicker = (
  value: Date,
  onChange: (event: DateTimePickerEvent, date?: Date) => void,
  mode: 'date' | 'time' = 'date',
  maximumDate?: Date,
  minimumDate?: Date
): boolean => {
  if (Platform.OS === 'android') {
    DateTimePickerAndroid.open({
      value,
      onChange,
      mode,
      is24Hour: true,
      maximumDate,
      minimumDate
    })
    return true
  }
  return false
}
