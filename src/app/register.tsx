import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import AuthBackground from '../components/common/AuthBackground'
import AppKeyboardAvoidingView from '../components/common/AppKeyboardAvoidingView'

import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { Button } from 'react-native-paper'
import { apiRegister, apiRegisterCode } from '../api/auth'
import { useMessage } from '../components/Message'

import { NavigationProps } from '../types/navigation'

const THEME_PRIMARY = '#f43f5e'
const THEME_PRIMARY_DARK = '#e11d48'
const THEME_PRIMARY_DISABLED = '#fda4af'

type FocusedField =
  | 'username'
  | 'account'
  | 'password'
  | 'email'
  | 'code'
  | null

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProps>()
  const { showMessage } = useMessage()

  // 表单状态
  const [formData, setFormData] = useState<{
    account: string
    email: string
    password: string
    username: string
    code: string
    gender: 'male' | 'female'
  }>({
    account: '',
    email: '',
    password: '',
    username: '',
    code: '',
    gender: 'male'
  })

  // 加载状态
  const [isLoading, setIsLoading] = useState(false)
  const [agree, setAgree] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isCodeLoading, setIsCodeLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<FocusedField>(null)
  // 表单输入变化处理
  const handleInputChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value
    })
  }

  // 表单验证
  const validateForm = () => {
    const { account, email, password, username, code } = formData

    if (!agree) {
      showMessage('请先阅读并同意用户协议和隐私授权')
      return false
    }

    // 用户名验证
    if (!username) {
      showMessage('请输入用户名')
      return false
    }
    if (username.length < 3 || username.length > 20) {
      showMessage('用户名长度需在3-20个字符之间')
      return false
    }

    // 账号验证
    if (!account) {
      showMessage('请输入账号')
      return false
    }

    // 验证码验证
    if (!code) {
      showMessage('请输入验证码')
      return false
    }

    // 邮箱验证（简单正则）
    if (
      email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      showMessage('请输入有效的邮箱地址')
      return false
    }

    // 密码验证
    if (!password) {
      showMessage('请输入密码')
      return false
    }
    if (password.length < 6) {
      showMessage('密码长度至少6位')
      return false
    }

    return true
  }
  //获取验证码
  const GetCode = async () => {
    if (isCodeLoading || countdown > 0) return
    if (!formData.email) {
      showMessage('请输入邮箱')
      return
    }
    try {
      setIsCodeLoading(true)
      const res = await apiRegisterCode({
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
        showMessage('改邮箱不存在')
        return
      }
    } catch (error) {
      showMessage('获取验证码失败，请稍后重试')
      console.log(error)
    } finally {
      setIsCodeLoading(false)
    }
  }
  // 注册处理函数
  const handleRegister = async () => {
    // 表单验证
    if (!validateForm()) return

    // 设置加载状态
    setIsLoading(true)

    try {
      const res = await apiRegister(formData)
      if (res.code === 0) {
        showMessage('注册成功！请登录')
        navigation.goBack()
      } else {
        showMessage(res.message || '注册失败')
        return
      }

      setFormData({
        username: '',
        email: '',
        password: '',
        account: '',
        code: '',
        gender: 'male'
      })
    } catch (error) {
      showMessage('注册失败，请稍后重试')
      console.error('注册失败：', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea}>
        <AppKeyboardAvoidingView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>欢迎注册</Text>
              <Text style={styles.subTitle}>开启您的宝宝成长记录之旅！</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>用户名</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'username' && styles.inputFocused
                  ]}
                  placeholder="请输入用户名（3-20位）"
                  placeholderTextColor="#9CA3AF"
                  value={formData.username}
                  onChangeText={value => handleInputChange('username', value)}
                  autoCapitalize="none"
                  editable={!isLoading}
                  selectionColor={THEME_PRIMARY}
                  cursorColor={THEME_PRIMARY}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>账号</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'account' && styles.inputFocused
                  ]}
                  placeholder="请输入账号(可用于后续登录)"
                  placeholderTextColor="#9CA3AF"
                  value={formData.account}
                  onChangeText={value => handleInputChange('account', value)}
                  autoCapitalize="none"
                  editable={!isLoading}
                  selectionColor={THEME_PRIMARY}
                  cursorColor={THEME_PRIMARY}
                  onFocus={() => setFocusedField('account')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>密码</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'password' && styles.inputFocused
                  ]}
                  placeholder="请输入密码（至少6位）"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={value => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                  selectionColor={THEME_PRIMARY}
                  cursorColor={THEME_PRIMARY}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>性别</Text>
                <View style={styles.genderContainer}>
                  <Button
                    mode={formData.gender === 'male' ? 'contained' : 'outlined'}
                    style={[
                      styles.genderButton,
                      formData.gender === 'male' && styles.genderButtonActive
                    ]}
                    contentStyle={styles.genderButtonContent}
                    labelStyle={[
                      styles.genderButtonLabel,
                      formData.gender === 'male' && styles.genderTextActive
                    ]}
                    onPress={() => handleInputChange('gender', 'male')}
                    disabled={isLoading}
                    buttonColor={THEME_PRIMARY}
                    textColor={formData.gender === 'male' ? '#fff' : '#666'}
                    uppercase={false}
                  >
                    男
                  </Button>

                  <Button
                    mode={
                      formData.gender === 'female' ? 'contained' : 'outlined'
                    }
                    style={[
                      styles.genderButton,
                      formData.gender === 'female' &&
                        styles.genderButtonActiveFemale
                    ]}
                    contentStyle={styles.genderButtonContent}
                    labelStyle={[
                      styles.genderButtonLabel,
                      formData.gender === 'female' && styles.genderTextActive
                    ]}
                    onPress={() => handleInputChange('gender', 'female')}
                    disabled={isLoading}
                    buttonColor={THEME_PRIMARY_DARK}
                    textColor={formData.gender === 'female' ? '#fff' : '#666'}
                    uppercase={false}
                  >
                    女
                  </Button>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>邮箱</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'email' && styles.inputFocused
                  ]}
                  placeholder="请输入邮箱"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={value => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  selectionColor={THEME_PRIMARY}
                  cursorColor={THEME_PRIMARY}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>验证码</Text>
                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      focusedField === 'code' && styles.inputFocused,
                      { flex: 1, marginBottom: 0 }
                    ]}
                    placeholder="请输入验证码"
                    placeholderTextColor="#9CA3AF"
                    value={formData.code}
                    onChangeText={value => handleInputChange('code', value)}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    editable={!isLoading}
                    selectionColor={THEME_PRIMARY}
                    cursorColor={THEME_PRIMARY}
                    onFocus={() => setFocusedField('code')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Button
                    compact
                    mode="text"
                    style={styles.getCodeBtn}
                    contentStyle={styles.getCodeButtonContent}
                    labelStyle={[
                      styles.getCodeButtonLabel,
                      countdown > 0 && styles.getCodeButtonLabelDisabled
                    ]}
                    onPress={() => GetCode()}
                    disabled={countdown > 0 || isCodeLoading}
                    loading={isCodeLoading}
                    uppercase={false}
                  >
                    {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
                  </Button>
                </View>
              </View>

              <View style={{ height: 20 }} />

              {/* 注册按钮 */}
              <Button
                mode="contained"
                style={[styles.loginBtn, isLoading && styles.btnDisabled]}
                contentStyle={styles.primaryButtonContent}
                labelStyle={styles.primaryButtonLabel}
                onPress={handleRegister}
                disabled={isLoading}
                loading={isLoading}
                buttonColor={THEME_PRIMARY}
                uppercase={false}
              >
                注册
              </Button>

              {/* 用户协议和隐私授权 */}
              <View style={styles.agreementContainer}>
                <TouchableOpacity
                  style={styles.agreementCheckboxArea}
                  onPress={() => setAgree(!agree)}
                >
                  <View
                    style={[
                      styles.checkboxRound,
                      agree && styles.checkboxRoundChecked
                    ]}
                  >
                    {agree && <AntDesign name="check" size={10} color="#fff" />}
                  </View>
                </TouchableOpacity>
                <Text style={styles.agreementText}>
                  我已阅读并同意
                  <Text style={styles.linkText}>《用户协议》</Text>和
                  <Text style={styles.linkText}>《隐私授权》</Text>
                </Text>
              </View>
              <View style={styles.footer}>
                <Button
                  compact
                  mode="text"
                  onPress={() => navigation.goBack()}
                  contentStyle={styles.footerLinkContent}
                  labelStyle={styles.footerLinkLabel}
                  uppercase={false}
                >
                  已有账户？去登录
                </Button>
              </View>
            </View>
          </ScrollView>
        </AppKeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff1f2'
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  header: {
    alignItems: 'flex-end',
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#fecdd3'
  },
  inputFocused: {
    borderColor: THEME_PRIMARY,
    backgroundColor: '#fff',
    shadowColor: THEME_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2
  },
  codeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  getCodeBtn: {
    alignSelf: 'center'
  },
  getCodeButtonContent: {
    minHeight: 40,
    paddingHorizontal: 0
  },
  getCodeButtonLabel: {
    color: THEME_PRIMARY,
    fontSize: 14
  },
  getCodeButtonLabelDisabled: {
    color: '#999'
  },
  loginBtn: {
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: THEME_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  btnDisabled: {
    backgroundColor: THEME_PRIMARY_DISABLED
  },
  primaryButtonContent: {
    height: 50
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40
  },
  agreementCheckboxArea: {
    padding: 5
  },
  checkboxRound: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4
  },
  checkboxRoundChecked: {
    backgroundColor: THEME_PRIMARY,
    borderColor: THEME_PRIMARY
  },
  agreementText: {
    fontSize: 12,
    color: '#999'
  },
  linkText: {
    color: THEME_PRIMARY
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12
  },
  genderButton: {
    flex: 1,
    borderRadius: 25
  },
  genderButtonContent: {
    minHeight: 48
  },
  genderButtonLabel: {
    fontSize: 14,
    color: '#666'
  },
  genderButtonActive: {
    backgroundColor: THEME_PRIMARY
  },
  genderButtonActiveFemale: {
    backgroundColor: THEME_PRIMARY_DARK
  },
  genderTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20
  },
  footerLinkContent: {
    minHeight: 36
  },
  footerLinkLabel: {
    fontSize: 14,
    color: '#999'
  }
})
