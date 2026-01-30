import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Card from '../common/Card'
import { NavigationProps } from '../../types/navigation'

export default function BabyDiary() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <Card style={styles.card} onPress={() => navigation.navigate('Diary')}>
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <View style={styles.iconBox}>
            <Ionicons name="book-outline" size={20} color="#1f99b0" />
          </View>
          <Text style={styles.title}>宝宝日记</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Diary')}>
          <Text style={styles.moreText}>全部 &gt;</Text>
        </TouchableOpacity>
      </View>

      <LinearGradient
        colors={['#fcfdfd', '#f0fdf4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.content}
      >
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/testAvatar.png')}
            style={styles.diaryImage}
          />
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>01</Text>
            <Text style={styles.dateMonth}>1月</Text>
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={styles.time}>12:01</Text>
            <View style={styles.moodContainer}>
              <Text style={styles.moodText}>开心 😊</Text>
            </View>
          </View>

          <Text style={styles.desc} numberOfLines={2}>
            宝宝今天第一次翻身啦！ 看起来非常开心，一直在笑，我也好开心呀...
          </Text>

          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}># 第一次</Text>
            </View>
            <View style={[styles.tag, styles.tagBlue]}>
              <Text style={[styles.tagText, styles.tagTextBlue]}># 翻身</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  moreText: {
    fontSize: 13,
    color: '#999'
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f0fdf4'
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12
  },
  diaryImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#e2e8f0'
  },
  dateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  dateDay: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 16
  },
  dateMonth: {
    fontSize: 10,
    color: '#666',
    lineHeight: 12
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  time: {
    fontSize: 12,
    color: '#94a3b8'
  },
  moodContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  moodText: {
    fontSize: 11,
    color: '#64748b'
  },
  desc: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 8
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tagBlue: {
    backgroundColor: '#eff6ff'
  },
  tagText: {
    fontSize: 11,
    color: '#64748b'
  },
  tagTextBlue: {
    color: '#3b82f6'
  }
})
