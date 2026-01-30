import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import Card from '../common/Card'
import { NavigationProps } from '../../types/navigation'

export default function BabyDiary() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <Card style={styles.card} onPress={() => navigation.navigate('Diary')}>
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="book-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.title}>宝宝日记</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>

      <View style={styles.content}>
        <Image
          source={require('../../assets/testAvatar.png')}
          style={styles.diaryImage}
        ></Image>
        <View style={styles.info}>
          <View style={styles.dateRow}>
            <Text style={styles.date}>01月01日</Text>
            <Text style={styles.time}>12:01</Text>
          </View>
          <Text style={styles.desc} numberOfLines={2}>
            宝宝今天第一次翻身啦！ 看起来非常开心，一直在笑，我也好开心呀...
          </Text>
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>第一次</Text>
            </View>
            <View style={[styles.tag, styles.moodTag]}>
              <Text style={[styles.tagText, styles.moodText]}>开心 😊</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#48bb78',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  content: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 20
  },
  diaryImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 12
  },
  info: {
    flex: 1,
    justifyContent: 'space-between'
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  time: {
    fontSize: 12,
    color: '#999'
  },
  desc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8
  },
  tag: {
    backgroundColor: '#e6fffa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  tagText: {
    fontSize: 10,
    color: '#38b2ac',
    fontWeight: '600'
  },
  moodTag: {
    backgroundColor: '#fff5f5'
  },
  moodText: {
    color: '#fc8181'
  }
})
