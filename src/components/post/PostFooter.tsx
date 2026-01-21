import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'
import { MOCK_POSTS } from '@/data/mock/homePosts'
export default function PostFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <AntDesign
          name="edit"
          size={16}
          color="#999"
          style={styles.inputIcon}
        />
        <Text style={styles.placeholderText}>说点什么...</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn}>
          <AntDesign name="heart" size={22} color="#333" />
          <Text style={styles.actionText}>{MOCK_POSTS[0].stats.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <AntDesign name="star" size={22} color="#333" />
          <Text style={styles.actionText}>收藏</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MaterialCommunityIcons
            name="comment-processing-outline"
            size={22}
            color="#333"
          />
          <Text style={styles.actionText}>{MOCK_POSTS[0].stats.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  inputContainer: {
    flex: 1,
    height: 36,
    backgroundColor: '#f5f7fa',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 16
  },
  inputIcon: {
    marginRight: 6
  },
  placeholderText: {
    fontSize: 13,
    color: '#999'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500'
  }
})
