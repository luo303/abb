import React from 'react'
import { View, StyleSheet } from 'react-native'

const SleepDecorations: React.FC = () => {
  return (
    <View style={styles.footer}>
      <View style={styles.divider} />
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(244,63,94,0.3)',
    width: '100%'
  }
})

export default SleepDecorations
