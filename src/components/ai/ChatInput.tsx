import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ChatInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  disabled?: boolean
}

export default function ChatInput({
  value,
  onChangeText,
  onSend,
  disabled
}: ChatInputProps) {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom:
            Platform.OS === 'android' ? 16 : Math.max(insets.bottom, 16)
        }
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.plusButton}>
        <Ionicons name="add" size={28} color="#666" />
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="问问AI..."
          placeholderTextColor="#B0BEC5"
          multiline
          maxLength={1000}
        />
        {value.trim().length > 0 && (
          <TouchableOpacity
            style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
            onPress={onSend}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={disabled ? '#CFD8DC' : '#fff'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16
  },
  plusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff', // 白色背景
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4, // 与输入框底部对齐
    // 添加阴影以实现悬浮效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff', // 白色背景
    borderRadius: 24,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingBottom: 4,
    // 添加阴影以实现悬浮效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#37474F',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    paddingRight: 8,
    maxHeight: 120
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000', // 按照图片显示黑色背景
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // 在输入容器内对齐
    marginRight: 4
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0'
  }
})
