import { View, Text, StyleSheet } from 'react-native'

export default function GrowthRecord() {
  return (
    <View style={styles.container}>
      <Text>这是成长记录页</Text>
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
