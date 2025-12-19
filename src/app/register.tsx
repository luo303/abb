import { View, Text, StyleSheet } from 'react-native'

export default function Register() {
  return (
    <View style={styles.container}>
      <Text>这是注册页</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
