import React, { useEffect, useLayoutEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'

import {
  AppKeyboardChatScrollView,
  default as AppKeyboardAvoidingView
} from '@/components/common/AppKeyboardAvoidingView'
import ChatAvatar from '@/components/chat/ChatAvatar'
import {
  chatCardShadow,
  chatGradients,
  chatPalette
} from '@/components/chat/chatTheme'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  ChatGroupMember,
  refreshGroupMembers
} from '@/store/modules/MessengerStore'
import { RootStackParamList } from '@/types/navigation'

type GroupInfoRoute = RouteProp<RootStackParamList, 'GroupInfo'>
const EMPTY_GROUP_MEMBERS: ChatGroupMember[] = []

export default function GroupInfo() {
  const route = useRoute<GroupInfoRoute>()
  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  const groupId = route.params.groupId
  const group = useAppSelector(state =>
    state.messenger.groups.items.find(item => item.groupId === groupId)
  )
  const members = useAppSelector(
    state =>
      state.messenger.groups.membersByGroupId[groupId] || EMPTY_GROUP_MEMBERS
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '群聊详情',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: chatPalette.header
      },
      headerTintColor: chatPalette.textStrong
    })
  }, [navigation])

  useEffect(() => {
    dispatch(refreshGroupMembers(groupId))
  }, [dispatch, groupId])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient
        colors={chatGradients.page}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <AppKeyboardAvoidingView style={styles.container}>
        <AppKeyboardChatScrollView contentContainerStyle={styles.content}>
          <LinearGradient
            colors={chatGradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <ChatAvatar
              uri={group?.avatar}
              label={group?.name || '群聊'}
              size={84}
              shape="roundedSquare"
            />
            <Text style={styles.groupName}>{group?.name || '群聊'}</Text>
            <Text style={styles.groupMeta}>
              {group?.memberCount || members.length} /{' '}
              {group?.memberLimit || '--'} 人
            </Text>
          </LinearGradient>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>群成员</Text>
            <View style={styles.memberGrid}>
              {members.map(member => (
                <View key={member.userId} style={styles.memberItem}>
                  <View style={styles.memberAvatarWrap}>
                    <ChatAvatar
                      uri={member.avatar}
                      label={member.username}
                      size={56}
                      shape="roundedSquare"
                    />
                  </View>
                  <Text numberOfLines={1} style={styles.memberName}>
                    {member.username}
                  </Text>
                  <Text style={styles.memberRole}>
                    {member.role === 'owner' ? '群主' : '成员'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>群简介</Text>
            <Text style={styles.descriptionText}>
              {group?.description || '暂无群简介'}
            </Text>
          </View>
        </AppKeyboardChatScrollView>
      </AppKeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: chatPalette.page
  },
  container: {
    flex: 1
  },
  content: {
    padding: 18,
    paddingBottom: 32
  },
  heroCard: {
    borderRadius: 34,
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: chatPalette.border,
    ...chatCardShadow
  },
  groupName: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '800',
    color: chatPalette.textStrong
  },
  groupMeta: {
    marginTop: 6,
    fontSize: 13,
    color: chatPalette.textMuted
  },
  sectionCard: {
    marginTop: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: chatPalette.border,
    padding: 18,
    ...chatCardShadow
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: chatPalette.textStrong,
    marginBottom: 14
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  memberItem: {
    width: '25%',
    paddingHorizontal: 6,
    marginBottom: 18,
    alignItems: 'center'
  },
  memberAvatarWrap: {
    padding: 4,
    borderRadius: 22,
    backgroundColor: '#FFF1F5'
  },
  memberName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: chatPalette.text
  },
  memberRole: {
    marginTop: 4,
    fontSize: 11,
    color: chatPalette.textMuted
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: chatPalette.text
  }
})
