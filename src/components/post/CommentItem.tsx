import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

import { CommentItemProps, Comment } from '@/types/post'

const ReplyItem = ({
  comment,
  parentNickname
}: {
  comment: Comment
  parentNickname?: string
}) => {
  return (
    <>
      <View style={styles.replyItem}>
        <Text style={styles.replyText}>
          {parentNickname ? (
            <>
              <Text style={styles.replyNickname}>{comment.nickname}</Text>
              <Text style={styles.reply}>&nbsp;&nbsp;回复&nbsp;&nbsp;</Text>
              <Text style={styles.replyNickname}>{parentNickname}</Text>
              <Text>：{comment.content}</Text>
            </>
          ) : (
            <>
              <Text style={styles.replyNickname}>{comment.nickname}:</Text>
              {comment.content}
            </>
          )}
        </Text>
      </View>
      {comment.replies?.map(reply => (
        <ReplyItem
          key={reply.id}
          comment={reply}
          parentNickname={comment.nickname}
        />
      ))}
    </>
  )
}

export default function CommentItem({ comment, onLike }: CommentItemProps) {
  return (
    <View style={styles.container}>
      <Image source={comment.avatar} style={styles.avatar} />

      <View style={styles.contentContainer}>
        <Text style={styles.nickname}>{comment.nickname}</Text>

        <View style={styles.content}>
          <Text>{comment.content}</Text>
          <Text style={styles.metaText}>
            {comment.time} {comment.location}
          </Text>
        </View>

        <View style={styles.actions}>
          {/* Typically reply button is here or handled by tapping the comment */}
        </View>
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => (
              <ReplyItem key={reply.id} comment={reply} />
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
    flexDirection: 'column',
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
  },
  reply: {
    color: 'black',
    fontWeight: '600'
  }
})
