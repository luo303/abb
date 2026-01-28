import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { useSelector, useDispatch } from 'react-redux'
import HistoryActionModal from './HistoryActionModal'
import { RootState } from '../../store'
import {
  deleteHistoryItem,
  switchConversation,
  resetSession
} from '../../store/modules/ChatStore'
import { HistoryItem } from '../../types/AIchat'
import { useMessage } from '../Message'
import * as Speech from 'expo-speech'

export default function HistoryDrawerContent(
  props: DrawerContentComponentProps
) {
  const items = useSelector((state: RootState) => state.chat.historyList)
  const currentConversationId = useSelector(
    (state: RootState) => state.chat.currentConversationId
  )
  const messages = useSelector((state: RootState) => state.chat.messages)
  const { showMessage } = useMessage()
  const dispatch = useDispatch()
  const [menuVisible, setMenuVisible] = useState(false)
  const [activeItem, setActiveItem] = useState<HistoryItem | null>(null)

  const handleLongPress = (item: HistoryItem) => {
    setActiveItem(item)
    setMenuVisible(true)
  }

  const handleCloseMenu = () => {
    setMenuVisible(false)
    setActiveItem(null)
  }

  const handleDelete = () => {
    if (!activeItem) return
    dispatch(deleteHistoryItem(activeItem.conversation_id))
    handleCloseMenu()
  }

  const handleItemPress = (item: HistoryItem) => {
    // 先停止当前正在播放的语音
    Speech.stop()
    // @ts-ignore - Thunk action type issue
    dispatch(switchConversation(item.conversation_id))
    props.navigation.closeDrawer()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>历史对话</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (messages.length === 0) {
              showMessage('已在新对话中')
            }
            Speech.stop()
            // @ts-ignore - Thunk action type issue
            dispatch(resetSession())
            props.navigation.closeDrawer()
          }}
        >
          <MaterialIcons name="post-add" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {items.map(item => {
          const isActive = item.conversation_id === currentConversationId
          return (
            <TouchableOpacity
              key={item.conversation_id}
              style={[styles.historyItem, isActive && styles.activeHistoryItem]}
              activeOpacity={0.7}
              onLongPress={() => handleLongPress(item)}
              onPress={() => handleItemPress(item)}
            >
              <AntDesign
                name="message"
                size={16}
                color={isActive ? '#1890ff' : '#666'}
                style={styles.icon}
              />
              <View style={styles.itemContent}>
                <Text
                  style={[styles.itemTitle, isActive && styles.activeItemText]}
                  numberOfLines={1}
                >
                  {item.conversation_title}
                </Text>
                <Text
                  style={[styles.itemDate, isActive && styles.activeItemText]}
                >
                  {item.conversation_date}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
      <HistoryActionModal
        visible={menuVisible}
        onClose={handleCloseMenu}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  content: {
    flex: 1,
    margin: 16
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7fa',
    borderRadius: 8,
    paddingHorizontal: 8
  },
  activeHistoryItem: {
    backgroundColor: '#e6f7ff',
    borderBottomColor: '#1890ff'
  },
  icon: {
    marginRight: 12
  },
  itemContent: {
    flex: 1
  },
  itemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  activeItemText: {
    color: '#1890ff',
    fontWeight: '500'
  },
  itemDate: {
    fontSize: 12,
    color: '#999'
  }
})
