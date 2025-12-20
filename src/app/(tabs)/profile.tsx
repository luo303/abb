import { useRouter } from 'expo-router'
import { clearToken } from '../../store/modules/userStore'
import { useDispatch } from 'react-redux'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default function Profile() {
  const router = useRouter()
  const dispatch = useDispatch()
  const logout = () => {
    dispatch(clearToken())
    router.dismissTo('/login')
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card} onPress={() => logout()}>
        <Text>退出登录</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  }
})
