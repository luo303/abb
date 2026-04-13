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

  // 根据类型获取颜色
  const getTagColor = () => {
    switch (type) {
      case '奶粉':
        return '#f43f5e'
      case '母乳':
        return '#e11d48'
      case '辅食':
        return '#b91c1c'
      default:
        return '#e11d48'
    }
  }

  // 根据类型获取背景颜色
  const getBackgroundColor = () => {
    switch (type) {
      case '奶粉':
        return '#fff0f0'
      case '母乳':
        return '#fff5f5'
      case '辅食':
        return '#ffe6e6'
      default:
        return '#fff5f5'
    }
  }

  // 处理贴纸点击
  const handleStickerPress = (stickerText: string) => {
    const newRemark = value ? `${value} ${stickerText}` : stickerText
    onChange(newRemark)
  }

  const tagColor = getTagColor()
  const backgroundColor = getBackgroundColor()

  return (
    <View style={styles.remarkContainer}>
      <Text style={styles.remarkLabel}>{label}</Text>

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
              { borderColor: tagColor, backgroundColor: backgroundColor }
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
          { backgroundColor: backgroundColor, color: tagColor }
        ]}
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
    borderWidth: 1
  },
  tagText: {
    fontSize: 14
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
