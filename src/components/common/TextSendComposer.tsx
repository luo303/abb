import React, { useState } from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native'

import {
  composerFieldFocusShadow,
  composerFieldShadow,
  composerSendShadow,
  composerTheme
} from './composerTheme'

type Props = {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  placeholder?: string
  placeholderTextColor?: string
  disabled?: boolean
  maxLength?: number
  inputRef?: React.RefObject<TextInput | null>
  onBlur?: () => void
  onFocus?: () => void
  containerStyle?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  sendButtonStyle?: StyleProp<ViewStyle>
  sendButtonDisabledStyle?: StyleProp<ViewStyle>
  sendTextStyle?: StyleProp<TextStyle>
}

export default function TextSendComposer({
  value,
  onChangeText,
  onSend,
  placeholder = '说点什么...',
  placeholderTextColor = composerTheme.placeholder,
  disabled,
  maxLength = 200,
  inputRef,
  onBlur,
  onFocus,
  containerStyle,
  inputStyle,
  sendButtonStyle,
  sendButtonDisabledStyle,
  sendTextStyle
}: Props) {
  const [isFocused, setIsFocused] = useState(false)
  const isDisabled = disabled ?? !value.trim()

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
    onBlur?.()
  }

  const handleSend = () => {
    if (isDisabled) return
    onSend()
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline
          maxLength={maxLength}
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          underlineColorAndroid="transparent"
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          sendButtonStyle,
          isDisabled && styles.sendButtonDisabled,
          isDisabled && sendButtonDisabledStyle
        ]}
        onPress={handleSend}
        disabled={isDisabled}
        activeOpacity={0.88}
      >
        <Text style={[styles.sendButtonText, sendTextStyle]}>发送</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10
  },
  inputContainer: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: composerTheme.shellBackground,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: composerTheme.shellBorder,
    paddingLeft: 14,
    paddingRight: 14,
    ...composerFieldShadow
  },
  inputContainerFocused: {
    backgroundColor: composerTheme.shellBackgroundFocused,
    borderColor: composerTheme.shellBorderFocused,
    ...composerFieldFocusShadow
  },
  input: {
    minHeight: 42,
    maxHeight: 120,
    fontSize: 14,
    lineHeight: 20,
    color: composerTheme.text,
    paddingVertical: 11,
    paddingRight: 0,
    textAlignVertical: 'top'
  },
  sendButton: {
    width: 58,
    height: 42,
    backgroundColor: composerTheme.accent,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    ...composerSendShadow
  },
  sendButtonDisabled: {
    backgroundColor: composerTheme.accentDisabled,
    shadowOpacity: 0.08,
    elevation: 1
  },
  sendButtonText: {
    color: composerTheme.accentText,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2
  }
})
