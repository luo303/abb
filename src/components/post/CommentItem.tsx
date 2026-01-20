import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

export interface Comment {
  id: string
  avatar: any
  nickname: string
  content: string
  time: string
  location?: string
  likes: number
  isLiked?: boolean
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  onLike?: (id: string) => void
  onReply?: (id: string) => void
}

export default function CommentItem({
  comment,
  onLike,
  onReply
}: CommentItemProps) {
  return (
    <View style={styles.container}>
      <Image source={comment.avatar} style={styles.avatar} />

      <View style={styles.contentContainer}>
        <Text style={styles.nickname}>{comment.nickname}</Text>

        <Text style={styles.content}>
          {comment.content}
          <Text style={styles.metaText}>
            {' '}
            {comment.time} {comment.location}
          </Text>
        </Text>

        <View style={styles.actions}>
          {/* Typically reply button is here or handled by tapping the comment */}
        </View>
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => (
              <View key={reply.id} style={styles.replyItem}>
                <Text style={styles.replyText}>
                  <Text style={styles.replyNickname}>{reply.nickname}</Text>
                  {reply.content}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.likeContainer}
        onPress={() => onLike && onLike(comment.id)}
      >
        <AntDesign
          name="heart"
          size={14}
          color={comment.isLiked ? '#ff4d4f' : '#999'}
        />
        <Text style={styles.likeCount}>
          {comment.likes > 0 ? comment.likes : ''}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#eee'
  },
  contentContainer: {
    flex: 1,
    paddingRight: 10
  },
  nickname: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 6
  },
  metaText: {
    fontSize: 11,
    color: '#999'
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  likeContainer: {
    alignItems: 'center',
    paddingTop: 2,
    width: 30
  },
  likeCount: {
    fontSize: 10,
    color: '#999',
    marginTop: 2
  },
  repliesContainer: {
    marginTop: 8,
    backgroundColor: '#f5f7fa',
    padding: 8,
    borderRadius: 4
  },
  replyItem: {
    marginBottom: 4
  },
  replyText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18
  },
  replyNickname: {
    color: '#666',
    fontWeight: '500',
    marginRight: 4
  }
})
