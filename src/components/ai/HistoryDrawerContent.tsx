import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { AntDesign } from '@expo/vector-icons'
import { historyList } from '../../data/mock/homePosts'

export default function HistoryDrawerContent(
  props: DrawerContentComponentProps
) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>历史对话</Text>
      </View>

      <ScrollView style={styles.content}>
        {historyList.map(item => (
          <TouchableOpacity key={item.id} style={styles.historyItem}>
            <AntDesign
              name="message"
              size={16}
              color="#666"
              style={styles.icon}
            />
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
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
    borderBottomColor: '#f5f7fa'
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
  itemDate: {
    fontSize: 12,
    color: '#999'
  }
})
