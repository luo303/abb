import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather, Octicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
interface Props {
  visible: boolean
  isPinned: boolean
  onClose: () => void
  onDelete: () => void
  onPin: () => void
}

export default function HistoryActionModal({
  visible,
  isPinned,
  onClose,
  onDelete,
  onPin
}: Props) {
  const handleDeletePress = () => {
    onDelete()
  }

  const handlePinPress = () => {
    onPin()
  }

  const handleCancelPress = () => {
    onClose()
  }

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
          style={styles.mask}
          activeOpacity={1}
          onPress={handleCancelPress}
        />
        <View style={styles.container}>
          <View style={styles.dragIndicator} />
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={handlePinPress}
          >
            <Octicons
              name="pin"
              size={20}
              color={isPinned ? '#1890ff' : '#fff'}
              style={styles.icon}
            />
            <Text style={[styles.actionText, isPinned && { color: '#1890ff' }]}>
              {isPinned ? '取消置顶' : '置顶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={handleDeletePress}
          >
            <Feather name="trash-2" size={20} color="red" style={styles.icon} />
            <Text style={[styles.actionText, { color: 'red' }]}>删除</Text>
          </TouchableOpacity>

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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  container: {
    backgroundColor: '#1e1e1e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 30
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#404040',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16
  },
  icon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center'
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '400'
  }
})
