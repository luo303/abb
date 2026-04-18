import React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewProps
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Button } from 'react-native-paper'

import {
  composerFieldFocusShadow,
  composerFieldShadow,
  composerFooterShadow,
  composerSendShadow,
  composerTheme
} from '../common/composerTheme'
import { POST_ACTION_COLORS } from './postActionColors'

interface PostFooterProps {
  onInputPress?: () => void
  likeCount: number
  dislikeCount: number
  collectCount: number
  commentCount: number
  isLiked?: boolean
  isDisliked?: boolean
  isFavorited?: boolean
  inputValue?: string
  inputPlaceholder?: string
  inputRef?: React.RefObject<TextInput | null>
  onInputChangeText?: (text: string) => void
  onInputFocus?: () => void
  onInputBlur?: () => void
  onSend?: () => void
  isComposerActive?: boolean
  bottomInset?: number
  onLayout?: ViewProps['onLayout']
  onLike?: () => void
  onDislike?: () => void
  onFavorite?: () => void
}

export default function PostFooter({
  onInputPress,
  likeCount,
  dislikeCount,
  collectCount,
  commentCount,
  isLiked = false,
  isDisliked = false,
  isFavorited = false,
  inputValue = '',
  inputPlaceholder = '说点什么...',
  inputRef,
  onInputChangeText,
  onInputFocus,
  onInputBlur,
  onSend,
  isComposerActive = false,
  bottomInset = 0,
  onLayout,
  onLike,
  onDislike,
  onFavorite
}: PostFooterProps) {
  const showComposer = typeof onInputChangeText === 'function'
  const sendDisabled = !inputValue.trim() || !onSend

  const renderActionButton = (
    name: React.ComponentProps<typeof Ionicons>['name'],
    count: number,
    onPress?: () => void,
    active?: boolean,
    activeColor?: string
  ) => {
    const tint = active
      ? activeColor || composerTheme.accent
      : composerTheme.muted

    return (
      <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
        <Ionicons name={name} size={20} color={tint} />
        <Text style={[styles.actionText, active && { color: tint }]}>
          {count}
        </Text>
      </TouchableOpacity>
    )
  }

  const actionButtons = (
    <View style={styles.actions}>
      {renderActionButton(
        isLiked ? 'heart' : 'heart-outline',
        likeCount,
        onLike,
        isLiked,
        POST_ACTION_COLORS.like
      )}
      {renderActionButton(
        isDisliked ? 'heart-dislike' : 'heart-dislike-outline',
        dislikeCount || 0,
        onDislike,
        isDisliked,
        POST_ACTION_COLORS.dislike
      )}
      {renderActionButton(
        isFavorited ? 'star' : 'star-outline',
        collectCount,
        onFavorite,
        isFavorited,
        POST_ACTION_COLORS.favorite
      )}
      {renderActionButton('chatbubble-outline', commentCount)}
    </View>
  )

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: 10 + Math.max(0, bottomInset) }
      ]}
      onLayout={onLayout}
    >
      {showComposer ? (
        <>
          <View
            style={[
              styles.composerContainer,
              isComposerActive && styles.composerContainerActive
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.composerInput,
                isComposerActive && styles.composerInputActive
              ]}
              placeholder={inputPlaceholder}
              placeholderTextColor={composerTheme.placeholder}
              multiline
              maxLength={200}
              value={inputValue}
              onChangeText={onInputChangeText}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              onPressIn={onInputPress}
              textAlignVertical="top"
              underlineColorAndroid="transparent"
            />
          </View>
          {isComposerActive ? (
            <Button
              mode="contained"
              style={[
                styles.sendButton,
                sendDisabled && styles.sendButtonDisabled
              ]}
              contentStyle={styles.sendButtonContent}
              labelStyle={styles.sendButtonText}
              onPress={onSend}
              disabled={sendDisabled}
              buttonColor={composerTheme.accent}
              uppercase={false}
            >
              发送
            </Button>
          ) : (
            actionButtons
          )}
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={onInputPress}
            activeOpacity={0.9}
          >
            <Text style={styles.placeholderText}>{inputPlaceholder}</Text>
          </TouchableOpacity>
          {actionButtons}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: composerTheme.footerBackground,
    borderTopWidth: 1,
    borderTopColor: composerTheme.footerBorder,
    ...composerFooterShadow
  },
  inputContainer: {
    flex: 1,
    height: 42,
    backgroundColor: composerTheme.shellBackground,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: composerTheme.shellBorder,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginRight: 12,
    ...composerFieldShadow
  },
  placeholderText: {
    fontSize: 14,
    color: composerTheme.placeholder
  },
  composerContainer: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    backgroundColor: composerTheme.shellBackground,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: composerTheme.shellBorder,
    paddingLeft: 14,
    paddingRight: 14,
    marginRight: 12,
    ...composerFieldShadow
  },
  composerContainerActive: {
    backgroundColor: composerTheme.shellBackgroundFocused,
    borderRadius: 21,
    borderColor: composerTheme.shellBorderFocused,
    ...composerFieldFocusShadow
  },
  composerInput: {
    minHeight: 42,
    maxHeight: 120,
    fontSize: 14,
    lineHeight: 20,
    color: composerTheme.text,
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 0,
    paddingRight: 0
  },
  composerInputActive: {
    minHeight: 42,
    fontSize: 14,
    lineHeight: 20
  },
  sendButton: {
    width: 68,
    borderRadius: 21,
    ...composerSendShadow
  },
  sendButtonContent: {
    height: 42
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
    letterSpacing: 0.2,
    marginHorizontal: 0
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12
  },
  actionText: {
    fontSize: 12,
    color: composerTheme.muted,
    marginLeft: 4,
    fontWeight: '600'
  }
})
