import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'

export default function BabyDiary() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>宝宝日记</Text>
      </View>
      <View style={styles.content}>
        <Image
          source={require('../../assets/testAvatar.png')}
          style={styles.diaryImage}
        ></Image>
        <View style={styles.info}>
          <Text style={styles.date}>2026 年 01 月 01 日</Text>
          <Text style={styles.time}>12 : 01</Text>
          <Text style={styles.desc} numberOfLines={2}>
            宝宝今天第一次翻身啦！ 看起来非常开心...
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0.05, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  header: {
    marginBottom: 12
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  diaryImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginRight: 12
  },
  info: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5
  },
  time: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15
  },
  desc: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  }
})
