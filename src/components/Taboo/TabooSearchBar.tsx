import React from 'react'
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity
} from 'react-native'
import { AntDesign } from '@expo/vector-icons'

interface TabooSearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onTagPress: (tag: string) => void
  onClear: () => void
}

const HOT_TAGS = ['咖啡', '糖类', '火锅', '山药', '西瓜', '海鲜', '螃蟹']

const TAG_COLORS = [
  { bg: '#E3F2FD', text: '#1976D2' }, // Blue
  { bg: '#FFEBEE', text: '#D32F2F' }, // Red
  { bg: '#E8F5E9', text: '#388E3C' }, // Green
  { bg: '#FFF3E0', text: '#F57C00' }, // Orange
  { bg: '#F3E5F5', text: '#7B1FA2' }, // Purple
  { bg: '#E0F2F1', text: '#00796B' } // Teal
]

export default function TabooSearchBar({
  value,
  onChangeText,
  onTagPress,
  onClear
}: TabooSearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <AntDesign
          name="search"
          size={20}
          color="#B0B0B0"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="搜索食物..."
          placeholderTextColor="#B0B0B0"
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <AntDesign name="close" size={16} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tagsContainer}>
        <Text style={styles.tagLabel}>热门标签</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {HOT_TAGS.map((tag, index) => {
            const colorConfig = TAG_COLORS[index % TAG_COLORS.length]
            return (
              <TouchableOpacity
                key={index}
                style={[styles.tag, { backgroundColor: colorConfig.bg }]}
                onPress={() => onTagPress(tag)}
              >
                <Text style={[styles.tagText, { color: colorConfig.text }]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: 'transparent'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  icon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    height: '100%'
  },
  clearButton: {
    padding: 4
  },
  tagsContainer: {
    marginTop: 4
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginLeft: 4
  },
  scrollView: {
    flexGrow: 0
  },
  scrollContent: {
    paddingRight: 16
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500'
  }
})
