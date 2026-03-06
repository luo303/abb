import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { NavigationProps } from '../../types/navigation'
import { LinearGradient } from 'expo-linear-gradient'

export default function BabyDiary() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Diary')}
      >
        <LinearGradient
          colors={['#ffffff', '#fff1f2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleWrapper}>
              <View style={styles.iconBox}>
                <Ionicons name="book-outline" size={20} color="#f43f5e" />
              </View>
              <Text style={styles.title}>宝宝日记</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
              <LinearGradient
                colors={['#ff9a9e', '#f43f5e']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>记一笔</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.contentRow}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../../assets/testAvatar.png')}
                style={styles.diaryImage}
              />
              <View style={styles.dateBadge}>
                <Text style={styles.dayText}>01</Text>
                <Text style={styles.monthText}>1月</Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoHeader}>
                <Text style={styles.timeText}>12:01</Text>
                <View style={styles.moodBadge}>
                  <Text style={styles.moodText}>开心 😊</Text>
                </View>
              </View>

              <Text style={styles.diaryText} numberOfLines={2}>
                宝宝今天第一次翻身啦！ 看起来非常开心，一直在笑，我也好开心呀...
              </Text>

              <View style={styles.tagsContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}># 第一次</Text>
                </View>
                <View style={[styles.tag, styles.redTag]}>
                  <Text style={[styles.tagText, styles.redTagText]}>
                    # 翻身
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 16,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#fff'
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fff'
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
    gap: 8
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff1f2'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  contentRow: {
    flexDirection: 'row',
    gap: 16
  },
  imageContainer: {
    position: 'relative'
  },
  diaryImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#f5f5f5'
  },
  dateBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 32
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 14
  },
  monthText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  timeText: {
    fontSize: 12,
    color: '#999'
  },
  moodBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  moodText: {
    fontSize: 11,
    color: '#f97316'
  },
  diaryText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tagText: {
    fontSize: 11,
    color: '#6b7280'
  },
  redTag: {
    backgroundColor: '#fff1f2'
  },
  redTagText: {
    color: '#f43f5e'
  },
  addButton: {
    borderRadius: 16,
    overflow: 'hidden'
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  }
})
