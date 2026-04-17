import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

import PaperAvatar from '@/components/common/PaperAvatar'
import { RootState } from '../../../store'

export default function PostUserInfo() {
  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const userName = userInfo?.username || userInfo?.account || '呵护宝贝用户'

  return (
    <View style={styles.container}>
      <PaperAvatar
        accessibilityLabel={userName}
        size={40}
        source={userInfo?.avatar}
        style={styles.avatar}
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
