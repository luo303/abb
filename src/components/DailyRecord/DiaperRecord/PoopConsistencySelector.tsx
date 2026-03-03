import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PoopConsistency } from '../../../types/diaper'

interface PoopConsistencySelectorProps {
  selectedConsistency: PoopConsistency | undefined
  onSelectConsistency: (consistency: PoopConsistency) => void
}

export const PoopConsistencySelector: React.FC<
  PoopConsistencySelectorProps
> = ({ selectedConsistency, onSelectConsistency }) => {
  const consistencies = [
    { value: PoopConsistency.NORMAL, label: '正常', icon: 'emoticon-poop' },
    { value: PoopConsistency.PASTE, label: '膏状', icon: 'wave' },
    { value: PoopConsistency.FOAM, label: '泡沫样', icon: 'chart-bubble' },
    {
      value: PoopConsistency.MILK_CLOT,
      label: '有奶瓣',
      icon: 'filter-variant'
    },
    {
      value: PoopConsistency.FOOD_RESIDUE,
      label: '有食物残渣',
      icon: 'food'
    },
    { value: PoopConsistency.EGG_LIKE, label: '蛋花样', icon: 'flare' },
    { value: PoopConsistency.WATERY, label: '水样便', icon: 'water' },
    {
      value: PoopConsistency.SHEEP_DUNG,
      label: '羊屎便',
      icon: 'dots-grid'
    },
    { value: PoopConsistency.BLOODY, label: '含血便', icon: 'invert-colors' }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {consistencies.map(item => (
        <TouchableOpacity
          key={item.value}
          style={[
            styles.consistencyButton,
            selectedConsistency === item.value &&
              styles.selectedConsistencyButton
          ]}
          onPress={() => onSelectConsistency(item.value)}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={24}
            color={selectedConsistency === item.value ? '#fff' : '#f43f5e'}
            style={styles.consistencyIcon}
          />
          <Text
            style={[
              styles.consistencyLabel,
              selectedConsistency === item.value &&
                styles.selectedConsistencyLabel
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12
  },
  consistencyButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  selectedConsistencyButton: {
    backgroundColor: '#f43f5e',
    transform: [{ scale: 1.05 }]
  },
  consistencyIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  consistencyLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500'
  },
  selectedConsistencyLabel: {
    color: '#fff'
  }
})
