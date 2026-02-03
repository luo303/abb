import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface ActionItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  label: string
  color: string
  onPress?: () => void
}

export default function ActionMenu({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#ffffff', '#fff1f2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.grid}>
          <ActionItem icon="clock-outline" label="浏览历史" color="#f43f5e" />
          <ActionItem icon="heart-outline" label="收藏" color="#ec4899" />
          <ActionItem
            icon="comment-text-outline"
            label="我的帖子"
            color="#f97316"
          />
          <ActionItem
            icon="cog-outline"
            label="设置"
            color="#94a3b8"
            onPress={onLogout}
          />
        </View>
      </LinearGradient>
    </View>
  )
}

const ActionItem = ({ icon, label, color, onPress }: ActionItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={26} color={color} />
    </View>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#a0aec0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderRadius: 20
  },
  container: {
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff'
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontSize: 13,
    color: '#4a5568',
    fontWeight: '500'
  }
})
