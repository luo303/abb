import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

export default function PostUserInfo() {
  // 从 Redux 获取用户信息
  const userInfo = useSelector((state: RootState) => state.user.userInfo)

  // 获取用户名，优先使用 username，其次 account，最后使用默认值
  const userName = userInfo?.username || userInfo?.account || '稚慧宝用户'

  // 获取头像，使用默认头像作为兜底
  const avatarUrl = userInfo?.avatar
  const [avatarLoadError, setAvatarLoadError] = useState(false)

  useEffect(() => {
    setAvatarLoadError(false)
  }, [avatarUrl])

  return (
    <View style={styles.container}>
      <Image
        source={
          avatarUrl && !avatarLoadError
            ? { uri: avatarUrl }
            : require('../../../assets/testAvatar.png')
        }
        style={styles.avatar}
        onError={() => setAvatarLoadError(true)}
      />
      <View style={styles.info}>
        <Text style={styles.nickname}>{userName}</Text>
        <Text style={styles.subtitle}>分享宝宝的成长瞬间</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  info: {
    marginLeft: 10
  },
  nickname: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333'
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  }
})
