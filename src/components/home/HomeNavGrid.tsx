import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { NavigationProps } from '../../types/navigation'

export default function HomeNavGrid() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <View style={styles.navContainer}>
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
    </View>
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
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <IconComponent name={icon} size={26} color="#fff" />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10, // 减少水平内边距
    marginTop: 20,
    marginBottom: 10,
    // 移除背景色和阴影，消除“块状感”
    backgroundColor: 'transparent',
    marginHorizontal: 10
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
    // 移除阴影，完全扁平化
  },
  navLabel: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500'
  }
})
