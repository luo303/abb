import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { DiaperType } from '../../../types/diaper'

interface DiaperTypeSelectorProps {
  selectedType: DiaperType
  onSelectType: (type: DiaperType) => void
}

export const DiaperTypeSelector: React.FC<DiaperTypeSelectorProps> = ({
  selectedType,
  onSelectType
}) => {
  const types = [
    { type: DiaperType.PEE, label: '嘘嘘', icon: 'water' },
    { type: DiaperType.POOP, label: '便便', icon: 'emoticon-poop' },
    { type: DiaperType.BOTH, label: '嘘嘘+便便', icon: 'opacity' },
    { type: DiaperType.DRY, label: '干爽', icon: 'shield-check-outline' }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {types.map(item => (
        <TouchableOpacity
          key={item.type}
          style={[
            styles.typeButton,
            selectedType === item.type && styles.selectedTypeButton
          ]}
          onPress={() => onSelectType(item.type)}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={24}
            color={selectedType === item.type ? '#fff' : '#f43f5e'}
            style={styles.typeIcon}
          />
          <Text
            style={[
              styles.typeLabel,
              selectedType === item.type && styles.selectedTypeLabel
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
  typeButton: {
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
  selectedTypeButton: {
    backgroundColor: '#f43f5e',
    transform: [{ scale: 1.05 }]
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  typeLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500'
  },
  selectedTypeLabel: {
    color: '#fff'
  }
})
