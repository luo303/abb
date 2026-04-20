import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Plus } from '@zappicon/react-native'

import { useMessage } from '@/components/Message'

type Props = {
  disabled?: boolean
  placeholder?: string
  inputNativeID?: string
  onSend: (payload: { text: string; images: string[] }) => Promise<void> | void
  // Legacy callback kept optional for other callers; ChatDetail no longer uses it
  onSent?: (kind: 'text' | 'image') => void
}

function ChatDetailInput({
  disabled = false,
  placeholder = '发消息...',
  inputNativeID,
  onSend,
  onSent
}: Props) {
  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()
  const [value, setValue] = useState('')
  const [sendingText, setSendingText] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const actionProgress = useRef(new Animated.Value(0)).current

  const hasText = useMemo(() => value.trim().length > 0, [value])
  const isBusy = disabled || sendingText || uploadingImages
  const isInputEditable = !disabled && !uploadingImages

  const paddingBottom = useMemo(() => {
    return Platform.OS === 'android' ? 10 : Math.max(insets.bottom, 10)
  }, [insets.bottom])

  useEffect(() => {
    Animated.timing(actionProgress, {
      toValue: hasText ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start()
  }, [actionProgress, hasText])

  const actionSlotWidth = useMemo(() => {
    return actionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [40, 62]
    })
  }, [actionProgress])

  const plusOpacity = useMemo(() => {
    return actionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    })
  }, [actionProgress])

  const plusTranslateX = useMemo(() => {
    return actionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -8]
    })
  }, [actionProgress])

  const sendOpacity = useMemo(() => {
    return actionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    })
  }, [actionProgress])

  const sendTranslateX = useMemo(() => {
    return actionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0]
    })
  }, [actionProgress])

  const handleSendText = useCallback(async () => {
    const text = value.trim()
    if (!text || isBusy) return

    try {
      setSendingText(true)
      setValue('')
      const sendPromise = onSend({
        text,
        images: []
      })
      requestAnimationFrame(() => {
        onSent?.('text')
      })
      await sendPromise
    } catch (error) {
      setValue(current => current || text)
      throw error
    } finally {
      setSendingText(false)
    }
  }, [isBusy, onSend, onSent, value])

  const handlePickImages = useCallback(async () => {
    if (isBusy || hasText) return

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permission.status !== 'granted') {
      showMessage('需要访问相册权限以选择图片')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 9,
      quality: 0.82
    })

    if (result.canceled || result.assets.length === 0) {
      return
    }

    try {
      setUploadingImages(true)
      const sendPromise = onSend({
        text: '',
        images: result.assets.map(asset => asset.uri)
      })
      requestAnimationFrame(() => {
        onSent?.('image')
      })
      await sendPromise
    } catch (error) {
      console.error('Chat image send failed:', error)
      showMessage('图片发送失败，请稍后重试')
    } finally {
      setUploadingImages(false)
    }
  }, [hasText, isBusy, onSend, onSent, showMessage])

  return (
    <View style={[styles.container, { paddingBottom }]}>
      <View style={styles.row}>
        <View style={styles.inputWrap}>
          <TextInput
            nativeID={inputNativeID}
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor="#9B9B9B"
            multiline
            maxLength={1000}
            editable={isInputEditable}
            textAlignVertical="center"
          />
        </View>

        <Animated.View style={[styles.actionSlot, { width: actionSlotWidth }]}>
          <>
            <Animated.View
              pointerEvents={hasText ? 'none' : 'auto'}
              style={[
                styles.actionLayer,
                {
                  opacity: plusOpacity,
                  transform: [{ translateX: plusTranslateX }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isBusy && styles.actionButtonDisabled
                ]}
                onPress={handlePickImages}
                disabled={isBusy}
                activeOpacity={0.85}
              >
                <Plus size={24} color="#5A5A5A" variant="regular" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              pointerEvents={hasText ? 'auto' : 'none'}
              style={[
                styles.actionLayer,
                styles.sendLayer,
                {
                  opacity: sendOpacity,
                  transform: [{ translateX: sendTranslateX }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isBusy && styles.actionButtonDisabled
                ]}
                onPress={handleSendText}
                disabled={isBusy}
                activeOpacity={0.85}
              >
                <Text style={styles.sendButtonText}>
                  {sendingText ? '发送中' : '发送'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        </Animated.View>
      </View>
    </View>
  )
}

export default memo(ChatDetailInput)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 8,
    paddingHorizontal: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  inputWrap: {
    flex: 1,
    minHeight: 40,
    maxHeight: 118,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 2
  },
  input: {
    minHeight: 36,
    maxHeight: 112,
    fontSize: 16,
    lineHeight: 22,
    color: '#222',
    paddingTop: 8,
    paddingBottom: 8
  },
  actionSlot: {
    marginLeft: 10,
    height: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  actionLayer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendLayer: {
    left: 0
  },
  sendButton: {
    minWidth: 56,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: '#3C9CFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff'
  },
  actionButtonDisabled: {
    opacity: 0.7
  }
})
