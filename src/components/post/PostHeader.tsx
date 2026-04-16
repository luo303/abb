import React from 'react'
import { View, Text, StyleSheet, ImageSourcePropType } from 'react-native'
import { TouchableRipple } from 'react-native-paper'

import PaperAvatar from '@/components/common/PaperAvatar'

interface PostHeaderProps {
  avatar: string | ImageSourcePropType | null | undefined
  nickname: string
  description?: string
  isFollowing?: boolean
  onFollow?: () => void
  showFollow?: boolean
}

export default function PostHeader({
  avatar,
  nickname,
  description,
  isFollowing = false,
  onFollow,
  showFollow = true
}: PostHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <PaperAvatar
          accessibilityLabel={nickname}
          size={40}
          source={avatar}
          style={styles.avatar}
        />
        <View style={styles.textContainer}>
          <Text style={styles.nickname}>{nickname}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
      </View>

      {showFollow ? (
        <TouchableRipple
          onPress={onFollow}
          rippleColor="rgba(244, 63, 94, 0.08)"
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
        >
          <Text
            style={[styles.followText, isFollowing && styles.followingText]}
          >
            {isFollowing ? '已关注' : '关注'}
          </Text>
        </TouchableRipple>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#eee'
  },
  textContainer: {
    justifyContent: 'center'
  },
  nickname: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  description: {
    fontSize: 11,
    color: '#999'
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff4d4f',
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  followingBtn: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5'
  },
  followText: {
    fontSize: 13,
    color: '#ff4d4f',
    fontWeight: '500'
  },
  followingText: {
    color: '#999'
  }
})
