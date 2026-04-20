import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { CheckCircle } from '@zappicon/react-native'
import { PeeColor, Option } from '../../../types/diaper'
import { APP_COLORS } from '../../../theme/paperTheme'

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
      color: '#FFF8DC',
      hint: '偏淡'
    },
    {
      value: { id: PeeColor.PINK, name: '粉色' },
      label: '粉色',
      color: '#FFC0CB',
      hint: '轻粉色'
    },
    {
      value: { id: PeeColor.NORMAL, name: '正常' },
      label: '正常',
      color: '#E6E6FA',
      hint: '常见'
    },
    {
      value: { id: PeeColor.YELLOW, name: '黄色' },
      label: '黄色',
      color: '#FFD700',
      hint: '偏黄'
    },
    {
      value: { id: PeeColor.RED, name: '红色' },
      label: '红色',
      color: '#FF6347',
      hint: '关注'
    },
    {
      value: { id: PeeColor.DARK_TEA, name: '浓茶色' },
      label: '浓茶色',
      color: '#8B4513',
      hint: '偏深'
    }
  ]

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {colors.map(item => {
        const selected = selectedColor?.id === item.value.id
        const isAlert = item.value.id === PeeColor.RED
        return (
          <TouchableOpacity
            key={item.value.id}
            style={[
              styles.colorCard,
              selected && styles.colorCardSelected,
              isAlert && styles.colorCardAlert
            ]}
            onPress={() => onSelectColor(item.value)}
            activeOpacity={0.86}
          >
            <View style={styles.colorTopRow}>
              {selected ? (
                <CheckCircle
                  size={17}
                  color={APP_COLORS.primary}
                  variant="filled"
                />
              ) : null}
            </View>
            <View
              style={[styles.colorSwatch, { backgroundColor: item.color }]}
            />
            <Text style={styles.colorLabel}>{item.label}</Text>
            <Text style={[styles.colorHint, isAlert && styles.colorHintAlert]}>
              {item.hint}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    gap: 10
  },
  colorCard: {
    width: 100,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: APP_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant
  },
  colorCardSelected: {
    borderColor: APP_COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: APP_COLORS.surfaceSoft
  },
  colorCardAlert: {
    borderColor: '#f8b4bf'
  },
  colorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 18
  },
  colorSwatch: {
    marginTop: 8,
    width: '100%',
    height: 16,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)'
  },
  colorLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.text
  },
  colorHint: {
    marginTop: 4,
    fontSize: 11,
    color: APP_COLORS.textMuted
  },
  colorHintAlert: {
    color: '#b45366'
  }
})
