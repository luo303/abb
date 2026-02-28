import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'

import AddPostHeader from '@/components/post/add/AddPostHeader'
import PostInput from '@/components/post/add/PostInput'
import ImageUploader from '@/components/post/add/ImageUploader'
import MilestoneFooter from '@/components/post/milestone/MilestoneFooter'
import PostUserInfo from '@/components/post/add/PostUserInfo'
import DateTimePicker, {
  DateTimePickerEvent
} from '@react-native-community/datetimepicker'
import { openDatePicker } from '@/utils/datePicker'
import { uploadFile } from '@/api/upload'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchBabyProfile } from '@/store/modules/BabyStore'

interface ImageItem {
  uri: string
  status: 'uploading' | 'done' | 'error'
  url?: string
}

export default function AddMilestoneScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const { currentBabyId, currentBabyDetail } = useSelector(
    (state: RootState) => state.baby
  )
  const birthdayMinDate = currentBabyDetail?.birthday
    ? new Date(currentBabyDetail.birthday)
    : undefined

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [pendingImages, setPendingImages] = useState<ImageItem[]>([])
  const [eventTime, setEventTime] = useState<number | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  React.useEffect(() => {
    if (!currentBabyId) return
    if (!currentBabyDetail || currentBabyDetail.baby_id !== currentBabyId) {
      dispatch(fetchBabyProfile(currentBabyId))
    }
  }, [currentBabyId, currentBabyDetail, dispatch])

  const handlePickTime = () => setShowPicker(true)

  const onTimeChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) {
      const selectedTime = selected.getTime()
      if (birthdayMinDate && selectedTime < birthdayMinDate.getTime()) {
        setEventTime(birthdayMinDate.getTime())
        return
      }
      setEventTime(selectedTime)
    }
  }

  const showDate = () => {
    const baseDate = eventTime ? new Date(eventTime) : new Date()
    const initialDate =
      birthdayMinDate && baseDate < birthdayMinDate ? birthdayMinDate : baseDate
    const handled = openDatePicker(
      initialDate,
      onTimeChange,
      'date',
      new Date(),
      birthdayMinDate
    )
    if (!handled) {
      setShowPicker(true)
    }
  }

  const handleAddImage = async () => {
    const remaining = 9 - images.length
    if (remaining <= 0) {
      alert('最多只能上传 9 张照片')
      return
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      alert('需要访问相册权限才能上传图片')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri)
      const newItems: ImageItem[] = newUris.map(uri => ({
        uri,
        status: 'uploading'
      }))
      setPendingImages(prev => [...prev, ...newItems])

      newItems.forEach(async img => {
        try {
          const response = await uploadFile(img.uri)
          let url = ''
          if (typeof response.data === 'string') url = response.data
          else if (response.data && typeof response.data.url === 'string')
            url = response.data.url
          if (!url) throw new Error('Invalid upload response')

          setPendingImages(prev =>
            prev.map(p =>
              p.uri === img.uri ? { ...p, status: 'done', url } : p
            )
          )
          setImages(prev => [...prev, url])
        } catch (e) {
          setPendingImages(prev =>
            prev.map(p => (p.uri === img.uri ? { ...p, status: 'error' } : p))
          )
        }
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    const cp = [...images]
    cp.splice(index, 1)
    setImages(cp)
  }

  return (
    <View style={styles.container}>
      <AddPostHeader title="记录大事记" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        >
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#ffffff', '#fff1f2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <PostUserInfo />

              <TouchableOpacity style={styles.timeRow} onPress={showDate}>
                <View style={styles.timeLeft}>
                  <View style={styles.timeIconWrap}>
                    <MaterialIcons name="event" size={18} color="#f43f5e" />
                  </View>
                  <Text style={styles.timeLabel}>时间</Text>
                </View>
                <View style={styles.timeRight}>
                  <Text
                    style={[
                      styles.timeValue,
                      !eventTime && styles.timeValuePlaceholder
                    ]}
                  >
                    {eventTime
                      ? new Date(eventTime).toLocaleDateString()
                      : '点击选择时间'}
                  </Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color="#9ca3af"
                  />
                </View>
              </TouchableOpacity>
              {Platform.OS === 'ios' && showPicker && (
                <View style={styles.pickerWrap}>
                  <DateTimePicker
                    mode="date"
                    display="spinner"
                    value={
                      eventTime
                        ? new Date(eventTime)
                        : birthdayMinDate && birthdayMinDate > new Date()
                          ? birthdayMinDate
                          : new Date()
                    }
                    onChange={onTimeChange}
                    style={{ width: '100%', height: 150 }}
                    minimumDate={birthdayMinDate}
                    maximumDate={new Date()}
                  />
                </View>
              )}

              <PostInput
                expand
                title={title}
                onTitleChange={setTitle}
                value={content}
                onChangeText={setContent}
                titlePlaceholder="给大事记起个标题..."
                placeholder="记录这个重要时刻的细节..."
              />

              <ImageUploader
                images={images}
                pendingImages={pendingImages}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
              />
            </LinearGradient>
          </View>
        </ScrollView>

        <MilestoneFooter
          data={{
            title,
            content,
            images,
            eventTime: eventTime || undefined
          }}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    padding: 15
  },
  cardWrapper: {
    flexGrow: 1,
    marginBottom: 15,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderRadius: 20,
    backgroundColor: '#fff'
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#fff'
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderWidth: 1,
    borderColor: '#fecdd3',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3
  },
  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fda4af',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  timeLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '600'
  },
  timeValue: {
    fontSize: 14,
    color: '#374151',
    marginRight: 6
  },
  timeValuePlaceholder: {
    color: '#9ca3af'
  },
  pickerWrap: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2'
  }
})
