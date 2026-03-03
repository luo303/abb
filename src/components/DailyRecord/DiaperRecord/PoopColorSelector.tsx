import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { PoopColor } from '../../../types/diaper'

interface PoopColorSelectorProps {
  selectedColor: PoopColor | undefined
  onSelectColor: (color: PoopColor) => void
}

export const PoopColorSelector: React.FC<PoopColorSelectorProps> = ({
  selectedColor,
  onSelectColor
}) => {
  const colors = [
    { value: PoopColor.DARK_GREEN, label: '深绿色', color: '#2F4F4F' },
    { value: PoopColor.GREEN, label: '绿色', color: '#32CD32' },
    { value: PoopColor.YELLOW, label: '黄色', color: '#FFD700' },
    { value: PoopColor.BROWN, label: '棕色', color: '#8B4513' },
    { value: PoopColor.RED, label: '红色', color: '#FF6347' },
    { value: PoopColor.BLACK, label: '黑色', color: '#000000' },
    { value: PoopColor.GREY_WHITE, label: '灰白色', color: '#D3D3D3' }
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
