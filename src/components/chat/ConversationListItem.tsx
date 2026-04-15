import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import dayjs from 'dayjs'

import ChatAvatar from '@/components/chat/ChatAvatar'

export type ConversationListItemProps = {
  title: string
  avatar?: string | null
  subtitle: string
  unreadCount?: number
  time?: number | null
  highlight?: boolean
  tag?: string
  onPress: () => void
}

export const formatConversationTime = (timestamp?: number | null) => {
  if (!timestamp) return ''

  const value = dayjs(timestamp)
  if (value.isSame(dayjs(), 'day')) {
    return value.format('HH:mm')
  }

  if (value.isSame(dayjs(), 'year')) {
    return value.format('MM-DD')
  }

  return value.format('YYYY-MM-DD')
}

export default function ConversationListItem({
  title,
  avatar,
  subtitle,
  unreadCount = 0,
  time,
  tag,
  onPress
}: ConversationListItemProps) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.row}>
      <ChatAvatar
        uri={avatar}
        label={title}
        shape="roundedSquare"
        size={54}
        style={styles.avatar}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            {tag ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.time}>{formatConversationTime(time)}</Text>
        </View>

        <View style={styles.bottomRow}>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ECECEC'
  },
  avatar: {
    backgroundColor: '#F3F3F3'
  },
  content: {
    flex: 1,
    marginLeft: 12,
    minHeight: 54,
    justifyContent: 'center'
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10
  },
  title: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#111111'
  },
  tag: {
    marginLeft: 8,
    paddingHorizontal: 6,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tagText: {
    fontSize: 10,
    color: '#8A8A8A'
  },
  time: {
    fontSize: 12,
    color: '#A0A0A0'
  },
  bottomRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  subtitle: {
    flex: 1,
    fontSize: 13,
    color: '#8A8A8A',
    marginRight: 10
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#FA5151',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700'
  }
})
