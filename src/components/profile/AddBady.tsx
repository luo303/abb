import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useDispatch, useSelector } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'

import {
  addBaby,
  fetchBabyProfile,
  resetBabyState
} from '../../store/modules/BabyStore'
import { RootState } from '../../store'
import { useMessage } from '../Message'
import AppKeyboardAvoidingView from '../common/AppKeyboardAvoidingView'
import GenderRadioRow, { GenderValue } from '../common/GenderRadioRow'
import PaperAvatar from '../common/PaperAvatar'

export default function AddBabyScreen() {
  const navigation = useNavigation()
  const dispatch = useDispatch<any>()
  const { showMessage } = useMessage()
  const { loading } = useSelector((state: RootState) => state.baby)

  const [name, setName] = useState('')
  const [gender, setGender] = useState<GenderValue>('female')
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

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setBirthday(selectedDate)
    }
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      showMessage('请输入宝宝姓名')
      return
    }

    if (!avatar) {
      showMessage('请上传宝宝头像')
      return
    }

    const babyData = {
      name: trimmedName,
      gender,
      birthday: birthday.getTime(),
      avatar,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      head_circumference: headCircumference
        ? parseInt(headCircumference, 10)
        : undefined,
      remark: remark || undefined
    }

    try {
      const resultAction = await dispatch(addBaby(babyData))
      if (addBaby.fulfilled.match(resultAction)) {
        if (resultAction.payload?.code === 0) {
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
    } catch (error) {
      console.error(error)
      showMessage('发生未知错误')
    }
  }

  return (
    <AppKeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <Text style={styles.avatarLabel}>
            宝宝头像 <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.avatarWrapper}
          >
            <PaperAvatar size={100} source={avatar} style={styles.avatar} />
            <View style={styles.placeholderAvatar}>
              <Ionicons name="camera-outline" size={28} color="#fff" />
              <Text style={styles.avatarText}>
                {avatar ? '重新选择' : '上传头像'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            宝宝姓名 <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            maxLength={20}
            onChangeText={setName}
            placeholder="请输入宝宝姓名"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={name}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            性别 <Text style={styles.required}>*</Text>
          </Text>
          <GenderRadioRow
            disabled={loading}
            onChange={setGender}
            options={[
              { label: '男宝宝', value: 'male' },
              { label: '女宝宝', value: 'female' }
            ]}
            value={gender}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            出生日期 <Text style={styles.required}>*</Text>
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
            contentStyle={styles.dateButtonContent}
            labelStyle={styles.dateButtonLabel}
            icon="calendar-outline"
            uppercase={false}
          >
            {birthday.toLocaleDateString()}
          </Button>
          {showDatePicker ? (
            <DateTimePicker
              display="default"
              maximumDate={new Date()}
              mode="date"
              onChange={handleDateChange}
              value={birthday}
            />
          ) : null}
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>身高 (cm)</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={setHeight}
              placeholder="0.0"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={height}
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>体重 (kg)</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={setWeight}
              placeholder="0.0"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={weight}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>头围 (cm)</Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={setHeadCircumference}
            placeholder="0.0"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={headCircumference}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>备注</Text>
          <TextInput
            multiline
            numberOfLines={3}
            onChangeText={setRemark}
            placeholder="备注信息，可填可不填"
            placeholderTextColor="#9CA3AF"
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={remark}
          />
        </View>

        <Button
          mode="contained"
          disabled={loading}
          onPress={handleSubmit}
          style={styles.submitButtonContainer}
          contentStyle={styles.submitButton}
          labelStyle={styles.submitButtonText}
          loading={loading}
          buttonColor="#FF69B4"
          uppercase={false}
        >
          保存
        </Button>
      </ScrollView>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  avatarLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500'
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
    height: '100%',
    borderRadius: 50
  },
  placeholderAvatar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.38)'
  },
  avatarText: {
    fontSize: 12,
    color: '#fff',
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
  dateButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  dateButtonContent: {
    minHeight: 48
  },
  dateButtonLabel: {
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
    height: 52,
    borderRadius: 30
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})
