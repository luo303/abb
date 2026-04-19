import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { APP_COLORS } from '@/theme/paperTheme'

interface SearchChipProps {
  label: string
  onPress: () => void
  onRemove?: () => void
  iconName?: keyof typeof Ionicons.glyphMap
  highlighted?: boolean
}

export default function SearchChip({
  label,
  onPress,
  onRemove,
  iconName = 'search-outline',
  highlighted = false
}: SearchChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={styles.chip}
    >
      <Ionicons
        name={iconName}
        size={14}
        color={highlighted ? APP_COLORS.primaryStrong : APP_COLORS.textMuted}
      />
      <Text
        numberOfLines={1}
        style={[styles.label, highlighted && styles.highlightedLabel]}
      >
        {label}
      </Text>
      {onRemove ? (
        <TouchableOpacity
          activeOpacity={0.75}
          hitSlop={8}
          onPress={onRemove}
          style={styles.removeButton}
        >
          <Ionicons name="close" size={14} color={APP_COLORS.textMuted} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chip: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 12,
    minHeight: 32,
    marginRight: 8,
    marginBottom: 8
  },
  label: {
    marginLeft: 6,
    fontSize: 14,
    color: APP_COLORS.text
  },
  highlightedLabel: {
    color: APP_COLORS.primaryStrong,
    fontWeight: '600'
  },
  removeButton: {
    marginLeft: 4,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
