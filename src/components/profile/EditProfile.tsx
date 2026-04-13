import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector } from 'react-redux'
import AppKeyboardAvoidingView from '../common/AppKeyboardAvoidingView'

import {
  updateProfileReq,
  UpdateProfilePayload,
  UserMeResponse
} from '../../api/profile'
import { useMessage } from '../Message'
import { RootState } from '../../store'

function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}${month}${day}`
}

function formatDateDisplay(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isValidPhone(phone: string) {
  const cleaned = phone.replace(/\s+/g, '')
  const reg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
  return reg.test(cleaned)
}

export default function EditProfile() {
  const navigation = useNavigation()
  const { showMessage } = useMessage()
  const userInfo = useSelector(
    (state: RootState) => state.user.userInfo
  ) as UserMeResponse | null

  const [occupation, setOccupation] = useState('')
  const [phone, setPhone] = useState('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('female')
  const [birthday, setBirthday] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!userInfo || initialized) return

    if (userInfo.occupation) {
      setOccupation(userInfo.occupation)
    }
    if (userInfo.phone) {
      setPhone(userInfo.phone)
    }
    if (userInfo.province) {
      setProvince(userInfo.province)
    }
    if (userInfo.city) {
      setCity(userInfo.city)
    }
    if (userInfo.gender === 'male' || userInfo.gender === 'female') {
      setGender(userInfo.gender)
    }
    if (userInfo.birthday) {
      setBirthday(new Date(userInfo.birthday))
    }

    setInitialized(true)
  }, [userInfo, initialized])

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event?.type === 'dismissed') {
        setShowDatePicker(false)
        return
      }
      if (event?.type === 'set') {
        setShowDatePicker(false)
        if (selectedDate) {
          setBirthday(selectedDate)
        }
        return
      }
      return
    }

    setShowDatePicker(false)
    if (selectedDate) {
      setBirthday(selectedDate)
    }
  }

  const handleSubmit = async () => {
    const occupationValue = occupation.trim()
    const phoneValue = phone.replace(/\s+/g, '')
    const provinceValue = province.trim()
    const cityValue = city.trim()

    if (!occupationValue) {
      showMessage('请输入职业')
      return
    }
    if (!phoneValue) {
      showMessage('请输入手机号')
      return
    }
    if (!isValidPhone(phoneValue)) {
      showMessage('请输入有效的手机号')
      return
    }
    if (!provinceValue) {
      showMessage('请输入所在省份')
      return
    }
    if (!cityValue) {
      showMessage('请输入所在城市')
      return
    }
    if (!birthday) {
      showMessage('请选择生日')
      return
    }

    const payload: UpdateProfilePayload = {
      occupation: occupationValue,
      phone: phoneValue,
      province: provinceValue,
      city: cityValue,
      gender: gender === 'male' ? 'male' : 'female',
      birthday: formatDateToYYYYMMDD(birthday)
    }

    try {
      setLoading(true)
      const res = (await updateProfileReq(
        payload
      )) as unknown as import('../../api/profile').ApiResponse<
        import('../../api/profile').UpdateProfileResponse
      >

      if (res.code === 0) {
        navigation.goBack()
      } else {
        showMessage(res.message || '资料更新失败')
      }
    } catch (error) {
      console.error(error)
      showMessage('请求失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppKeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>职业</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入职业"
            placeholderTextColor="#9CA3AF"
            value={occupation}
            onChangeText={setOccupation}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>手机号</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入手机号"
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={20}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>所在省份</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：广东"
            placeholderTextColor="#9CA3AF"
            value={province}
            onChangeText={setProvince}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>所在城市</Text>
          <TextInput
            style={styles.input}
            placeholder="例如：佛山"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>生日</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {birthday ? formatDateDisplay(birthday) : '请选择生日'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>性别</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'male' && styles.genderButtonActive
              ]}
              onPress={() => setGender('male')}
            >
              <Ionicons
                name="male"
                size={20}
                color={gender === 'male' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.genderText,
                  gender === 'male' && styles.genderTextActive
                ]}
              >
                男
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                gender === 'female' && styles.genderButtonActiveFemale
              ]}
              onPress={() => setGender('female')}
            >
              <Ionicons
                name="female"
                size={20}
                color={gender === 'female' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.genderText,
                  gender === 'female' && styles.genderTextActive
                ]}
              >
                女
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={styles.submitButtonContainer}
        >
          <LinearGradient
            colors={['#FFB6C1', '#FF69B4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>保存</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthday || new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={handleDateChange}
          />
        )}
      </View>
    </AppKeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    padding: 20
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee'
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee'
  },
  dateText: {
    fontSize: 14,
    color: '#333'
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 16
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  genderButtonActive: {
    backgroundColor: '#87CEEB'
  },
  genderButtonActiveFemale: {
    backgroundColor: '#FF69B4'
  },
  genderText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666'
  },
  genderTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  submitButtonContainer: {
    marginTop: 20,
    marginBottom: 40
  },
  submitButton: {
    padding: 16,
    borderRadius: 30,
    alignItems: 'center'
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
})
