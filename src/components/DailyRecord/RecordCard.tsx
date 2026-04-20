import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import dayjs from 'dayjs'
import { RecordItem } from '../../types/recordTypes'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

interface RecordCardProps {
  item: RecordItem
}

// 定义导航类型
type RootStackParamList = {
  DiaperForm: { diaper_id: string }
  FeedingRecord: { feeding_id: string }
  SleepRecord: { session_id: string }
}

type RecordCardNavigationProp = NativeStackNavigationProp<RootStackParamList>

export default function RecordCard({ item }: RecordCardProps) {
  const navigation = useNavigation<RecordCardNavigationProp>()

  const handlePress = () => {
    if (item.id) {
      // 移除类型前缀，获取原始id
      const originalId = item.id.replace(/^\w+_/, '')

      switch (item.type) {
        case 'diaper':
          navigation.navigate('DiaperForm', { diaper_id: originalId })
          break
        case 'feeding':
          console.log('点击的喂养ID:', originalId)
          navigation.navigate('FeedingRecord', { feeding_id: originalId })
          break
        case 'sleep':
          navigation.navigate('SleepRecord', { session_id: originalId })
          break
      }
    }
  }

  // 处理时间显示
  const formatTime = (time: string | number) => {
    if (typeof time === 'number') {
      return dayjs(time).format('HH:mm')
    }
    return time
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#ffffff', '#fef5f5']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.recordCard}
      >
        <View style={styles.recordContent}>
          <View style={styles.recordInfo}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={(item.icon as any) || 'baby-carriage'}
                size={32}
                color="#f43f5e"
              />
            </View>
            <View style={styles.recordTextInfo}>
              <Text
                style={styles.recordName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name || item.title}
              </Text>
              <Text
                style={styles.recordDetails}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.details || item.description}
              </Text>
              {item.remark && (
                <Text
                  style={styles.recordRemark}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.remark}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.recordTimeContainer}>
            <Text style={styles.recordTimeText}>{formatTime(item.time)}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#f43f5e"
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  recordCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    maxHeight: 80,
    ...(Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    }) as any)
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.select({
      ios: {
        shadowColor: '#f43f5e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4
      },
      android: {
        elevation: 3
      }
    }) as any)
  },
  recordTextInfo: {
    marginLeft: 12,
    flex: 1,
    minWidth: 0,
    maxHeight: 50,
    overflow: 'hidden'
  },
  recordName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  recordDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    flexShrink: 1
  },
  recordRemark: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
    flexShrink: 1
  },
  recordTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  recordTimeText: {
    fontSize: 16,
    color: '#f43f5e',
    fontWeight: '600'
  }
})
