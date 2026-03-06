import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useDispatch, useSelector } from 'react-redux'
import {
  addBaby,
  resetBabyState,
  fetchBabyProfile
} from '../../store/modules/BabyStore'
import { Ionicons } from '@expo/vector-icons'
import { RootState } from '../../store'
import { LinearGradient } from 'expo-linear-gradient'
import { useMessage } from '../Message'

export default function AddBabyScreen() {
  const navigation = useNavigation()
  const dispatch = useDispatch<any>()
  const { showMessage } = useMessage()
  const { loading } = useSelector((state: RootState) => state.baby)

  const [name, setName] = useState('')
  const [gender, setGender] = useState('female')
  const [birthday, setBirthday] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [avatar, setAvatar] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [headCircumference, setHeadCircumference] = useState('')
  const [remark, setRemark] = useState('')

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    })

    if (!result.canceled) {
      setAvatar(result.assets[0].uri)
    }
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setBirthday(selectedDate)
    }
  }

  const handleSubmit = async () => {
    if (!name) {
      showMessage('请输入宝宝姓名')
      return
    }

    const babyData = {
      name,
      gender,
      birthday: birthday.getTime(),
      avatar: avatar || undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      head_circumference: headCircumference
        ? parseInt(headCircumference)
        : undefined,
      remark: remark || undefined
    }

    try {
      const resultAction = await dispatch(addBaby(babyData))
      if (addBaby.fulfilled.match(resultAction)) {
        if (resultAction.payload?.code === 0) {
          // 获取并存储详细信息
          if (resultAction.payload.data?.baby_id) {
            await dispatch(fetchBabyProfile(resultAction.payload.data.baby_id))
          }
          showMessage('宝宝创建成功')
          setTimeout(() => {
            dispatch(resetBabyState())
            navigation.goBack()
          }, 1000)
        } else {
          showMessage(resultAction.payload?.message || '创建失败')
        }
      } else {
        showMessage((resultAction.payload as string) || '创建失败')
      }
    } catch (err) {
      console.error(err)
      showMessage('发生未知错误')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.avatarWrapper}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="camera-outline" size={32} color="#999" />
                <Text style={styles.avatarText}>上传头像</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            宝宝姓名 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="请输入宝宝姓名"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
            maxLength={20}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            性别 <Text style={styles.required}>*</Text>
          </Text>
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
                男宝宝
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
                女宝宝
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            出生日期 <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{birthday.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthday}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>身高 (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#9CA3AF"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>体重 (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0"
              placeholderTextColor="#9CA3AF"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>头围 (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0"
            placeholderTextColor="#9CA3AF"
            value={headCircumference}
            onChangeText={setHeadCircumference}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>备注</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="备注信息，可填可不填"
            placeholderTextColor="#9CA3AF"
            value={remark}
            onChangeText={setRemark}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
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
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  scrollContent: {
    padding: 20
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  placeholderAvatar: {
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  formGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500'
  },
  required: {
    color: 'red'
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
  textArea: {
    height: 80
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
    backgroundColor: '#87CEEB' // Blue for male
  },
  genderButtonActiveFemale: {
    backgroundColor: '#FF69B4' // Pink for female
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
  row: {
    flexDirection: 'row'
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})
