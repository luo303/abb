import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { UserMeResponse } from '../../api/profile'

interface InfoCardProps {
  userInfo: UserMeResponse | null
}

function formatBirthday(birthday?: number) {
  if (!birthday) return ''
  const date = new Date(birthday)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function InfoCard({ userInfo }: InfoCardProps) {
  const occupation = userInfo?.occupation || '未填写'
  const phone = userInfo?.phone || '未填写'
  const email = userInfo?.email || '未填写'
  const address =
    userInfo && (userInfo.province || userInfo.city)
      ? `${userInfo.province || ''}${userInfo.city || ''}`
      : '未填写'
  const birthday = formatBirthday(userInfo?.birthday)
  const gender =
    userInfo?.gender === 'male'
      ? '男'
      : userInfo?.gender === 'female'
        ? '女'
        : '未填写'
  const account = userInfo?.account || '未填写'

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#ffffff', '#fff1f2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.titleLine} />
          <Text style={styles.title}>基本信息</Text>
        </View>

        <View style={styles.content}>
          <InfoItem
            label="账号"
            value={account}
            icon="id-card-outline"
            isLast
          />
          <InfoItem
            label="生日"
            value={birthday || '未填写'}
            icon="gift-outline"
          />
          <InfoItem label="性别" value={gender} icon="male-female-outline" />
          <InfoItem label="地址" value={address} icon="location-outline" />
          <InfoItem label="邮箱地址" value={email} icon="mail-outline" />
          <InfoItem label="电话号码" value={phone} icon="call-outline" />
          <InfoItem label="职业" value={occupation} icon="briefcase-outline" />
        </View>
      </LinearGradient>
    </View>
  )
}

const InfoItem = ({
  label,
  value,
  icon,
  isLast
}: {
  label: string
  value: string
  icon: keyof typeof Ionicons.glyphMap
  isLast?: boolean
}) => (
  <View style={[styles.itemContainer, isLast && styles.lastItem]}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={18} color="#f43f5e" />
    </View>
    <View style={styles.textContainer}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#a0aec0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderRadius: 20
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  titleLine: {
    width: 4,
    height: 18,
    backgroundColor: '#f43f5e',
    borderRadius: 2,
    marginRight: 10
  },
  title: {
    fontSize: 18,
    color: '#2d3748',
    fontWeight: '700',
    letterSpacing: 0.5
  },
  content: {
    gap: 16
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)'
  },
  lastItem: {
    marginBottom: 0
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '500'
  },
  value: {
    fontSize: 15,
    color: '#2d3748',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10
  }
})
