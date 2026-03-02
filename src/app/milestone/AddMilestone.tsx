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
      <AddPostHeader title="大事记" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }}
        >
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#ffffff', '#fff1f2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <LinearGradient
                colors={['#ff9a9e', '#f43f5e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.timeCta}
              >
                <TouchableOpacity
                  style={styles.timeCtaInner}
                  onPress={showDate}
                >
                  <View style={styles.ctaIcon}>
                    <MaterialIcons name="event" size={20} color="#fff" />
                  </View>
                  <View style={styles.ctaTextWrap}>
                    <Text style={styles.ctaTitle}>选择时间</Text>
                    <Text style={styles.ctaSubtitle}>
                      {eventTime
                        ? new Date(eventTime).toLocaleDateString()
                        : '点击选择时间'}
                    </Text>
                  </View>
                  <View style={styles.ctaArrow}>
                    <MaterialIcons
                      name="chevron-right"
                      size={20}
                      color="#fff"
                    />
                  </View>
                </TouchableOpacity>
              </LinearGradient>
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
    padding: 15,
    paddingBottom: 20
  },
  cardWrapper: {
    flexGrow: 1,
    marginBottom: 0,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#fff'
  },
  cardGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#fff'
  },
  timeCta: {
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5
  },
  timeCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  ctaTextWrap: {
    flex: 1
  },
  ctaTitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 2
  },
  ctaSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500'
  },
  ctaArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
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
