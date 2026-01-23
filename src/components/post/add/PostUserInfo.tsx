import React from 'react'
import { View, Text, Image, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

export default function PostUserInfo() {
  // 从 Redux 获取用户信息，如果没有则使用默认值
  const user = useSelector((state: any) => state.user.userInfo) || {
    nickname: '稚慧宝用户',
    avatar: 'https://via.placeholder.com/100'
  }

  const avatarSource =
    typeof user.avatar === 'string' ? { uri: user.avatar } : user.avatar

  return (
    <View style={styles.container}>
      <Image source={avatarSource} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.nickname}>{user.nickname}</Text>
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
