import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Bell } from '@zappicon/react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { List } from 'react-native-paper'

import { AppKeyboardChatScrollView } from '@/components/common/AppKeyboardAvoidingView'
import ChatAvatar from '@/components/chat/ChatAvatar'
import { chatPalette } from '@/components/chat/chatTheme'
import { useMessage } from '@/components/Message'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  ChatGroupMember,
  dissolveGroupConversation,
  leaveGroupConversation,
  refreshGroupMembers
} from '@/store/modules/MessengerStore'
import { NavigationProps, RootStackParamList } from '@/types/navigation'

type GroupInfoRoute = RouteProp<RootStackParamList, 'GroupInfo'>

const EMPTY_GROUP_MEMBERS: ChatGroupMember[] = []
const MEMBER_COLUMNS = 5
const COLLAPSED_ROWS = 4
const COLLAPSED_MEMBER_COUNT = MEMBER_COLUMNS * COLLAPSED_ROWS

export default function GroupInfo() {
  const route = useRoute<GroupInfoRoute>()
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { showMessage } = useMessage()

  const [membersExpanded, setMembersExpanded] = useState(false)
  const [pendingAction, setPendingAction] = useState<
    'leave' | 'dissolve' | null
  >(null)

  const groupId = route.params.groupId
  const currentUserId = useAppSelector(state => state.user.userInfo?.user_id)
  const group = useAppSelector(state =>
    state.messenger.groups.items.find(item => item.groupId === groupId)
  )
  const members = useAppSelector(
    state =>
      state.messenger.groups.membersByGroupId[groupId] || EMPTY_GROUP_MEMBERS
  )
  const [expanded, setExpanded] = React.useState(true)

  const handlePress = () => setExpanded(!expanded)
  const orderedMembers = useMemo(() => {
    return [...members].sort((left, right) => {
      const leftRank = left.role === 'owner' ? 0 : 1
      const rightRank = right.role === 'owner' ? 0 : 1

      if (leftRank !== rightRank) {
        return leftRank - rightRank
      }

      return left.joinTime - right.joinTime
    })
  }, [members])

  const owner = orderedMembers.find(member => member.role === 'owner')
  const isOwner =
    group?.role === 'owner' || Boolean(owner && owner.userId === currentUserId)
  const memberCount = group?.memberCount || orderedMembers.length
  const hasMoreMembers = orderedMembers.length > COLLAPSED_MEMBER_COUNT
  const visibleMembers = membersExpanded
    ? orderedMembers
    : orderedMembers.slice(0, COLLAPSED_MEMBER_COUNT)
  const groupName = group?.name || '群聊'
  const groupDescription = group?.description?.trim() || '暂无群简介'

  useLayoutEffect(() => {
    navigation.setOptions({
      title: memberCount ? `聊天信息(${memberCount})` : '聊天信息',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#f6f4f2'
      },
      headerTintColor: chatPalette.textStrong
    })
  }, [memberCount, navigation])

  useEffect(() => {
    dispatch(refreshGroupMembers(groupId))
  }, [dispatch, groupId])

  useEffect(() => {
    setMembersExpanded(false)
  }, [groupId])

  const finishGroupAction = useCallback(
    async (action: 'leave' | 'dissolve') => {
      try {
        setPendingAction(action)

        if (action === 'dissolve') {
          await dispatch(dissolveGroupConversation(groupId))
          showMessage('群聊已解散')
        } else {
          await dispatch(leaveGroupConversation(groupId))
          showMessage('已退出群聊')
        }

        navigation.reset({
          index: 1,
          routes: [{ name: 'Tabs' }, { name: 'ChatHome' }]
        })
      } catch (error: any) {
        showMessage(
          error?.message ||
            (action === 'dissolve' ? '解散群聊失败' : '退出群聊失败')
        )
      } finally {
        setPendingAction(null)
      }
    },
    [dispatch, groupId, navigation, showMessage]
  )

  const confirmGroupAction = useCallback(() => {
    const isDissolve = isOwner

    Alert.alert(
      isDissolve ? '确认解散群聊' : '确认退出群聊',
      isDissolve
        ? '解散后所有成员都将无法继续在此群聊天，此操作不可恢复。'
        : '退出后你将不再接收这个群的消息，也会从成员列表中移除。',
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: isDissolve ? '确认解散' : '确认退出',
          style: 'destructive',
          onPress: () => {
            void finishGroupAction(isDissolve ? 'dissolve' : 'leave')
          }
        }
      ]
    )
  }, [finishGroupAction, isOwner])

  const actionLabel = isOwner ? '解散群聊' : '退出群聊'
  const actionHelper = isOwner
    ? '群主解散后，所有成员都会失去这个群聊入口。'
    : '退出后你将不再接收此群消息，但群聊本身仍会保留。'

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <AppKeyboardChatScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.membersSection}>
          <View style={styles.memberGrid}>
            {visibleMembers.length ? (
              visibleMembers.map(member => (
                <View key={member.userId} style={styles.memberItem}>
                  <ChatAvatar
                    label={member.username}
                    shape="roundedSquare"
                    size={56}
                    style={styles.memberAvatar}
                    uri={member.avatar}
                  />
                  <Text numberOfLines={1} style={styles.memberName}>
                    {member.username}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>暂未加载到群成员</Text>
            )}
          </View>

          {hasMoreMembers ? (
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => setMembersExpanded(current => !current)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {membersExpanded ? '收起' : '更多群成员'}
              </Text>
              <Ionicons
                color="#8d8379"
                name={membersExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>群聊名称</Text>
            <Text numberOfLines={1} style={styles.infoValue}>
              {groupName}
            </Text>
          </View>
          <List.Section>
            <List.Accordion
              title="群简介"
              left={props => <Bell {...props} variant="filled" />}
              expanded={expanded}
              onPress={handlePress}
            >
              <Text style={styles.descriptionText}>
                {groupDescription || '暂无群简介'}
              </Text>
            </List.Accordion>
          </List.Section>
        </View>

        <View style={styles.actionSection}>
          <Text style={styles.actionHint}>{actionHelper}</Text>
          <TouchableOpacity
            activeOpacity={0.82}
            disabled={Boolean(pendingAction)}
            onPress={confirmGroupAction}
            style={[
              styles.actionButton,
              pendingAction && styles.actionButtonDisabled
            ]}
          >
            {pendingAction ? (
              <ActivityIndicator color="#d95c5c" size="small" />
            ) : null}
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        </View>
      </AppKeyboardChatScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f4f2'
  },
  content: {
    paddingTop: 12,
    paddingBottom: 28
  },
  membersSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingTop: 18,
    paddingBottom: 8
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  memberItem: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4
  },
  memberAvatar: {
    borderRadius: 14
  },
  memberName: {
    width: '100%',
    marginTop: 8,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: '#8a8177'
  },
  emptyStateText: {
    width: '100%',
    paddingBottom: 12,
    fontSize: 13,
    textAlign: 'center',
    color: '#9a9188'
  },
  toggleButton: {
    minHeight: 48,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ebe6e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#7e746a'
  },
  infoSection: {
    marginTop: 10,
    backgroundColor: '#ffffff'
  },
  infoRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  infoLabel: {
    fontSize: 16,
    color: '#222222'
  },
  infoValue: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    textAlign: 'right',
    color: '#8a8177'
  },
  infoDivider: {
    marginLeft: 16,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ebe6e1'
  },
  accordion: {
    backgroundColor: '#ffffff'
  },
  accordionTitle: {
    fontSize: 16,
    color: '#222222'
  },
  accordionChevron: {
    alignSelf: 'center'
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -2
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 42,
    color: '#7c746c'
  },
  actionSection: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 18
  },
  actionHint: {
    fontSize: 13,
    lineHeight: 20,
    color: '#9a9188'
  },
  actionButton: {
    minHeight: 52,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217,92,92,0.18)',
    backgroundColor: '#fff6f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  actionButtonDisabled: {
    opacity: 0.72
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d95c5c'
  }
})
