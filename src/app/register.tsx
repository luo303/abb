import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { apiRegister } from '../api/auth'

export default function RegisterScreen() {
  const router = useRouter()

  // 表单状态
  const [formData, setFormData] = useState<{
    account: string
    email: string
    password: string
    username: string
    code: string
  }>({
    account: '',
    email: '',
    password: '',
    username: '',
    code: ''
  })

  // 加载状态
  const [isLoading, setIsLoading] = useState(false)
  const [agree, setAgree] = useState(false)

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
      Alert.alert('提示', '请先阅读并同意用户协议和隐私授权')
      return false
    }

    // 用户名验证
    if (!username) {
      Alert.alert('提示', '请输入用户名')
      return false
    }
    if (username.length < 3 || username.length > 20) {
      Alert.alert('提示', '用户名长度需在3-20个字符之间')
      return false
    }

    // 账号验证
    if (!account) {
      Alert.alert('提示', '请输入账号')
      return false
    }

    // 验证码验证
    if (!code) {
      Alert.alert('提示', '请输入验证码')
      return false
    }

    // 邮箱验证（简单正则）
    if (
      email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
    ) {
      Alert.alert('提示', '请输入有效的邮箱地址')
      return false
    }

    // 密码验证
    if (!password) {
      Alert.alert('提示', '请输入密码')
      return false
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码长度至少6位')
      return false
    }

    return true
  }

  // 注册处理函数
  const handleRegister = async () => {
    // 表单验证
    if (!validateForm()) return

    // 设置加载状态
    setIsLoading(true)

    try {
      // 模拟注册请求（实际项目中替换为真实接口）
      const res = await apiRegister(formData)
      if (res.code === 0) {
        // 注册成功提示
        Alert.alert('成功', '注册成功！请登录', [
          {
            text: '去登录',
            onPress: () => {
              // 关闭注册模态，返回登录页
              if (router.canGoBack()) {
                router.back()
              } else {
                router.replace('/login')
              }
            }
          }
        ])
      } else {
        Alert.alert('错误', res.message || '注册失败')
        return
      }

      // 重置表单
      setFormData({
        username: '',
        email: '',
        password: '',
        account: '',
        code: ''
      })
    } catch (error) {
      Alert.alert('错误', '注册失败，请稍后重试')
      console.error('注册失败：', error)
    } finally {
      // 取消加载状态
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>欢迎注册</Text>
              <Text style={styles.subTitle}>开启您的宝宝成长记录之旅！</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>用户名</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入用户名（3-20位）"
                  value={formData.username}
                  onChangeText={value => handleInputChange('username', value)}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>账号</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入账号(可用于后续登录)"
                  value={formData.account}
                  onChangeText={value => handleInputChange('account', value)}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>密码</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码（至少6位）"
                  value={formData.password}
                  onChangeText={value => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>邮箱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入邮箱"
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
                    value={formData.code}
                    onChangeText={value => handleInputChange('code', value)}
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.getCodeBtn}
                    onPress={() => Alert.alert('提示', '验证码已发送')}
                    disabled={isLoading}
                  >
                    <Text style={styles.getCodeText}>获取验证码</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 20 }} />

              {/* 注册按钮 */}
              <TouchableOpacity
                style={[styles.loginBtn, isLoading && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.loginBtnText}>
                  {isLoading ? '注册中...' : '注册'}
                </Text>
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
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={() => {
                    if (router.canGoBack()) {
                      router.back()
                    } else {
                      router.replace('/login')
                    }
                  }}
                >
                  <Text style={styles.registerLinkText}>
                    已有账户？
                    <Text style={styles.registerHighlight}>去登录</Text>
                  </Text>
                </TouchableOpacity>
              </View>
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
    height: '110%',
    position: 'absolute',
    top: 0,
    left: 0
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
  btnDisabled: {
    backgroundColor: '#99d6e5'
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
    paddingBottom: 20
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
