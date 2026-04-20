import React from 'react'
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import {
  Droplet,
  CheckCircle,
  WavePulse,
  PlusCircle
} from '@zappicon/react-native'
import { DiaperType, Option } from '../../../types/diaper'
import { APP_COLORS } from '@/theme/paperTheme'

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
      IconComponent: Droplet
    },
    {
      type: { id: DiaperType.POOP, name: '便便' },
      label: '便便',
      IconComponent: WavePulse
    },
    {
      type: { id: DiaperType.BOTH, name: '嘘嘘+便便' },
      label: '嘘嘘+便便',
      IconComponent: PlusCircle
    },
    {
      type: { id: DiaperType.DRY, name: '干爽' },
      label: '干爽',
      IconComponent: CheckCircle
    }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {types.map(item => {
        const isSelected = selectedType.id === item.type.id
        return (
          <TouchableOpacity
            key={item.type.id}
            style={[styles.typeButton, isSelected && styles.selectedTypeButton]}
            onPress={() => onSelectType(item.type)}
          >
            <item.IconComponent
              size={24}
              color={isSelected ? APP_COLORS.white : APP_COLORS.primary}
              variant={isSelected ? 'filled' : 'regular'}
              style={styles.typeIcon}
            />
            <Text
              style={[styles.typeLabel, isSelected && styles.selectedTypeLabel]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )
      })}
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
    backgroundColor: APP_COLORS.surface,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: APP_COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1
  },
  selectedTypeButton: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
    transform: [{ scale: 1.05 }]
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  typeLabel: {
    fontSize: 12,
    color: APP_COLORS.text,
    fontWeight: '500'
  },
  selectedTypeLabel: {
    color: APP_COLORS.white
  }
})
