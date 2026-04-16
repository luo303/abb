import React, { useLayoutEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import { Feather, Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Button } from 'react-native-paper'

import {
  AppKeyboardChatScrollView,
  default as AppKeyboardAvoidingView
} from '@/components/common/AppKeyboardAvoidingView'
import {
  chatCardShadow,
  chatGradients,
  chatPalette
} from '@/components/chat/chatTheme'
import { useAppDispatch } from '@/hooks/redux'
import { useMessage } from '@/components/Message'
import { bindPartnerAccount } from '@/store/modules/MessengerStore'
import { NavigationProps } from '@/types/navigation'

export default function BindPartner() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { showMessage } = useMessage()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '绑定另一半',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: chatPalette.header
      },
      headerTintColor: chatPalette.textStrong
    })
  }, [navigation])

  const handleSubmit = async () => {
    if (!account.trim() || !password.trim()) {
      showMessage('请填写另一半账号和密码')
      return
    }

    try {
      setSubmitting(true)
      await dispatch(
        bindPartnerAccount({
          account: account.trim(),
          password
        })
      )
      Alert.alert('绑定成功', '现在可以开始和另一半聊天了。', [
        {
          text: '去聊天',
          onPress: () => {
            navigation.replace('ChatDetail', {
              conversationType: 'partner'
            })
          }
        }
      ])
    } catch (error: any) {
      showMessage(error?.message || '绑定失败，请稍后重试')
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
            <LinearGradient
              colors={chatGradients.accent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroIcon}
            >
              <Feather name="heart" size={26} color="#fff" />
            </LinearGradient>
            <Text style={styles.heroTitle}>把另一半拉进聊天</Text>
            <Text style={styles.heroText}>
              绑定完成后，你们会像普通聊天工具一样拥有一个长期保留的私聊入口。
            </Text>
            <View style={styles.heroTags}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>支持文字</Text>
              </View>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>支持图片</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>账号验证</Text>
            <Text style={styles.cardHint}>输入另一半的登录账号和密码</Text>

            <Text style={styles.label}>另一半账号</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="person-outline"
                size={18}
                color={chatPalette.textMuted}
              />
              <TextInput
                autoCapitalize="none"
                placeholder="请输入账号"
                placeholderTextColor="#B796A3"
                style={styles.input}
                value={account}
                onChangeText={setAccount}
              />
            </View>

            <Text style={styles.label}>登录密码</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={chatPalette.textMuted}
              />
              <TextInput
                secureTextEntry
                placeholder="请输入密码"
                placeholderTextColor="#B796A3"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Button
              mode="contained"
              disabled={submitting}
              onPress={handleSubmit}
              style={styles.submitWrap}
              contentStyle={styles.submitButton}
              labelStyle={styles.submitButtonText}
              loading={submitting}
              buttonColor={chatPalette.accentStrong}
              uppercase={false}
            >
              立即绑定
            </Button>
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
    borderRadius: 34,
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: chatPalette.border,
    ...chatCardShadow
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
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
  heroTags: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10
  },
  heroTag: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.76)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: chatPalette.accentStrong
  },
  card: {
    marginTop: 18,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 18,
    borderWidth: 1,
    borderColor: chatPalette.border,
    ...chatCardShadow
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: chatPalette.textStrong
  },
  cardHint: {
    marginTop: 6,
    fontSize: 12,
    color: chatPalette.textMuted
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: chatPalette.text,
    marginBottom: 8,
    marginTop: 14
  },
  inputWrap: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFF4F7',
    borderWidth: 1,
    borderColor: chatPalette.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: chatPalette.text
  },
  submitWrap: {
    marginTop: 22,
    borderRadius: 18,
    shadowColor: chatPalette.accentStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4
  },
  submitButton: {
    height: 54,
    borderRadius: 18
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff'
  }
})
