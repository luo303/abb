import React, { useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextStyle
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { APP_COLORS } from '@/theme/paperTheme'

interface SearchSuggestionListProps {
  query: string
  suggestions: string[]
  onSuggestionPress: (keyword: string) => void
  onSubmit: () => void
}

const highlightMatch = (text: string, query: string) => {
  const keyword = query.trim()
  if (!keyword) return [{ text, highlighted: false }]

  const source = text.toLowerCase()
  const target = keyword.toLowerCase()
  const index = source.indexOf(target)
  if (index < 0) return [{ text, highlighted: false }]

  const end = index + target.length
  return [
    { text: text.slice(0, index), highlighted: false },
    { text: text.slice(index, end), highlighted: true },
    { text: text.slice(end), highlighted: false }
  ].filter(item => item.text.length > 0)
}

export default function SearchSuggestionList({
  query,
  suggestions,
  onSuggestionPress,
  onSubmit
}: SearchSuggestionListProps) {
  const normalizedQuery = query.trim()

  const fallbackAction = useMemo(
    () => (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={onSubmit}
        style={styles.rowButton}
      >
        <Ionicons
          name="return-down-forward"
          size={16}
          color={APP_COLORS.primary}
        />
        <Text style={styles.rowText}>搜索“{normalizedQuery}”</Text>
      </TouchableOpacity>
    ),
    [normalizedQuery, onSubmit]
  )

  return (
    <View style={styles.container}>
      {suggestions.length > 0
        ? suggestions.map(item => {
            const parts = highlightMatch(item, normalizedQuery)

            return (
              <TouchableOpacity
                activeOpacity={0.82}
                key={item}
                onPress={() => onSuggestionPress(item)}
                style={styles.rowButton}
              >
                <Ionicons
                  name="search-outline"
                  size={16}
                  color={APP_COLORS.primary}
                />
                <Text style={styles.rowText}>
                  {parts.map((part, index) => (
                    <Text
                      key={`${item}-${index}`}
                      style={
                        part.highlighted
                          ? (styles.highlightText as TextStyle)
                          : (styles.normalText as TextStyle)
                      }
                    >
                      {part.text}
                    </Text>
                  ))}
                </Text>
              </TouchableOpacity>
            )
          })
        : fallbackAction}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant,
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  rowButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowText: {
    marginLeft: 8,
    fontSize: 14,
    color: APP_COLORS.text
  },
  normalText: {
    color: APP_COLORS.text
  },
  highlightText: {
    color: APP_COLORS.primaryStrong,
    fontWeight: '600'
  }
})
