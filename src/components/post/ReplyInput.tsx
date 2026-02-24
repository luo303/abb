import React, { useState, useEffect, useRef } from 'react'
import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  Keyboard,
  Modal,
  KeyboardAvoidingView
} from 'react-native'

interface ReplyInputProps {
  visible: boolean
  placeholder?: string
  onSend: (text: string) => void
  onDismiss: () => void
}

export default function ReplyInput({
  visible,
  placeholder = '说点什么...',
  onSend,
  onDismiss
}: ReplyInputProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (visible) {
      // 延迟聚焦，确保组件已挂载
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setText('')
      Keyboard.dismiss()
    }
  }, [visible])

  const handleSend = () => {
    if (text.trim()) {
      onSend(text)
      setText('')
    }
  }

  // 如果不可见，返回null (虽然父组件通常也会控制渲染)
  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onDismiss}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={styles.inputContainer}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#999"
              multiline
              maxLength={200}
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim()}
            >
              <Text style={styles.sendText}>发送</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end'
  },
  inputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#f5f7fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: '#333',
    marginRight: 12
  },
  sendBtn: {
    width: 60,
    height: 40,
    backgroundColor: '#1f99b0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0
  },
  sendBtnDisabled: {
    backgroundColor: '#ccc'
  },
  sendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
})
