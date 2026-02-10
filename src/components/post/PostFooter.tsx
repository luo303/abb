import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PostFooterProps {
  onInputPress: () => void
  stats: {
    likes: number
    dislikes: number
    favorites: number
    comments: number
  }
  isLiked?: boolean
  isDisliked?: boolean
  isFavorited?: boolean
  onLike?: () => void
  onDislike?: () => void
  onFavorite?: () => void
}

export default function PostFooter({
  onInputPress,
  stats,
  isLiked = false,
  isDisliked = false,
  isFavorited = false,
  onLike,
  onDislike,
  onFavorite
}: PostFooterProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={onInputPress}
        activeOpacity={0.9}
      >
        <Text style={styles.placeholderText}>说点什么...</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={24}
            color={isLiked ? '#ff4d4f' : '#333'}
          />
          <Text style={[styles.actionText, isLiked && { color: '#ff4d4f' }]}>
            {stats.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onDislike}>
          <Ionicons
            name={isDisliked ? 'heart-dislike' : 'heart-dislike-outline'}
            size={24}
            color={isDisliked ? '#666' : '#333'}
          />
          <Text style={[styles.actionText, isDisliked && { color: '#666' }]}>
            {stats.dislikes || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onFavorite}>
          <Ionicons
            name={isFavorited ? 'star' : 'star-outline'}
            size={24}
            color={isFavorited ? '#ffba00' : '#333'}
          />
          <Text
            style={[styles.actionText, isFavorited && { color: '#ffba00' }]}
          >
            {isFavorited ? '已收藏' : '收藏'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={24} color="#333" />
          <Text style={styles.actionText}>{stats.comments}</Text>
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
    borderTopColor: '#f0f0f0',
    paddingBottom: 20 // Add some padding for safety on bottom
  },
  inputContainer: {
    flex: 1,
    height: 36,
    backgroundColor: '#f5f7fa',
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 16
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
