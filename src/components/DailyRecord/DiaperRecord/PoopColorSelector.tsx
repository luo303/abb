import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { CheckCircle } from '@zappicon/react-native'
import { PoopColor, Option } from '../../../types/diaper'
import { APP_COLORS } from '../../../theme/paperTheme'

interface PoopColorSelectorProps {
  selectedColor: Option | undefined
  onSelectColor: (color: Option) => void
}

const COMMON_COLOR_IDS = [PoopColor.YELLOW, PoopColor.BROWN]

export const PoopColorSelector: React.FC<PoopColorSelectorProps> = ({
  selectedColor,
  onSelectColor
}) => {
  const colors = [
    {
      value: { id: PoopColor.DARK_GREEN, name: '墨绿色' },
      label: '墨绿色',
      color: '#2F4F4F',
      hint: '偏深绿'
    },
    {
      value: { id: PoopColor.GREEN, name: '绿色' },
      label: '绿色',
      color: '#32CD32',
      hint: '绿色调'
    },
    {
      value: { id: PoopColor.YELLOW, name: '黄色' },
      label: '黄色',
      color: '#FFD700',
      hint: '常见色'
    },
    {
      value: { id: PoopColor.BROWN, name: '棕色' },
      label: '棕色',
      color: '#8B4513',
      hint: '偏棕色'
    },
    {
      value: { id: PoopColor.RED, name: '红色' },
      label: '红色',
      color: '#FF6347',
      hint: '重点关注'
    },
    {
      value: { id: PoopColor.BLACK, name: '黑色' },
      label: '黑色',
      color: '#000000',
      hint: '重点关注'
    },
    {
      value: { id: PoopColor.GREY_WHITE, name: '灰白色' },
      label: '灰白色',
      color: '#D3D3D3',
      hint: '重点关注'
    }
  ]

  const isCommon = (id: string) => COMMON_COLOR_IDS.includes(id as PoopColor)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (selectedColor?.id && !isCommon(selectedColor.id)) {
      setExpanded(true)
    }
  }, [selectedColor?.id])

  const visibleColors = expanded
    ? colors
    : colors.filter(item => isCommon(item.value.id))

  return (
    <>
      <View style={styles.grid}>
        {visibleColors.map(item => {
          const selected = selectedColor?.id === item.value.id
          const isAlert =
            item.value.id === PoopColor.RED ||
            item.value.id === PoopColor.BLACK ||
            item.value.id === PoopColor.GREY_WHITE

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
              <View style={styles.colorCardTopRow}>
                <View
                  style={[styles.colorSwatch, { backgroundColor: item.color }]}
                />
                {selected ? (
                  <CheckCircle
                    size={18}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                ) : null}
              </View>
              <Text style={styles.colorLabel}>{item.label}</Text>
              <Text
                style={[styles.colorHint, isAlert && styles.colorHintAlert]}
              >
                {item.hint}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
      <TouchableOpacity
        activeOpacity={0.86}
        onPress={() => setExpanded(prev => !prev)}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleButtonText}>
          {expanded ? '收起常用项' : '展开更多颜色'}
        </Text>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10
  },
  colorCard: {
    width: '48%',
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
  colorCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  colorSwatch: {
    width: 34,
    height: 22,
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
  },
  toggleButton: {
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant,
    backgroundColor: APP_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: APP_COLORS.primary
  }
})
