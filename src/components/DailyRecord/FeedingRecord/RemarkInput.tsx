import React from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { APP_COLORS } from '@/theme/paperTheme'

interface RemarkInputProps {
  value: string
  onChange: (text: string) => void
  label: string
  placeholder: string
  type?: '奶粉' | '母乳' | '辅食'
}

export const RemarkInput: React.FC<RemarkInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  type = '母乳'
}) => {
  // 贴纸数据
  const stickers = [
    { text: '吐奶了' },
    { text: '胃口好' },
    { text: '喝得慢' },
    { text: '睡着了' }
  ]

  // 处理贴纸点击
  const handleStickerPress = (stickerText: string) => {
    const newRemark = value ? `${value} ${stickerText}` : stickerText
    onChange(newRemark)
  }

  const tagColor = APP_COLORS.primary

  return (
    <View style={styles.remarkContainer}>
      <Text style={[styles.remarkLabel, { color: APP_COLORS.text }]}>
        {label}
      </Text>

      {/* 标签行 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stickerContainer}
      >
        {stickers.map(sticker => (
          <TouchableOpacity
            key={sticker.text}
            style={[
              styles.tag,
              {
                borderColor: tagColor,
                backgroundColor: APP_COLORS.surfaceVariant
              }
            ]}
            onPress={() => handleStickerPress(sticker.text)}
          >
            <Text style={[styles.tagText, { color: tagColor }]}>
              {sticker.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={[
          styles.remarkInput,
          { backgroundColor: APP_COLORS.surfaceVariant, color: APP_COLORS.text }
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={APP_COLORS.textMuted}
        multiline
        textAlignVertical="top"
        selectionColor={tagColor}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  remarkContainer: {
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0
  },
  remarkLabel: {
    fontSize: 14,
    color: APP_COLORS.text,
    marginBottom: 8
  },
  stickerContainer: {
    marginBottom: 12
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: APP_COLORS.surfaceVariant,
    borderRadius: 20,
    borderWidth: 1
  },
  tagText: {
    fontSize: 14
  },
  remarkInput: {
    fontSize: 14,
    color: APP_COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: APP_COLORS.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.outlineVariant
  }
})

export default RemarkInput
