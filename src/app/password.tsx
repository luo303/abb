import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { apiResetPassword, apiResetPasswordCode } from '../api/auth'
import { useMessage } from '../components/Message'

import { NavigationProps } from '../types/navigation'

export default function PasswordScreen() {
  const navigation = useNavigation<NavigationProps>()
  const { showMessage } = useMessage()

  // 表单状态
  const [formData, setFormData] = useState<{
    email: string
    code: string
    password: string
  }>({
    email: '',
    code: '',
    password: ''
  })

  // 加载状态
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isCodeLoading, setIsCodeLoading] = useState(false)

  // 表单输入变化处理
  const handleInputChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value
    })
  }

  // 获取验证码
  const handleGetCode = async () => {
    if (!formData.email) {
      showMessage('请输入邮箱地址')
      return
    }
    // 简单的邮箱格式验证
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      showMessage('请输入有效的邮箱地址')
      return
    }
    if (isCodeLoading || countdown > 0) return
    try {
      setIsCodeLoading(true)
      const res = await apiResetPasswordCode({
        email: formData.email
      })
      if (res.code === 0) {
        showMessage('验证码已发送')
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        showMessage('该邮箱未注册')
      }
    } catch (error) {
      showMessage('获取验证码失败，请稍后重试')
      console.log(error)
    } finally {
      setIsCodeLoading(false)
    }
  }

  // 表单验证
  const validateForm = () => {
    const { email, code, password } = formData

    if (!email) {
      showMessage('请输入邮箱')
      return false
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      showMessage('请输入有效的邮箱地址')
      return false
    }

    if (!code) {
      showMessage('请输入验证码')
      return false
    }

    if (!password) {
      showMessage('请输入新密码')
      return false
    }
    if (password.length < 6) {
      showMessage('密码长度至少6位')
      return false
    }

    return true
  }

  // 重置密码处理
  const handleResetPassword = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const res = await apiResetPassword({
        email: formData.email,
        code: formData.code,
        new_password: formData.password
      })
      if (res.code === 0) {
        showMessage('密码重置成功，请重新登录')
        navigation.goBack()
      } else {
        showMessage(res.message || '重置失败，请稍后重试')
      }
    } catch (error) {
      showMessage('重置失败，请稍后重试')
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/bg.png')}
        style={styles.backgroundImage}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* 返回箭头 */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.closeBtn}
              >
                <AntDesign name="left" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* T标题 */}
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>重置密码</Text>
              <Text style={styles.subTitle}>重新设置您的账户密码</Text>
            </View>

            {/* 表单 */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>邮箱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入注册邮箱"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={value => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>验证码</Text>
                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="请输入验证码"
                    placeholderTextColor="#9CA3AF"
                    value={formData.code}
                    onChangeText={value => handleInputChange('code', value)}
                    keyboardType="number-pad"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.getCodeBtn}
                    onPress={handleGetCode}
                    disabled={countdown > 0 || isCodeLoading || isLoading}
                  >
                    {isCodeLoading ? (
                      <ActivityIndicator color="#1f99b0" />
                    ) : (
                      <Text
                        style={[
                          styles.getCodeText,
                          countdown > 0 && styles.getCodeTextDisabled
                        ]}
                      >
                        {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>新密码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入新密码（至少6位）"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={value => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={{ height: 10 }} />

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>确认重置</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover'
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  header: {
    alignItems: 'flex-start',
    paddingVertical: 10
  },
  closeBtn: {
    padding: 5
  },
  titleSection: {
    marginTop: 20,
    marginBottom: 30
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subTitle: {
    fontSize: 14,
    color: '#999'
  },
  formContainer: {
    flex: 1
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500'
  },
  input: {
    height: 50,
    backgroundColor: '#F5F7FA',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#333'
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  getCodeBtn: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  getCodeText: {
    color: '#1f99b0',
    fontSize: 14
  },
  getCodeTextDisabled: {
    color: '#999'
  },
  submitBtn: {
    height: 50,
    backgroundColor: '#1f99b0',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#1f99b0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  btnDisabled: {
    backgroundColor: '#99d6e5'
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
})
