import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native'
import { PoopColor, Option } from '../../../types/diaper'

interface PoopColorSelectorProps {
  selectedColor: Option | undefined
  onSelectColor: (color: Option) => void
}

export const PoopColorSelector: React.FC<PoopColorSelectorProps> = ({
  selectedColor,
  onSelectColor
}) => {
  const colors = [
    {
      value: { id: PoopColor.DARK_GREEN, name: '墨绿色' },
      label: '墨绿色',
      color: '#2F4F4F'
    },
    {
      value: { id: PoopColor.GREEN, name: '绿色' },
      label: '绿色',
      color: '#32CD32'
    },
    {
      value: { id: PoopColor.YELLOW, name: '黄色' },
      label: '黄色',
      color: '#FFD700'
    },
    {
      value: { id: PoopColor.BROWN, name: '棕色' },
      label: '棕色',
      color: '#8B4513'
    },
    {
      value: { id: PoopColor.RED, name: '红色' },
      label: '红色',
      color: '#FF6347'
    },
    {
      value: { id: PoopColor.BLACK, name: '黑色' },
      label: '黑色',
      color: '#000000'
    },
    {
      value: { id: PoopColor.GREY_WHITE, name: '灰白色' },
      label: '灰白色',
      color: '#D3D3D3'
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
