import { clearToken } from '../../store/modules/userStore'
import { useDispatch } from 'react-redux'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
}

type NavigationProps = NavigationProp<RootStackParamList>

export default function Profile() {
  const dispatch = useDispatch()
  const navigation = useNavigation<NavigationProps>()
  const logout = () => {
    dispatch(clearToken())
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    })
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
