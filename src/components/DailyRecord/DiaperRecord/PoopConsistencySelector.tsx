import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  ArrowsRotate,
  BookSimple,
  CalendarDay,
  ChartLine,
  CheckCircle,
  Droplet,
  Flask,
  FoodTray,
  SparklesAi,
  WavePulse
} from '@zappicon/react-native'
import { PoopConsistency, Option } from '../../../types/diaper'
import { APP_COLORS } from '../../../theme/paperTheme'

interface PoopConsistencySelectorProps {
  selectedConsistency: Option | undefined
  onSelectConsistency: (consistency: Option) => void
}

const COMMON_CONSISTENCY_IDS = [PoopConsistency.PASTE, PoopConsistency.WATERY]

export const PoopConsistencySelector: React.FC<
  PoopConsistencySelectorProps
> = ({ selectedConsistency, onSelectConsistency }) => {
  const consistencies = [
    {
      value: { id: PoopConsistency.PASTE, name: '膏状' },
      label: '膏状',
      hint: '偏稠'
    },
    {
      value: { id: PoopConsistency.FOAM, name: '泡沫样' },
      label: '泡沫样',
      hint: '有泡沫'
    },
    {
      value: { id: PoopConsistency.MILK_CLOT, name: '有奶瓣' },
      label: '有奶瓣',
      hint: '可见颗粒'
    },
    {
      value: { id: PoopConsistency.FOOD_RESIDUE, name: '有食物残渣' },
      label: '有食物残渣',
      hint: '残渣明显'
    },
    {
      value: { id: PoopConsistency.EGG_LIKE, name: '蛋花样' },
      label: '蛋花样',
      hint: '絮状'
    },
    {
      value: { id: PoopConsistency.WATERY, name: '水样便' },
      label: '水样便',
      hint: '偏稀'
    },
    {
      value: { id: PoopConsistency.SHEEP, name: '羊屎便' },
      label: '羊屎便',
      hint: '颗粒状'
    },
    {
      value: { id: PoopConsistency.BLOODY, name: '含血便' },
      label: '含血便',
      hint: '重点关注'
    }
  ]

  const isCommon = (id: string) =>
    COMMON_CONSISTENCY_IDS.includes(id as PoopConsistency)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (selectedConsistency?.id && !isCommon(selectedConsistency.id)) {
      setExpanded(true)
    }
  }, [selectedConsistency?.id])

  const visibleConsistencies = expanded
    ? consistencies
    : consistencies.filter(item => isCommon(item.value.id))

  const renderItemIcon = (id: string, selected: boolean) => {
    const color = selected ? APP_COLORS.primary : APP_COLORS.iconMuted
    switch (id) {
      case PoopConsistency.PASTE:
        return <WavePulse size={17} color={color} variant="filled" />
      case PoopConsistency.FOAM:
        return <SparklesAi size={17} color={color} variant="filled" />
      case PoopConsistency.MILK_CLOT:
        return <Flask size={17} color={color} variant="filled" />
      case PoopConsistency.FOOD_RESIDUE:
        return <FoodTray size={17} color={color} variant="filled" />
      case PoopConsistency.EGG_LIKE:
        return <CalendarDay size={17} color={color} variant="filled" />
      case PoopConsistency.WATERY:
        return <Droplet size={17} color={color} variant="filled" />
      case PoopConsistency.SHEEP:
        return <BookSimple size={17} color={color} variant="filled" />
      case PoopConsistency.BLOODY:
        return <ChartLine size={17} color={color} variant="filled" />
      default:
        return <ArrowsRotate size={17} color={color} variant="filled" />
    }
  }

  return (
    <>
      <View style={styles.grid}>
        {visibleConsistencies.map(item => {
          const selected = selectedConsistency?.id === item.value.id
          const isAlert = item.value.id === PoopConsistency.BLOODY

          return (
            <TouchableOpacity
              key={item.value.id}
              style={[
                styles.card,
                selected && styles.cardSelected,
                isAlert && styles.cardAlert
              ]}
              onPress={() => onSelectConsistency(item.value)}
              activeOpacity={0.86}
            >
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconWrap,
                    selected && styles.iconWrapSelected,
                    isAlert && styles.iconWrapAlert
                  ]}
                >
                  {renderItemIcon(item.value.id, selected)}
                </View>
                {selected ? (
                  <CheckCircle
                    size={18}
                    color={APP_COLORS.primary}
                    variant="filled"
                  />
                ) : null}
              </View>
              <Text numberOfLines={1} style={styles.label}>
                {item.label}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.hint, isAlert && styles.hintAlert]}
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
          {expanded ? '收起常用项' : '展开更多性状'}
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
  card: {
    width: '48%',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: APP_COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: APP_COLORS.outlineVariant
  },
  cardSelected: {
    borderColor: APP_COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: APP_COLORS.surfaceSoft
  },
  cardAlert: {
    borderColor: '#f8b4bf'
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.surfaceVariant
  },
  iconWrapSelected: {
    backgroundColor: '#ffe3ea'
  },
  iconWrapAlert: {
    backgroundColor: '#feecef'
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.text
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    color: APP_COLORS.textMuted
  },
  hintAlert: {
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
