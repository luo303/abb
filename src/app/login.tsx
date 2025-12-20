// src/app/login/login.js
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { setToken } from '../store/modules/userStore'
export default function LoginScreen() {
  const dispatch = useDispatch()
  const router = useRouter()
  const token = useSelector((state: any) => state.user.token)

  // 表单状态
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        // 如果已经在登录页且有token，直接去首页
        // 使用 replace 避免用户按返回键回到登录页
        router.replace('/(tabs)')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [token, router])

  // 登录处理函数
  const handleLogin = () => {
    // 简单的表单验证
    if (!username || !password) {
      Alert.alert('提示', '请输入用户名和密码')
      return
    }
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    // 更新 Redux Token
    dispatch(setToken(mockToken))
    router.replace('/')
  }

  // 跳转到注册页
  const handleGoToRegister = () => {
    router.push('/register')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>用户登录</Text>

      {/* 用户名输入框 */}
      <TextInput
        style={styles.input}
        placeholder="请输入用户名"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      {/* 密码输入框 */}
      <TextInput
        style={styles.input}
        placeholder="请输入密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {/* 登录按钮 */}
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.btnText}>登录</Text>
      </TouchableOpacity>

      {/* 注册入口 */}
      <TouchableOpacity onPress={handleGoToRegister}>
        <Text style={styles.registerText}>还没有账号？去注册</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    fontSize: 16
  },
  loginBtn: {
    height: 48,
    backgroundColor: '#1f99b0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  btnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff'
  },
  registerText: {
    fontSize: 14,
    color: '#1f99b0',
    textAlign: 'center'
  }
})
