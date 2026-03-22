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
import { AntDesign, Ionicons, SimpleLineIcons } from '@expo/vector-icons'
import { useSelector, useDispatch } from 'react-redux'
import HistoryActionModal from './HistoryActionModal'
import { RootState } from '../../store'
import {
  switchConversation,
  resetSession,
  removeHistoryItem,
  togglePin
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
    // @ts-ignore
    dispatch(removeHistoryItem(activeItem.session_id))
    handleCloseMenu()
    props.navigation.closeDrawer()
  }

  const handlePin = () => {
    if (!activeItem) return
    // @ts-ignore
    dispatch(togglePin(activeItem.session_id))
    handleCloseMenu()
    props.navigation.closeDrawer()
  }

  const handleItemPress = (item: HistoryItem) => {
    // 先停止当前正在播放的语音
    Speech.stop()
    // @ts-ignore - Thunk action type issue
    dispatch(switchConversation(item.session_id))
    props.navigation.closeDrawer()
  }

  const handleNewChat = () => {
    if (messages.length === 0) {
      showMessage('已在新对话中')
    }
    // @ts-ignore - Thunk action type issue
    dispatch(resetSession())
    props.navigation.closeDrawer()
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={handleNewChat}
        >
          <View style={styles.actionIconContainer}>
            <SimpleLineIcons name="magnifier-add" size={16} color="black" />
          </View>
          <Text style={styles.actionText}>新建会话</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.7}
          onPress={() => {
            props.navigation.navigate('KnowledgeUpload')
            props.navigation.closeDrawer()
          }}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="cloud-upload-outline" size={16} color="black" />
          </View>
          <Text style={styles.actionText}>上传知识库</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {[...items]
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            return 0
          })
          .map(item => {
            const isActive = item.session_id === currentConversationId
            return (
              <TouchableOpacity
                key={item.session_id}
                style={[
                  styles.historyItem,
                  isActive && styles.activeHistoryItem
                ]}
                activeOpacity={0.7}
                onLongPress={() => handleLongPress(item)}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.iconContainer}>
                  <AntDesign
                    name="message"
                    size={16}
                    color={isActive ? '#1890ff' : '#666'}
                  />
                  {item.isPinned && (
                    <AntDesign
                      name="pushpin"
                      size={12}
                      color="#1890ff"
                      style={styles.pinIcon}
                    />
                  )}
                </View>
                <View style={styles.itemContent}>
                  <Text
                    style={[
                      styles.itemTitle,
                      isActive && styles.activeItemText
                    ]}
                    numberOfLines={1}
                  >
                    {item.session_title}
                  </Text>
                  <Text
                    style={[styles.itemDate, isActive && styles.activeItemText]}
                  >
                    {item.session_date}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
      </ScrollView>
      <HistoryActionModal
        visible={menuVisible}
        isPinned={activeItem?.isPinned || false}
        onClose={handleCloseMenu}
        onDelete={handleDelete}
        onPin={handlePin}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  actionContainer: {
    padding: 16,
    paddingTop: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  actionIconContainer: {
    width: 24,
    height: 24,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600'
  },
  content: {
    flex: 1,
    marginHorizontal: 16
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
  iconContainer: {
    marginRight: 12,
    position: 'relative'
  },
  pinIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 6
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
