import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { PeeColor } from '../../../types/diaper'

interface PeeColorSelectorProps {
  selectedColor: PeeColor | undefined
  onSelectColor: (color: PeeColor) => void
}

export const PeeColorSelector: React.FC<PeeColorSelectorProps> = ({
  selectedColor,
  onSelectColor
}) => {
  const colors = [
    { value: PeeColor.MILKY_WHITE, label: '乳白色', color: '#FFF8DC' },
    { value: PeeColor.PINK, label: '淡粉色', color: '#FFC0CB' },
    { value: PeeColor.NORMAL, label: '正常', color: '#E6E6FA' },
    { value: PeeColor.YELLOW, label: '黄色', color: '#FFD700' },
    { value: PeeColor.RED, label: '红色', color: '#FF6347' },
    { value: PeeColor.DARK_TEA, label: '深茶色', color: '#8B4513' }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {colors.map(item => (
        <TouchableOpacity
          key={item.value}
          style={styles.colorButton}
          onPress={() => onSelectColor(item.value)}
        >
          <View
            style={[
              styles.colorCircle,
              { backgroundColor: item.color },
              selectedColor === item.value && styles.selectedColorCircle
            ]}
          >
            {selectedColor === item.value && (
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
