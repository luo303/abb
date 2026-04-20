import React from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform
} from 'react-native'
import { Search, Xmark, AngleRightSmall } from '@zappicon/react-native'
import { APP_COLORS } from '@/theme/paperTheme'

interface SearchHeaderProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit: () => void
  onFocus: () => void
  onBlur: () => void
  onClear: () => void
  onCancel: () => void
}

export default function SearchHeader({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  onBlur,
  onClear,
  onCancel
}: SearchHeaderProps) {
  const hasText = Boolean(value.trim())

  return (
    <View style={styles.header}>
      <View style={styles.searchBox}>
        <Search
          size={18}
          color={APP_COLORS.iconMuted}
          variant="regular"
          style={styles.leadingIcon}
        />
        <TextInput
          autoFocus
          onBlur={onBlur}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onSubmitEditing={onSubmit}
          placeholder="搜索您感兴趣的内容..."
          placeholderTextColor={APP_COLORS.textMuted}
          returnKeyType="search"
          style={styles.input}
          value={value}
        />
        {hasText ? (
          <TouchableOpacity
            activeOpacity={0.8}
            hitSlop={8}
            onPress={onClear}
            style={styles.clearButton}
          >
            <Xmark size={18} color={APP_COLORS.textMuted} variant="regular" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.82}
          hitSlop={8}
          onPress={onSubmit}
          style={styles.submitIconButton}
        >
          <AngleRightSmall
            size={17}
            color={APP_COLORS.white}
            variant="regular"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onCancel}
        style={styles.cancelBtn}
      >
        <Text style={styles.cancelText}>取消</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    zIndex: 1
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.outline,
    backgroundColor: APP_COLORS.surface,
    paddingLeft: 12,
    paddingRight: 6,
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.06 : 0.12,
    shadowRadius: 8,
    elevation: 2
  },
  leadingIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: APP_COLORS.text,
    paddingVertical: 0
  },
  clearButton: {
    width: 44,
    height: 44,
    marginRight: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary
  },
  cancelBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontSize: 16,
    color: APP_COLORS.primaryStrong
  }
})
