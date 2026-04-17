import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ChatActionSheet from '@/components/chat/ChatActionSheet'
import ConversationListItem from '@/components/chat/ConversationListItem'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { NavigationProps } from '@/types/navigation'
import {
  ChatGroupSummary,
  MessengerMessage,
  refreshGroupList,
  refreshPartnerInfo
} from '@/store/modules/MessengerStore'

type ConversationItem = {
  key: string
  conversationType: 'partner' | 'group'
  groupId?: string
  title: string
  avatar?: string | null
  subtitle: string
  unreadCount: number
  time?: number | null
  tag?: string
}

const buildPartnerSubtitle = (message?: MessengerMessage) => {
  if (!message) return '和另一半开始今天的第一句聊天'
  return message.type === 'image' ? '[图片]' : message.content
}

const buildGroupSubtitle = (group: ChatGroupSummary) => {
  if (group.lastMessageType === 'image') {
    return group.lastMessageFromName
      ? `${group.lastMessageFromName}：[图片]`
      : '[图片]'
  }

  if (group.lastMessageContent) {
    return group.lastMessageFromName
      ? `${group.lastMessageFromName}：${group.lastMessageContent}`
      : group.lastMessageContent
  }

  return `${group.memberCount}人 · ${group.description || '点击进入群聊'}`
}

export default function ChatHome() {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProps>()
  const [sheetVisible, setSheetVisible] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [keyword, setKeyword] = useState('')

  const partner = useAppSelector(state => state.messenger.partner)
  const groups = useAppSelector(state => state.messenger.groups.items)
  const hasPartnerBound = Boolean(partner.partnerId)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '聊天',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#FFFFFF'
      },
      headerTintColor: '#111111',
      headerRight: () => (
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => setSheetVisible(true)}
          style={styles.headerButton}
        >
          <Ionicons name="add" size={22} color="#111111" />
        </TouchableOpacity>
      )
    })
  }, [navigation])

  const conversations = useMemo(() => {
    const items: ConversationItem[] = groups.map(group => ({
      key: `group-${group.groupId}`,
      conversationType: 'group',
      groupId: group.groupId,
      title: group.name,
      avatar: group.avatar,
      subtitle: buildGroupSubtitle(group),
      unreadCount: group.unreadCount,
      time: group.lastMessageTime || group.utime || group.ctime
    }))

    if (partner.partnerId) {
      const lastPartnerMessage = partner.messages[partner.messages.length - 1]

      items.push({
        key: 'partner',
        conversationType: 'partner',
        title: partner.name || '另一半',
        avatar: partner.avatar,
        subtitle: buildPartnerSubtitle(lastPartnerMessage),
        unreadCount: partner.unreadCount,
        time: lastPartnerMessage?.ctime ?? null,
        tag: '另一半'
      })
    }

    const normalized = keyword.trim().toLowerCase()
    const filtered = items.filter(item => {
      if (!normalized) return true
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.subtitle.toLowerCase().includes(normalized)
      )
    })

    return filtered.sort((a, b) => (b.time || 0) - (a.time || 0))
  }, [
    groups,
    keyword,
    partner.avatar,
    partner.messages,
    partner.name,
    partner.partnerId,
    partner.unreadCount
  ])

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true)
      await Promise.all([
        dispatch(refreshPartnerInfo()),
        dispatch(refreshGroupList())
      ])
    } finally {
      setRefreshing(false)
    }
  }, [dispatch])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color="#8C8C8C" />
            <TextInput
              placeholder="搜索"
              placeholderTextColor="#A0A0A0"
              style={styles.searchInput}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>
        </View>

        <FlashList
          data={conversations}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#999999"
            />
          }
          renderItem={({ item }) => (
            <ConversationListItem
              avatar={item.avatar}
              subtitle={item.subtitle}
              tag={item.tag}
              time={item.time}
              title={item.title}
              unreadCount={item.unreadCount}
              onPress={() => {
                navigation.navigate('ChatDetail', {
                  conversationType: item.conversationType,
                  groupId: item.groupId
                })
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={34}
                color="#CCCCCC"
              />
              <Text style={styles.emptyTitle}>还没有聊天会话</Text>
              <Text style={styles.emptyText}>
                {hasPartnerBound
                  ? '点击右上角加号，创建群聊或加入新的群聊。'
                  : '点击右上角加号，绑定另一半或创建群聊。'}
              </Text>
            </View>
          }
        />
      </View>

      <ChatActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        showBindPartner={!hasPartnerBound}
        onBindPartner={() => navigation.navigate('BindPartner')}
        onCreateGroup={() => navigation.navigate('CreateGroup')}
        onJoinGroup={() => navigation.navigate('JoinGroup')}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchSection: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#F7F7F7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E5'
  },
  searchWrap: {
    height: 36,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF'
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#222222'
  },
  listContent: {
    paddingBottom: 28
  },
  emptyWrap: {
    paddingTop: 120,
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: '600',
    color: '#444444'
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: '#999999',
    textAlign: 'center'
  }
})
