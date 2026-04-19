import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ChartLine, Pen, Flask, BookSimple } from '@zappicon/react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { NavigationProps } from '../../types/navigation'

const HomeNavGrid = React.memo(function HomeNavGrid() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <LinearGradient
      colors={['#fb7185', '#f43f5e', '#e11d48']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.navContainer}
    >
      <NavItem
        icon="ChartLine"
        label="成长曲线"
        color="#FF8A65"
        onPress={() => navigation.navigate('GrowthCurve')}
      />
      <NavItem
        icon="Pen"
        label="日常记录"
        color="#4FC3F7"
        onPress={() => navigation.navigate('DailyRecord')}
      />
      <NavItem
        icon="Flask"
        label="疫苗接种"
        color="#81C784"
        onPress={() => navigation.navigate('VaccineRecord')}
      />
      <NavItem
        icon="BookSimple"
        label="大事记"
        color="#F59E0B"
        onPress={() => navigation.navigate('AddMilestone')}
      />
    </LinearGradient>
  )
})

export default HomeNavGrid

const NavItem = ({ icon, label, color, onPress }: any) => {
  const renderIcon = () => {
    const iconProps = {
      size: 26,
      color: '#f43f5e',
      variant: 'regular' as const
    }
    switch (icon) {
      case 'ChartLine':
        return <ChartLine {...iconProps} />
      case 'Pen':
        return <Pen {...iconProps} />
      case 'Flask':
        return <Flask {...iconProps} />
      case 'BookSimple':
        return <BookSimple {...iconProps} />
      default:
        return null
    }
  }

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconCircle}>{renderIcon()}</View>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    paddingVertical: 16,
    marginHorizontal: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginTop: 2
  }
})
