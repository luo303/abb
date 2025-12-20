// src/app/login/register.js
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'

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

    // 用户名验证
    if (!username) {
      Alert.alert('提示', '请输入用户名')
      return false
    }
    if (username.length < 3 || username.length > 20) {
      Alert.alert('提示', '用户名长度需在3-20个字符之间')
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

    // 确认密码验证
    if (password !== account) {
      Alert.alert('提示', '两次输入的密码不一致')
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
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 注册成功提示
      Alert.alert('成功', '注册成功！请登录', [
        {
          text: '去登录',
          onPress: () => {
            // 关闭注册模态，返回登录页
            router.dismiss()
          }
        }
      ])

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
      <Text style={styles.title}>用户注册</Text>

      {/* 账号输入框 */}
      <TextInput
        style={styles.input}
        placeholder="请输入账号(可用于后续登录)"
        value={formData.account}
        onChangeText={value => handleInputChange('account', value)}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />
      {/* 用户名输入框 */}
      <TextInput
        style={styles.input}
        placeholder="请输入用户名（3-20位）"
        value={formData.username}
        onChangeText={value => handleInputChange('username', value)}
        autoCapitalize="none"
        editable={!isLoading}
      />
      {/* 密码输入框 */}
      <TextInput
        style={styles.input}
        placeholder="请输入密码（至少6位）"
        value={formData.password}
        onChangeText={value => handleInputChange('password', value)}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />
      {/* 邮箱输入框（可选） */}
      <TextInput
        style={styles.input}
        placeholder="请输入邮箱"
        value={formData.email}
        onChangeText={value => handleInputChange('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      {/* 验证码输入框 */}
      <View style={styles.verifyRow}>
        <TextInput
          style={[styles.input, styles.verifyInput]}
          placeholder="请输入验证码"
          value={formData.code}
          onChangeText={value => handleInputChange('code', value)}
          keyboardType="number-pad"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.verifyBtn, isLoading && styles.btnDisabled]}
          onPress={() => Alert.alert('提示', '验证码已发送')}
          disabled={isLoading}
        >
          <Text style={styles.verifyBtnText}>获取验证码</Text>
        </TouchableOpacity>
      </View>
      {/* 注册按钮 */}
      <TouchableOpacity
        style={[styles.registerBtn, isLoading && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        <Text style={styles.btnText}>{isLoading ? '注册中...' : '注册'}</Text>
      </TouchableOpacity>

      {/* 返回登录入口 */}
      <TouchableOpacity
        onPress={() => router.dismiss()}
        style={styles.backToLogin}
      >
        <Text style={styles.backToLoginText}>已有账号？去登录</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2A2929',
    textAlign: 'center',
    marginBottom: 32
  },
  input: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5'
  },
  registerBtn: {
    height: 48,
    backgroundColor: '#1f99b0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  btnDisabled: {
    backgroundColor: '#99d6e5' // 禁用状态颜色
  },
  btnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff'
  },
  backToLogin: {
    marginTop: 16
  },
  backToLoginText: {
    fontSize: 14,
    color: '#1f99b0',
    textAlign: 'center'
  },
  verifyRow: {
    flexDirection: 'row'
  },
  verifyInput: {
    flex: 1,
    marginRight: 8
  },
  verifyBtn: {
    height: 48,
    width: 90,
    backgroundColor: '#1f99b0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  verifyBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff'
  }
})
