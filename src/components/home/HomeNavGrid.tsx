import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'

export default function HomeNavGrid() {
  return (
    <View style={styles.navContainer}>
      <NavItem
        icon="food-off"
        label="查忌口"
        library="MaterialCommunityIcons"
      />
      <NavItem
        icon="baby-face-outline"
        label="宝宝信息"
        library="MaterialCommunityIcons"
      />
      <NavItem
        icon="needle"
        label="疫苗记录"
        library="MaterialCommunityIcons"
      />
      <NavItem
        icon="book-open-page-variant"
        label="宝宝故事"
        library="MaterialCommunityIcons"
      />
    </View>
  )
}

const NavItem = ({ icon, label, library }: any) => {
  const IconComponent =
    library === 'MaterialIcons' ? MaterialIcons : MaterialCommunityIcons
  return (
    <TouchableOpacity style={styles.navItem}>
      <View style={styles.iconCircle}>
        <IconComponent name={icon} size={28} color="#fff" />
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
    marginVertical: 20,
    backgroundColor: '#1f99b0', // 浅蓝绿色背景条
    borderRadius: 10,
    paddingVertical: 15,
    marginHorizontal: 15
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0
  },
  navLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5
  }
})
