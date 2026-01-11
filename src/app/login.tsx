import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { AntDesign } from '@expo/vector-icons'
import { setToken, setRememberMe } from '../store/modules/userStore'
import { apiLogin, apiLoginCode } from '../api/auth'
import { resLogin, resLoginCode } from '../api/type'

export default function LoginScreen() {
  const dispatch = useDispatch()
  const router = useRouter()
  const token = useSelector((state: any) => state.user.token)
  const rememberMe = useSelector((state: any) => state.user.rememberMe)
  const [activeTab, setActiveTab] = useState('account')

  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const [agree, setAgree] = useState(false)

  // 重定向到首页
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [token, router])

  // 登录逻辑
  const handleLogin = async () => {
    if (!agree) {
      Alert.alert('提示', '请先阅读并同意用户协议和隐私授权')
      return
    }

    if (activeTab === 'account') {
      if (!account || !password) {
        Alert.alert('提示', '请输入账号和密码')
        return
      }
      try {
        const res: resLogin = await apiLogin({
          account,
          password,
          login_type: 'account'
        })
        if (res.code === 0) {
          dispatch(setToken(res.data!.token))
          router.replace('/')
        } else {
          Alert.alert('提示', res.message)
        }
      } catch (error) {
        Alert.alert('错误', '登录失败，请稍后重试')
        console.error('登录失败：', error)
      }
    } else {
      // 邮箱验证码登录逻辑
      if (!email || !code) {
        Alert.alert('提示', '请输入邮箱和验证码')
        return
      }
      try {
        const res: resLogin = await apiLogin({
          email,
          code,
          login_type: 'email'
        })
        if (res.code === 0) {
          dispatch(setToken(res.data!.token))
          router.replace('/')
        } else {
          Alert.alert('提示', res.message)
        }
      } catch (error) {
        Alert.alert('错误', '登录失败，请稍后重试')
        console.error('登录失败：', error)
      }
    }
  }
  //邮箱验证码
  const handleGetCode = async () => {
    if (!email) {
      Alert.alert('提示', '请输入邮箱')
      return
    }
    if (
      email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      Alert.alert('提示', '请输入有效邮箱')
      return
    }
    try {
      const res: resLoginCode = await apiLoginCode({
        email
      })
      if (res.code === 0) {
        Alert.alert('提示', '验证码发送成功')
      } else {
        Alert.alert('提示', res.message)
      }
    } catch (error) {
      Alert.alert('错误', '获取验证码失败，请稍后重试')
      console.error('获取验证码失败：', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/bg.png')}
        style={styles.backgroundImage}
      />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>稚慧云欢迎您</Text>
          <Text style={styles.subTitle}>宝宝等你很久了！</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabItem]}
            onPress={() => setActiveTab('account')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'account' && styles.activeTabText
              ]}
            >
              账号登录
            </Text>
            {activeTab === 'account' && <View style={styles.activeLine} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem]}
            onPress={() => setActiveTab('code')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'code' && styles.activeTabText
              ]}
            >
              邮箱登录
            </Text>
            {activeTab === 'code' && <View style={styles.activeLine} />}
          </TouchableOpacity>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          {activeTab === 'account' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>账号</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入账号"
                  value={account}
                  onChangeText={setAccount}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>密码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
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
                    {rememberMe && (
                      <AntDesign name="check" size={12} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.optionText}>记住我</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => Alert.alert('提示', '请联系管理员重置密码')}
                >
                  <Text style={styles.forgotText}>忘记密码</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>邮箱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入邮箱号"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>验证码</Text>
                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="请输入验证码"
                    value={code}
                    onChangeText={setCode}
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                  <TouchableOpacity
                    style={styles.getCodeBtn}
                    onPress={handleGetCode}
                  >
                    <Text style={styles.getCodeText}>获取验证码</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ height: 10 }} />
            </>
          )}

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>登录</Text>
          </TouchableOpacity>

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
        </View>

        {/* 底部注册链接 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerLinkText}>
              还没有账户？<Text style={styles.registerHighlight}>去注册</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  backgroundImage: {
    width: '100%',
    height: '110%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1
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
  tabItem: {
    marginRight: 30,
    paddingBottom: 5,
    position: 'relative'
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
    backgroundColor: '#1f99b0',
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
    justifyContent: 'center'
  },
  getCodeText: {
    color: '#1f99b0',
    fontSize: 14
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
    backgroundColor: '#1f99b0',
    borderColor: '#1f99b0'
  },
  optionText: {
    fontSize: 13,
    color: '#666'
  },
  forgotText: {
    fontSize: 13,
    color: '#666'
  },
  loginBtn: {
    height: 50,
    backgroundColor: '#1f99b0',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#1f99b0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  loginBtnText: {
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
    backgroundColor: '#1f99b0',
    borderColor: '#1f99b0'
  },
  agreementText: {
    fontSize: 12,
    color: '#999'
  },
  linkText: {
    color: '#1f99b0'
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 10
  },
  registerLink: {
    padding: 10
  },
  registerLinkText: {
    fontSize: 14,
    color: '#999'
  },
  registerHighlight: {
    color: '#1f99b0',
    fontWeight: 'bold'
  }
})
