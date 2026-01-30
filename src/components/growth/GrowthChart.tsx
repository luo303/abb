import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Card from '../common/Card'
import { NavigationProps } from '../../types/navigation'

export default function GrowthChart() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('GrowthCurve')}
    >
      <View style={styles.header}>
        <Text style={styles.title}>胎重曲线</Text>
      </View>
      <View style={styles.chartContainer}>
        <Image
          source={require('../../assets/ChartMock.png')}
          style={styles.chartImage}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 12
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
