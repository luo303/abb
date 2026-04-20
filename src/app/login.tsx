import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { Button } from 'react-native-paper'
import AuthBackground from '../components/common/AuthBackground'

import { useEffect, useState } from 'react'
import { setToken, setRememberMe } from '../store/modules/userStore'
import { apiLogin, apiLoginCode } from '../api/auth'
import { resLogin, resLoginCode } from '../api/type'

import { useMessage } from '../components/Message'

import { NavigationProps } from '../types/navigation'

const THEME_PRIMARY = '#f43f5e'
const THEME_PRIMARY_DISABLED = '#fda4af'

type FocusedField = 'account' | 'password' | 'email' | 'code' | null

export default function LoginScreen() {
  const dispatch = useDispatch()
  const navigation = useNavigation<NavigationProps>()
  const token = useSelector((state: any) => state.user.token)
  const rememberMe = useSelector((state: any) => state.user.rememberMe)
  const [activeTab, setActiveTab] = useState('account')

  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [focusedField, setFocusedField] = useState<FocusedField>(null)

  const [agree, setAgree] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { showMessage } = useMessage()
  const [countdown, setCountdown] = useState(0)
  const [isCodeLoading, setIsCodeLoading] = useState(false)

  // 重定向到首页
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Tabs' }]
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [token, navigation])

  // 登录逻辑
  const handleLogin = async () => {
    if (!agree) {
      showMessage('请先同意用户协议')
      return
    }

    if (isLoading) return

    if (activeTab === 'account') {
      if (!account || !password) {
        showMessage('请输入账号和密码')
        return
      }
      setIsLoading(true)
      try {
        const res: resLogin = await apiLogin({
          account,
          password,
          login_type: 'account'
        })
        if (res.code === 0) {
          dispatch(setToken(res.data!.token))
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs' }]
          })
        } else {
          showMessage(res.message)
        }
      } catch (error) {
        showMessage('登录失败，请稍后重试')
        console.error('登录失败：', error)
      } finally {
        setIsLoading(false)
      }
    } else {
      // 邮箱验证码登录逻辑
      if (!email || !code) {
        showMessage('请输入邮箱和验证码')
        return
      }
      setIsLoading(true)
      try {
        const res: resLogin = await apiLogin({
          email,
          code,
          login_type: 'email'
        })
        if (res.code === 0) {
          dispatch(setToken(res.data!.token))
          navigation.reset({
            index: 0,
            routes: [{ name: 'Tabs' }]
          })
        } else {
          showMessage(res.message)
        }
      } catch (error) {
        showMessage('登录失败，请稍后重试')
        console.error('登录失败：', error)
      } finally {
        setIsLoading(false)
      }
    }
  }
  //邮箱验证码
  const handleGetCode = async () => {
    if (isCodeLoading) return
    if (!email) {
      showMessage('请输入邮箱')
      return
    }
    if (
      email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      showMessage('请输入有效邮箱')
      return
    }
    if (countdown > 0) return
    try {
      setIsCodeLoading(true)
      const res: resLoginCode = await apiLoginCode({
        email
      })
      if (res.code === 0) {
        showMessage('验证码发送成功')
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
      console.error('获取验证码失败：', error)
    } finally {
      setIsCodeLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <AuthBackground />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>稚慧灵欢迎您</Text>
          <Text style={styles.subTitle}>宝宝等你很久了！</Text>
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabButtonWrap}>
            <Button
              compact
              mode="text"
              onPress={() => setActiveTab('account')}
              style={styles.tabButton}
              contentStyle={styles.tabButtonContent}
              labelStyle={[
                styles.tabText,
                activeTab === 'account' && styles.activeTabText
              ]}
              rippleColor="rgba(244, 63, 94, 0.12)"
              uppercase={false}
            >
              账号登录
            </Button>
            {activeTab === 'account' && <View style={styles.activeLine} />}
          </View>
          <View style={styles.tabButtonWrap}>
            <Button
              compact
              mode="text"
              onPress={() => setActiveTab('code')}
              style={styles.tabButton}
              contentStyle={styles.tabButtonContent}
              labelStyle={[
                styles.tabText,
                activeTab === 'code' && styles.activeTabText
              ]}
              rippleColor="rgba(244, 63, 94, 0.12)"
              uppercase={false}
            >
              邮箱登录
            </Button>
            {activeTab === 'code' && <View style={styles.activeLine} />}
          </View>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          {activeTab === 'account' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>账号</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'account' && styles.inputFocused
                  ]}
                  placeholder="请输入账号"
                  value={account}
                  onChangeText={setAccount}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
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
                  placeholder="请输入密码"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                  selectionColor={THEME_PRIMARY}
                  cursorColor={THEME_PRIMARY}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => dispatch(setRememberMe(!rememberMe))}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked
                    ]}
                  >
                    {rememberMe && <View style={styles.checkMark} />}
                  </View>
                  <Text style={styles.optionText}>记住我</Text>
                </TouchableOpacity>
                <Button
                  compact
                  mode="text"
                  onPress={() => navigation.navigate('Password')}
                  contentStyle={styles.inlineTextButtonContent}
                  labelStyle={styles.forgotText}
                  uppercase={false}
                >
                  忘记密码
                </Button>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>邮箱</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedField === 'email' && styles.inputFocused
                  ]}
                  placeholder="请输入邮箱号"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                    value={code}
                    onChangeText={setCode}
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
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
                    onPress={handleGetCode}
                    disabled={countdown > 0 || isCodeLoading}
                    loading={isCodeLoading}
                    uppercase={false}
                  >
                    {countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码'}
                  </Button>
                </View>
              </View>
              <View style={{ height: 10 }} />
            </>
          )}

          <Button
            mode="contained"
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled
            ]}
            contentStyle={styles.loginButtonContent}
            labelStyle={styles.loginButtonLabel}
            onPress={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            buttonColor={THEME_PRIMARY}
            uppercase={false}
          >
            登录
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
                {agree && <View style={styles.checkMarkRound} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              我已阅读并同意
              <Text style={styles.linkText}>《用户协议》</Text>和
              <Text style={styles.linkText}>《隐私授权》</Text>
            </Text>
          </View>
        </View>

        {/* 底部注册链接 */}
        <View style={styles.footer}>
          <Button
            compact
            mode="text"
            onPress={() => navigation.navigate('Register')}
            contentStyle={styles.footerLinkContent}
            labelStyle={styles.footerLinkLabel}
            uppercase={false}
          >
            还没有账户？去注册
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff1f2'
  },
  scrollView: {
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30
  },
  tabButtonWrap: {
    marginRight: 30,
    position: 'relative'
  },
  tabButton: {
    borderRadius: 20
  },
  tabButtonContent: {
    minHeight: 32,
    paddingHorizontal: 0
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500'
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18
  },
  activeLine: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 3,
    backgroundColor: THEME_PRIMARY,
    borderRadius: 2
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  checkboxChecked: {
    backgroundColor: THEME_PRIMARY,
    borderColor: THEME_PRIMARY
  },
  checkMark: {
    width: 8,
    height: 4,
    backgroundColor: 'transparent',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderLeftColor: '#fff',
    borderBottomColor: '#fff',
    transform: [{ rotate: '-45deg' }]
  },
  checkMarkRound: {
    width: 6,
    height: 3,
    backgroundColor: 'transparent',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderLeftColor: '#fff',
    borderBottomColor: '#fff',
    transform: [{ rotate: '-45deg' }]
  },
  optionText: {
    fontSize: 13,
    color: '#666'
  },
  forgotText: {
    fontSize: 13,
    color: THEME_PRIMARY
  },
  inlineTextButtonContent: {
    minHeight: 32,
    paddingHorizontal: 0
  },
  loginButton: {
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: THEME_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  loginButtonDisabled: {
    backgroundColor: THEME_PRIMARY_DISABLED
  },
  loginButtonContent: {
    height: 50
  },
  loginButtonLabel: {
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
  footer: {
    alignItems: 'center',
    paddingBottom: 10
  },
  footerLinkContent: {
    minHeight: 36
  },
  footerLinkLabel: {
    fontSize: 14,
    color: '#999'
  }
})
