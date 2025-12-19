import { View, Text, StyleSheet } from 'react-native'

export default function AIAssistant() {
  return (
    <View style={styles.container}>
      <Text>这是AI助手页</Text>
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
