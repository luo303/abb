import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'

interface PostHeaderProps {
  avatar: any
  nickname: string
  description?: string
  isFollowing?: boolean
  onFollow?: () => void
}

export default function PostHeader({
  avatar,
  nickname,
  description,
  isFollowing = false,
  onFollow
}: PostHeaderProps) {
  const [avatarLoadError, setAvatarLoadError] = useState(false)

  useEffect(() => {
    setAvatarLoadError(false)
  }, [avatar])

  const avatarSource = useMemo(() => {
    if (avatarLoadError) {
      return require('@/assets/testAvatar.png')
    }
    return avatar || require('@/assets/testAvatar.png')
  }, [avatar, avatarLoadError])

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image
          source={avatarSource}
          style={styles.avatar}
          onError={() => setAvatarLoadError(true)}
        />
        <View style={styles.textContainer}>
          <Text style={styles.nickname}>{nickname}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.followBtn, isFollowing && styles.followingBtn]}
        onPress={onFollow}
      >
        <Text style={[styles.followText, isFollowing && styles.followingText]}>
          {isFollowing ? '已关注' : '关注'}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: '#fff'
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
