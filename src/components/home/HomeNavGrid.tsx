import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { NavigationProps } from '../../types/navigation'

export default function HomeNavGrid() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <LinearGradient
      colors={['#22d3ee', '#0ea5e9', '#3b82f6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.navContainer}
    >
      <NavItem
        icon="food-off"
        label="查忌口"
        library="MaterialCommunityIcons"
        color="#FF8A65" // 暖橙色
        onPress={() => navigation.navigate('Taboo')}
      />
      <NavItem
        icon="pencil"
        label="日常记录"
        library="MaterialCommunityIcons"
        color="#4FC3F7" // 浅蓝色
        onPress={() => navigation.navigate('DailyRecord')}
      />
      <NavItem
        icon="needle"
        label="疫苗记录"
        library="MaterialCommunityIcons"
        color="#81C784" // 浅绿色
        onPress={() => navigation.navigate('VaccineRecord')}
      />
      <NavItem
        icon="book-open-page-variant"
        label="宝宝故事"
        library="MaterialCommunityIcons"
        color="#BA68C8" // 浅紫色
        onPress={() => navigation.navigate('BabyStories')}
      />
    </LinearGradient>
  )
}

const NavItem = ({ icon, label, library, color, onPress }: any) => {
  const IconComponent =
    library === 'MaterialIcons' ? MaterialIcons : MaterialCommunityIcons
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconCircle}>
        <IconComponent name={icon} size={26} color="#0ea5e9" />
      </View>
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
    shadowColor: '#0ea5e9',
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
