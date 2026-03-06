import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { PeeColor, Option } from '../../../types/diaper'

interface PeeColorSelectorProps {
  selectedColor: Option | undefined
  onSelectColor: (color: Option) => void
}

export const PeeColorSelector: React.FC<PeeColorSelectorProps> = ({
  selectedColor,
  onSelectColor
}) => {
  const colors = [
    {
      value: { id: PeeColor.MILKY_WHITE, name: '乳白色' },
      label: '乳白色',
      color: '#FFF8DC'
    },
    {
      value: { id: PeeColor.PINK, name: '粉色' },
      label: '粉色',
      color: '#FFC0CB'
    },
    {
      value: { id: PeeColor.NORMAL, name: '正常' },
      label: '正常',
      color: '#E6E6FA'
    },
    {
      value: { id: PeeColor.YELLOW, name: '黄色' },
      label: '黄色',
      color: '#FFD700'
    },
    {
      value: { id: PeeColor.RED, name: '红色' },
      label: '红色',
      color: '#FF6347'
    },
    {
      value: { id: PeeColor.DARK_TEA, name: '浓茶色' },
      label: '浓茶色',
      color: '#8B4513'
    }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {colors.map(item => (
        <TouchableOpacity
          key={item.value.id}
          style={styles.colorButton}
          onPress={() => onSelectColor(item.value)}
        >
          <View
            style={[
              styles.colorCircle,
              { backgroundColor: item.color },
              selectedColor?.id === item.value.id && styles.selectedColorCircle
            ]}
          >
            {selectedColor?.id === item.value.id && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.colorLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16
  },
  colorButton: {
    alignItems: 'center'
  },
  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedColorCircle: {
    borderColor: '#f43f5e',
    borderWidth: 3
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f43f5e',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  colorLabel: {
    fontSize: 12,
    color: '#666'
  }
})
