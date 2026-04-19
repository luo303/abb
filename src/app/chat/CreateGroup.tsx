import React, { useCallback, useLayoutEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import {
  Plus,
  Check,
  Camera,
  UserPlus,
  AngleUpSmall,
  AngleDownSmall
} from '@zappicon/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { Dropdown } from 'react-native-element-dropdown'
import { TextInput as PaperTextInput } from 'react-native-paper'
import { useSharedValue } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

import AppKeyboardAvoidingView from '@/components/common/AppKeyboardAvoidingView'
import { useKeyboardChatScrollRenderer } from '@/components/common/useKeyboardChatList'
import { uploadFile } from '@/api/upload'
import { useMessage } from '@/components/Message'
import { chatCardShadow, chatGradients } from '@/components/chat/chatTheme'
import { useAppDispatch } from '@/hooks/redux'
import { createGroupConversation } from '@/store/modules/MessengerStore'
import { NavigationProps } from '@/types/navigation'

const MEMBER_LIMIT_OPTIONS = [3, 5, 10, 20, 30, 40, 50].map(limit => ({
  label: `${limit} 人`,
  value: limit
}))

const GROUP_INPUT_THEME = {
  colors: {
    primary: '#111111',
    outline: 'rgba(17,17,17,0.08)',
    onSurfaceVariant: '#7d7670',
    background: '#ffffff'
  }
} as const

type MemberLimitOption = (typeof MEMBER_LIMIT_OPTIONS)[number]
const FORM_LIST_DATA = [{ key: 'create-group-form' }] as const

export default function CreateGroup() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { showMessage } = useMessage()

  const [avatarPreviewUri, setAvatarPreviewUri] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [memberLimit, setMemberLimit] = useState<number>(50)
  const [limitFocused, setLimitFocused] = useState(false)
  const extraContentPadding = useSharedValue(0)
  const renderKeyboardScrollComponent = useKeyboardChatScrollRenderer({
    extraContentPadding,
    keyboardLiftBehavior: 'whenAtEnd'
  })

  const pickAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      showMessage('需要相册权限才能上传群头像')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    })

    if (result.canceled) return

    try {
      setAvatarPreviewUri(result.assets[0].uri)
      setAvatarUrl('')
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

      setAvatarUrl(url)
    } catch (error) {
      console.error(error)
      showMessage('群头像上传失败，请重新上传后再创建群聊')
    } finally {
      setUploading(false)
    }
  }, [showMessage])

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    if (uploading) {
      showMessage('群头像上传中，请稍候')
      return
    }

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!avatarUrl) {
      showMessage(
        avatarPreviewUri
          ? '群头像还没上传成功，请重新上传后再创建'
          : '请先上传群头像，拿到服务器地址后再创建'
      )
      return
    }
    if (!trimmedName) {
      showMessage('请输入群名称')
      return
    }
    if (!trimmedDescription) {
      showMessage('请输入群简介')
      return
    }

    try {
      setSubmitting(true)
      const res = await dispatch(
        createGroupConversation({
          avatar: avatarUrl,
          description: trimmedDescription,
          member_limit: memberLimit,
          name: trimmedName
        })
      )

      const nextGroupId = res?.data?.group_id?.trim()

      navigation.replace('ChatDetail', {
        conversationType: 'group',
        groupId: nextGroupId
      })
    } catch (error: any) {
      showMessage(error?.message || '创建群聊失败')
    } finally {
      setSubmitting(false)
    }
  }, [
    avatarPreviewUri,
    avatarUrl,
    description,
    dispatch,
    memberLimit,
    name,
    navigation,
    showMessage,
    submitting,
    uploading
  ])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#f7f3ee'
      },
      headerTintColor: '#111111',
      headerRight: () => (
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={submitting || uploading}
          hitSlop={8}
          onPress={handleSubmit}
          style={[
            styles.headerAction,
            (submitting || uploading) && styles.headerActionDisabled
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Plus size={15} color="#ffffff" variant="regular" />
              <Text style={styles.headerActionText}>创建</Text>
            </>
          )}
        </TouchableOpacity>
      )
    })
  }, [handleSubmit, navigation, submitting, uploading])

  const renderLimitItem = useCallback(
    (item: MemberLimitOption) => {
      const selected = item.value === memberLimit

      return (
        <View
          style={[styles.dropdownItem, selected && styles.dropdownItemActive]}
        >
          <Text
            style={[
              styles.dropdownItemText,
              selected && styles.dropdownItemTextActive
            ]}
          >
            {item.label}
          </Text>
          {selected ? (
            <Check size={18} color="#111111" variant="regular" />
          ) : null}
        </View>
      )
    },
    [memberLimit]
  )

  const previewName = name.trim() || '新的群聊'
  const previewDescription =
    description.trim() || '上传头像、填写资料后，群成员会先看到这里。'
  const previewAvatar = avatarPreviewUri || avatarUrl
  const uploadHint = uploading
    ? '头像上传中...'
    : avatarUrl
      ? '已上传到服务器'
      : avatarPreviewUri
        ? '上传失败，点击重试'
        : '点击上传头像'

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient
        colors={chatGradients.page}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.backgroundOrbOne} />
      <View pointerEvents="none" style={styles.backgroundOrbTwo} />

      <AppKeyboardAvoidingView style={styles.container}>
        <FlashList
          bounces={false}
          data={FORM_LIST_DATA}
          contentContainerStyle={styles.content}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
          renderScrollComponent={renderKeyboardScrollComponent}
          renderItem={() => (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                disabled={uploading}
                onPress={pickAvatar}
                style={styles.avatarSection}
              >
                <View style={styles.avatarHalo}>
                  <View style={styles.avatarShell}>
                    {previewAvatar ? (
                      <Image
                        source={{ uri: previewAvatar }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarEmptyState}>
                        <Plus size={38} color="#111111" variant="regular" />
                      </View>
                    )}

                    {uploading ? (
                      <View style={styles.avatarUploadingMask}>
                        <ActivityIndicator color="#ffffff" size="small" />
                      </View>
                    ) : null}

                    <View style={styles.avatarBadge}>
                      <Camera size={18} color="#ffffff" variant="regular" />
                    </View>
                  </View>
                </View>

                <Text style={styles.previewName}>{previewName}</Text>
                <Text style={styles.previewDescription}>
                  {previewDescription}
                </Text>

                <View style={styles.previewMetaRow}>
                  <View style={styles.previewMetaChip}>
                    <UserPlus size={14} color="#4c4641" variant="regular" />
                    <Text style={styles.previewMetaText}>
                      {memberLimit} 人上限
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.previewUploadHint,
                      uploading && styles.previewUploadHintPending,
                      avatarUrl && styles.previewUploadHintSuccess,
                      avatarPreviewUri &&
                        !avatarUrl &&
                        !uploading &&
                        styles.previewUploadHintError
                    ]}
                  >
                    {uploadHint}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>群聊资料</Text>
                  <Text style={styles.sectionTitle}>
                    让成员一眼看懂这是个什么群
                  </Text>
                </View>

                <View style={styles.formCard}>
                  <View style={styles.limitBlock}>
                    <Text style={styles.limitLabel}>群名称</Text>
                    <PaperTextInput
                      activeOutlineColor="#111111"
                      autoCapitalize="words"
                      contentStyle={styles.paperInputContent}
                      dense
                      label="群名称"
                      mode="outlined"
                      onChangeText={setName}
                      outlineColor="rgba(17,17,17,0.08)"
                      outlineStyle={styles.paperInputOutline}
                      placeholder="例如：宝宝夜奶互助群"
                      style={styles.paperInput}
                      textColor="#111111"
                      theme={GROUP_INPUT_THEME}
                      value={name}
                    />
                  </View>
                  <View style={styles.limitBlock}>
                    <Text style={styles.limitLabel}>群简介</Text>
                    <PaperTextInput
                      activeOutlineColor="#111111"
                      contentStyle={styles.descriptionContent}
                      label="群简介"
                      mode="outlined"
                      multiline
                      numberOfLines={4}
                      onChangeText={setDescription}
                      outlineColor="rgba(17,17,17,0.08)"
                      outlineStyle={styles.paperInputOutline}
                      placeholder="例如：分享宝宝作息、夜奶经验和日常问题"
                      style={[styles.paperInput, styles.descriptionInput]}
                      textColor="#111111"
                      theme={GROUP_INPUT_THEME}
                      value={description}
                    />
                  </View>
                  <View style={styles.limitBlock}>
                    <Text style={styles.limitLabel}>人数上限</Text>
                    <Dropdown
                      autoScroll={false}
                      style={[
                        styles.dropdown,
                        limitFocused && styles.dropdownFocused
                      ]}
                      containerStyle={styles.dropdownContainer}
                      data={MEMBER_LIMIT_OPTIONS}
                      dropdownPosition="top"
                      labelField="label"
                      maxHeight={320}
                      onBlur={() => setLimitFocused(false)}
                      onChange={(item: MemberLimitOption) => {
                        setMemberLimit(item.value)
                        setLimitFocused(false)
                      }}
                      onFocus={() => setLimitFocused(true)}
                      placeholder="选择人数上限"
                      placeholderStyle={styles.dropdownPlaceholder}
                      renderItem={renderLimitItem}
                      renderLeftIcon={() => (
                        <View style={styles.dropdownLeft}>
                          <UserPlus
                            color="#111111"
                            size={18}
                            variant="regular"
                          />
                          <Text style={styles.dropdownLeftText}>群规模</Text>
                        </View>
                      )}
                      renderRightIcon={() =>
                        limitFocused ? (
                          <AngleUpSmall
                            color="#7d7670"
                            size={18}
                            variant="regular"
                          />
                        ) : (
                          <AngleDownSmall
                            color="#7d7670"
                            size={18}
                            variant="regular"
                          />
                        )
                      }
                      selectedTextStyle={styles.dropdownSelectedText}
                      value={memberLimit}
                      valueField="value"
                    />
                  </View>
                </View>
              </View>
            </>
          )}
          showsVerticalScrollIndicator={false}
        />
      </AppKeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f3ee'
  },
  container: {
    flex: 1
  },
  backgroundOrbOne: {
    position: 'absolute',
    top: -36,
    right: -44,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.85)'
  },
  backgroundOrbTwo: {
    position: 'absolute',
    top: 124,
    left: -52,
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(249,235,227,0.78)'
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40
  },
  headerAction: {
    minWidth: 78,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 3
  },
  headerActionDisabled: {
    opacity: 0.65
  },
  headerActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff'
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 8
  },
  avatarHalo: {
    width: 152,
    height: 152,
    borderRadius: 76,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.68)'
  },
  avatarShell: {
    width: 122,
    height: 122,
    borderRadius: 61,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.06)',
    backgroundColor: '#fcfaf7',
    ...chatCardShadow
  },
  avatarEmptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  avatarUploadingMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17,17,17,0.32)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  previewName: {
    marginTop: 18,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111111',
    letterSpacing: -0.6
  },
  previewDescription: {
    marginTop: 8,
    maxWidth: 290,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    color: '#6e6761'
  },
  previewMetaRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  previewMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.86)'
  },
  previewMetaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4c4641'
  },
  previewUploadHint: {
    fontSize: 13,
    color: '#7d7670'
  },
  previewUploadHintPending: {
    color: '#9c6b34'
  },
  previewUploadHintSuccess: {
    color: '#2f7c5a'
  },
  previewUploadHintError: {
    color: '#c45c4d'
  },
  formSection: {
    marginTop: 34
  },
  sectionHeader: {
    paddingHorizontal: 2,
    marginBottom: 14
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#9b938b'
  },
  sectionTitle: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#161311'
  },
  formCard: {
    flex: 1
  },
  paperInput: {
    backgroundColor: '#ffffff'
  },
  paperInputContent: {
    paddingVertical: 8
  },
  paperInputOutline: {
    borderRadius: 12
  },
  descriptionInput: {
    minHeight: 126
  },
  descriptionContent: {
    minHeight: 92,
    paddingTop: 12
  },
  limitBlock: {
    marginTop: 16
  },
  limitLabel: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#5f5954'
  },
  dropdown: {
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.08)',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff'
  },
  dropdownFocused: {
    borderColor: '#111111'
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dropdownLeftText: {
    fontSize: 15,
    color: '#5f5954'
  },
  dropdownContainer: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(17,17,17,0.05)',
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    overflow: 'hidden'
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#7d7670'
  },
  dropdownSelectedText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'right'
  },
  dropdownItem: {
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(17,17,17,0.04)'
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#49433d'
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#111111'
  }
})
