import React, { useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

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
import { useMessage } from '@/components/Message'
import { mockDiscoverGroups } from '@/data/mock/chatDiscoverGroups'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  joinGroupConversation,
  joinMockGroupConversation
} from '@/store/modules/MessengerStore'
import { NavigationProps } from '@/types/navigation'

export default function JoinGroup() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const { showMessage } = useMessage()
  const [keyword, setKeyword] = useState('')
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const myGroups = useAppSelector(state => state.messenger.groups.items)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '加入群聊',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: chatPalette.header
      },
      headerTintColor: chatPalette.textStrong
    })
  }, [navigation])

  const joinedGroupIds = useMemo(() => {
    return new Set(myGroups.map(item => item.groupId))
  }, [myGroups])

  const filteredGroups = useMemo(() => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return mockDiscoverGroups

    return mockDiscoverGroups.filter(item => {
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized)
      )
    })
  }, [keyword])

  const handleJoin = async (groupId: string) => {
    try {
      setJoiningId(groupId)
      const targetGroup = mockDiscoverGroups.find(
        item => item.group_id === groupId
      )

      if (groupId.startsWith('mock-group-') && targetGroup) {
        await dispatch(
          joinMockGroupConversation({
            groupId: targetGroup.group_id,
            name: targetGroup.name,
            avatar: targetGroup.avatar,
            description: targetGroup.description,
            memberLimit: targetGroup.member_limit,
            memberCount: targetGroup.member_count
          })
        )
      } else {
        await dispatch(joinGroupConversation(groupId))
      }

      navigation.replace('ChatDetail', {
        conversationType: 'group',
        groupId
      })
    } catch (error: any) {
      showMessage(error?.message || '加入群聊失败')
    } finally {
      setJoiningId(null)
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <LinearGradient
        colors={chatGradients.page}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <AppKeyboardAvoidingView style={styles.container}>
        <AppKeyboardChatScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={chatGradients.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>从群广场挑一个加入</Text>
            <Text style={styles.heroText}>
              当前这里还是本地 mock
              数据，后端补齐“全部群聊”接口后会直接切成真实列表。
            </Text>
          </LinearGradient>

          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={18}
              color={chatPalette.textMuted}
            />
            <TextInput
              placeholder="搜索群聊名称或简介"
              placeholderTextColor="#B796A3"
              style={styles.searchInput}
              value={keyword}
              onChangeText={setKeyword}
            />
          </View>

          <FlashList
            scrollEnabled={false}
            data={filteredGroups}
            keyExtractor={item => item.group_id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const joined = joinedGroupIds.has(item.group_id)
              const joining = joiningId === item.group_id

              return (
                <View style={styles.groupCard}>
                  <ChatAvatar
                    uri={item.avatar}
                    label={item.name}
                    size={62}
                    shape="roundedSquare"
                  />
                  <View style={styles.groupContent}>
                    <View style={styles.groupTitleRow}>
                      <Text style={styles.groupName}>{item.name}</Text>
                      <View style={styles.groupTag}>
                        <Text style={styles.groupTagText}>广场群</Text>
                      </View>
                    </View>
                    <Text numberOfLines={2} style={styles.groupDesc}>
                      {item.description}
                    </Text>
                    <Text style={styles.groupMeta}>
                      {item.member_count}/{item.member_limit} 人
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={joined || joining}
                    onPress={() => handleJoin(item.group_id)}
                    style={[
                      styles.joinButton,
                      (joined || joining) && styles.joinButtonDisabled
                    ]}
                  >
                    {joining ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.joinButtonText}>
                        {joined ? '已加入' : '加入'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>没有找到匹配的群聊</Text>
              </View>
            }
          />
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
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28
  },
  hero: {
    borderRadius: 32,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: chatPalette.border,
    ...chatCardShadow
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: chatPalette.textStrong
  },
  heroText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    color: chatPalette.textMuted
  },
  searchBox: {
    marginTop: 16,
    height: 50,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: chatPalette.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: chatPalette.text
  },
  listContent: {
    paddingTop: 14
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: chatPalette.border,
    padding: 14,
    marginBottom: 12,
    ...chatCardShadow
  },
  groupContent: {
    flex: 1,
    marginLeft: 14,
    marginRight: 12
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  groupName: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: chatPalette.textStrong
  },
  groupTag: {
    marginLeft: 8,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF1EA',
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  groupTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D26B7E'
  },
  groupDesc: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: chatPalette.textMuted
  },
  groupMeta: {
    marginTop: 8,
    fontSize: 12,
    color: '#B08A97'
  },
  joinButton: {
    minWidth: 68,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: chatPalette.accent,
    justifyContent: 'center',
    alignItems: 'center'
  },
  joinButtonDisabled: {
    backgroundColor: '#E3CFD6'
  },
  joinButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff'
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 80
  },
  emptyText: {
    fontSize: 14,
    color: chatPalette.textMuted
  }
})
