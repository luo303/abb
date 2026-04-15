import React from 'react'
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { DiaperType, Option } from '../../../types/diaper'

interface DiaperTypeSelectorProps {
  selectedType: Option
  onSelectType: (type: Option) => void
}

export const DiaperTypeSelector: React.FC<DiaperTypeSelectorProps> = ({
  selectedType,
  onSelectType
}) => {
  const types = [
    {
      type: { id: DiaperType.PEE, name: '嘘嘘' },
      label: '嘘嘘',
      icon: 'water'
    },
    {
      type: { id: DiaperType.POOP, name: '便便' },
      label: '便便',
      icon: 'emoticon-poop'
    },
    {
      type: { id: DiaperType.BOTH, name: '嘘嘘+便便' },
      label: '嘘嘘+便便',
      icon: 'opacity'
    },
    {
      type: { id: DiaperType.DRY, name: '干爽' },
      label: '干爽',
      icon: 'shield-check-outline'
    }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {types.map(item => (
        <TouchableOpacity
          key={item.type.id}
          style={[
            styles.typeButton,
            selectedType.id === item.type.id && styles.selectedTypeButton
          ]}
          onPress={() => onSelectType(item.type)}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={24}
            color={selectedType.id === item.type.id ? '#fff' : '#f43f5e'}
            style={styles.typeIcon}
          />
          <Text
            style={[
              styles.typeLabel,
              selectedType.id === item.type.id && styles.selectedTypeLabel
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
