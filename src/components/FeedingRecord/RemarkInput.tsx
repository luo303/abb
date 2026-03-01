import React from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'

interface RemarkInputProps {
  value: string
  onChange: (text: string) => void
  label: string
  placeholder: string
}

const RemarkInput: React.FC<RemarkInputProps> = ({
  value,
  onChange,
  label,
  placeholder
}) => {
  // 贴纸数据
  const stickers = [
    { emoji: '🤢', text: '吐奶了' },
    { emoji: '😀', text: '胃口好' },
    { emoji: '🐢', text: '喝得慢' },
    { emoji: '😴', text: '睡着了' }
  ]

  // 处理贴纸点击
  const handleStickerPress = (stickerText: string) => {
    const newRemark = value ? `${value} ${stickerText}` : stickerText
    onChange(newRemark)
  }

  return (
    <View style={styles.remarkContainer}>
      <Text style={styles.remarkLabel}>{label}</Text>

      {/* 标签行 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stickerContainer}
      >
        {stickers.map((sticker, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tag}
            onPress={() => handleStickerPress(sticker.text)}
          >
            <Text style={styles.tagEmoji}>{sticker.emoji}</Text>
            <Text style={styles.tagText}>{sticker.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        style={styles.remarkInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline
        textAlignVertical="top"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  remarkContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0
  },
  remarkLabel: {
    fontSize: 14,
    color: '#333',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  tagEmoji: {
    fontSize: 16,
    marginRight: 4
  },
  tagText: {
    fontSize: 14,
    color: '#666'
  },
  remarkInput: {
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12
  }
})

export default RemarkInput
