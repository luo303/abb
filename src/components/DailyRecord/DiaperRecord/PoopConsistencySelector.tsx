import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PoopConsistency, Option } from '../../../types/diaper'

interface PoopConsistencySelectorProps {
  selectedConsistency: Option | undefined
  onSelectConsistency: (consistency: Option) => void
}

export const PoopConsistencySelector: React.FC<
  PoopConsistencySelectorProps
> = ({ selectedConsistency, onSelectConsistency }) => {
  const consistencies = [
    {
      value: { id: PoopConsistency.NORMAL, name: '正常' },
      label: '正常',
      icon: 'emoticon-poop'
    },
    {
      value: { id: PoopConsistency.PASTE, name: '膏状' },
      label: '膏状',
      icon: 'wave'
    },
    {
      value: { id: PoopConsistency.FOAM, name: '泡沫样' },
      label: '泡沫样',
      icon: 'chart-bubble'
    },
    {
      value: { id: PoopConsistency.MILK_CLOT, name: '有奶瓣' },
      label: '有奶瓣',
      icon: 'filter-variant'
    },
    {
      value: { id: PoopConsistency.FOOD_RESIDUE, name: '有食物残渣' },
      label: '有食物残渣',
      icon: 'food'
    },
    {
      value: { id: PoopConsistency.EGG_LIKE, name: '蛋花样' },
      label: '蛋花样',
      icon: 'flare'
    },
    {
      value: { id: PoopConsistency.WATERY, name: '水样便' },
      label: '水样便',
      icon: 'water'
    },
    {
      value: { id: PoopConsistency.SHEEP_DUNG, name: '羊屎便' },
      label: '羊屎便',
      icon: 'dots-grid'
    },
    {
      value: { id: PoopConsistency.BLOODY, name: '含血便' },
      label: '含血便',
      icon: 'invert-colors'
    }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {consistencies.map(item => (
        <TouchableOpacity
          key={item.value.id}
          style={[
            styles.consistencyButton,
            selectedConsistency?.id === item.value.id &&
              styles.selectedConsistencyButton
          ]}
          onPress={() => onSelectConsistency(item.value)}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={24}
            color={
              selectedConsistency?.id === item.value.id ? '#fff' : '#f43f5e'
            }
            style={styles.consistencyIcon}
          />
          <Text
            style={[
              styles.consistencyLabel,
              selectedConsistency?.id === item.value.id &&
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
