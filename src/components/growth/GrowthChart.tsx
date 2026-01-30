import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
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
        <View style={styles.titleWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="trending-up-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.title}>成长曲线</Text>
        </View>
      </View>

      <LinearGradient
        colors={['#fff', '#f0f9ff']}
        style={styles.chartContainer}
      >
        <Image
          source={require('../../assets/ChartMock.png')}
          style={styles.chartImage}
          resizeMode="contain"
        />
      </LinearGradient>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24
  },
  header: {
    marginBottom: 16
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#4299e1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  chartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    overflow: 'hidden',
    padding: 10
  },
  chartImage: {
    width: '100%',
    height: '100%'
  }
})
