import React, { useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'

import {
  AppKeyboardChatScrollView,
  default as AppKeyboardAvoidingView
} from '@/components/common/AppKeyboardAvoidingView'
import { uploadFile } from '@/api/upload'
import ChatAvatar from '@/components/chat/ChatAvatar'
import {
  chatCardShadow,
  chatGradients,
  chatPalette
} from '@/components/chat/chatTheme'
import { useMessage } from '@/components/Message'
import { useAppDispatch } from '@/hooks/redux'
import { createGroupConversation } from '@/store/modules/MessengerStore'
import { NavigationProps } from '@/types/navigation'

export default function CreateGroup() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { showMessage } = useMessage()

  const [avatar, setAvatar] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberLimit, setMemberLimit] = useState('50')

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '创建群聊',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: chatPalette.header
      },
      headerTintColor: chatPalette.textStrong
    })
  }, [navigation])

  const parsedLimit = useMemo(() => Number(memberLimit || 0), [memberLimit])

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permission.status !== 'granted') {
      showMessage('需要相册权限才能上传群头像')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    })

    if (result.canceled) return

    try {
      setUploading(true)
      const response = await uploadFile(result.assets[0].uri)
      const url =
        typeof response.data === 'string'
          ? response.data
          : response.data && typeof response.data.url === 'string'
            ? response.data.url
            : ''

      if (!url) {
        throw new Error('上传结果缺少地址')
      }

      setAvatar(url)
    } catch (error) {
      console.error(error)
      showMessage('群头像上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!avatar) {
      showMessage('请先上传群头像')
      return
    }
    if (!name.trim()) {
      showMessage('请输入群名称')
      return
    }
    if (!description.trim()) {
      showMessage('请输入群简介')
      return
    }
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      showMessage('请输入有效的群人数上限')
      return
    }

    try {
      setSubmitting(true)
      const res = await dispatch(
        createGroupConversation({
          avatar,
          description: description.trim(),
          member_limit: parsedLimit,
          name: name.trim()
        })
      )

      const nextGroupId = res?.data?.group_id
      if (!nextGroupId) {
        throw new Error(res?.message || '创建群聊失败')
      }

      navigation.replace('ChatDetail', {
        conversationType: 'group',
        groupId: nextGroupId
      })
    } catch (error: any) {
      showMessage(error?.message || '创建群聊失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient
        colors={chatGradients.page}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <AppKeyboardAvoidingView style={styles.container}>
        <AppKeyboardChatScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={chatGradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>做一个好看的群聊入口</Text>
            <Text style={styles.heroText}>
              群头像、名称和简介会直接出现在聊天列表里，尽量一次填完整。
            </Text>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>群头像</Text>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={pickAvatar}
              style={styles.avatarPicker}
            >
              {uploading ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator
                    size="small"
                    color={chatPalette.accentStrong}
                  />
                </View>
              ) : avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarPreview} />
              ) : (
                <ChatAvatar
                  label={name || '群'}
                  size={78}
                  shape="roundedSquare"
                />
              )}
              <View style={styles.avatarTextWrap}>
                <Text style={styles.avatarTitle}>上传群头像</Text>
                <Text style={styles.avatarHint}>
                  创建群聊必填，建议使用清晰的方形图片
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={chatPalette.textMuted}
              />
            </TouchableOpacity>

            <Text style={styles.label}>群名称</Text>
            <TextInput
              placeholder="例如：宝宝夜奶群"
              placeholderTextColor="#B796A3"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>群简介</Text>
            <TextInput
              multiline
              maxLength={120}
              placeholder="介绍一下这个群是做什么的"
              placeholderTextColor="#B796A3"
              style={[styles.input, styles.textarea]}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>人数上限</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="例如 50"
              placeholderTextColor="#B796A3"
              style={styles.input}
              value={memberLimit}
              onChangeText={setMemberLimit}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={submitting}
              onPress={handleSubmit}
              style={styles.submitWrap}
            >
              <LinearGradient
                colors={
                  submitting
                    ? ['#F2C8D6', '#F2C8D6']
                    : [...chatGradients.accent]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? '创建中...' : '创建群聊'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </AppKeyboardChatScrollView>
      </AppKeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: chatPalette.page
  },
  container: {
    flex: 1
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28
  },
  hero: {
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: chatPalette.border,
    ...chatCardShadow
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: chatPalette.textStrong
  },
  heroText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    color: chatPalette.textMuted
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: chatPalette.border,
    padding: 18,
    paddingBottom: 24,
    marginTop: 18,
    ...chatCardShadow
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: chatPalette.textStrong,
    marginBottom: 10
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: chatPalette.text,
    marginBottom: 8,
    marginTop: 14
  },
  avatarPicker: {
    minHeight: 100,
    borderRadius: 24,
    backgroundColor: '#FFF4F7',
    borderWidth: 1,
    borderColor: chatPalette.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  avatarPreview: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: chatPalette.surfaceSoftAlt
  },
  avatarLoading: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarTextWrap: {
    flex: 1,
    marginLeft: 14
  },
  avatarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: chatPalette.textStrong
  },
  avatarHint: {
    marginTop: 4,
    fontSize: 12,
    color: chatPalette.textMuted,
    lineHeight: 18
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: '#FFF4F7',
    borderWidth: 1,
    borderColor: chatPalette.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: chatPalette.text
  },
  textarea: {
    height: 112,
    paddingTop: 14,
    textAlignVertical: 'top'
  },
  submitWrap: {
    marginTop: 22,
    borderRadius: 18
  },
  submitButton: {
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff'
  }
})
