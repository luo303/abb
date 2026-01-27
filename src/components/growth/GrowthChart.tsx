import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

export default function GrowthChart() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>胎重曲线</Text>
      </View>
      <View style={styles.chartContainer}>
        <Image
          source={require('../../assets/ChartMock.png')}
          style={styles.chartImage}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0.05, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  chartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20
  }
})
