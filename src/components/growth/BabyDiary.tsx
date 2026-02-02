import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { NavigationProps } from '../../types/navigation'

export default function BabyDiary() {
  const navigation = useNavigation<NavigationProps>()

  return (
    <View>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>宝宝日记</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Diary')}>
          <View style={styles.moreBtn}>
            <Text style={styles.moreText}>全部</Text>
            <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Diary')}
        style={styles.diaryCard}
      >
        <View style={styles.cardContent}>
          {/* 左侧图片 */}
          <View style={styles.imageWrapper}>
            <Image
              source={require('../../assets/testAvatar.png')}
              style={styles.diaryImage}
            />
            <View style={styles.dateOverlay}>
              <Text style={styles.dayText}>01</Text>
              <Text style={styles.monthText}>1月</Text>
            </View>
          </View>

          {/* 右侧内容 */}
          <View style={styles.infoWrapper}>
            <View style={styles.infoHeader}>
              <Text style={styles.timeText}>12:01</Text>
              <View style={styles.moodBadge}>
                <Text style={styles.moodText}>开心 😊</Text>
              </View>
            </View>

            <Text style={styles.diaryText} numberOfLines={2}>
              宝宝今天第一次翻身啦！ 看起来非常开心，一直在笑，我也好开心呀...
            </Text>

            <View style={styles.tagsRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}># 第一次</Text>
              </View>
              <View style={[styles.tag, styles.tagBlue]}>
                <Text style={[styles.tagText, styles.tagTextBlue]}># 翻身</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  moreText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500'
  },
  diaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16
  },
  imageWrapper: {
    position: 'relative'
  },
  diaryImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#f3f4f6'
  },
  dateOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  dayText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    lineHeight: 16
  },
  monthText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280'
  },
  infoWrapper: {
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
    color: '#9ca3af',
    fontWeight: '500'
  },
  moodBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  moodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#d97706'
  },
  diaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500'
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tagBlue: {
    backgroundColor: '#eff6ff'
  },
  tagText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500'
  },
  tagTextBlue: {
    color: '#3b82f6'
  }
})
