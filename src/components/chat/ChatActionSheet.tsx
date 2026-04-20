import React from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  HeartCircle,
  Users,
  UserPlus,
  AngleRightSmall
} from '@zappicon/react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { chatCardShadow, chatPalette } from '@/components/chat/chatTheme'

type Props = {
  visible: boolean
  onClose: () => void
  showBindPartner?: boolean
  onBindPartner: () => void
  onCreateGroup: () => void
  onJoinGroup: () => void
}

export default function ChatActionSheet({
  visible,
  onClose,
  showBindPartner = true,
  onBindPartner,
  onCreateGroup,
  onJoinGroup
}: Props) {
  const actions = [
    ...(showBindPartner
      ? [
          {
            key: 'partner',
            icon: (
              <HeartCircle
                size={22}
                color={chatPalette.accentStrong}
                variant="filled"
              />
            ),
            title: '绑定另一半',
            description: '建立专属私聊，会显示在聊天列表里',
            color: '#FFF0F4',
            onPress: onBindPartner
          }
        ]
      : []),
    {
      key: 'create',
      icon: (
        <UserPlus size={22} color={chatPalette.textStrong} variant="regular" />
      ),
      title: '创建群聊',
      description: '上传群头像，建立新的家庭群或育儿群',
      color: '#FFF3ED',
      onPress: onCreateGroup
    },
    {
      key: 'join',
      icon: (
        <Users size={22} color={chatPalette.textStrong} variant="regular" />
      ),
      title: '加入群聊',
      description: '从群广场里挑一个你想加入的群',
      color: '#FFF7EE',
      onPress: onJoinGroup
    }
  ]

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.mask}
        />
        <View style={styles.sheet}>
          <View style={styles.dragIndicator} />
          <Text style={styles.sheetTitle}>发起新聊天</Text>
          <Text style={styles.sheetHint}>
            这里会像聊天工具一样新增一个入口到列表中。
          </Text>
          {actions.map(item => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.82}
              onPress={() => {
                onClose()
                item.onPress()
              }}
              style={styles.actionRow}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.color }]}>
                {item.icon}
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
              <AngleRightSmall
                size={18}
                color={chatPalette.textMuted}
                variant="regular"
              />
            </TouchableOpacity>
          ))}
          <SafeAreaView edges={['bottom']} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(44, 17, 31, 0.24)'
  },
  sheet: {
    backgroundColor: '#FFF9FB',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: chatPalette.border,
    ...chatCardShadow
  },
  dragIndicator: {
    alignSelf: 'center',
    width: 46,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E7C7D2',
    marginBottom: 18
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: chatPalette.textStrong
  },
  sheetHint: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 18,
    color: chatPalette.textMuted
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  textWrap: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: chatPalette.textStrong
  },
  description: {
    marginTop: 4,
    fontSize: 12,
    color: chatPalette.textMuted
  }
})
