import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { TouchableRipple } from 'react-native-paper'

import PaperAvatar from '@/components/common/PaperAvatar'
import { CommentItemProps, Comment } from '@/types/post'

const formatTimeLabel = (timestamp?: number) => {
  if (!timestamp) return ''
  const diff = Date.now() - timestamp
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

const ReplyItem = ({
  comment,
  parentNickname,
  onReply
}: {
  comment: Comment
  parentNickname?: string
  onReply?: (comment: Comment) => void
}) => {
  return (
    <TouchableRipple
      onPress={() => onReply?.(comment)}
      rippleColor="rgba(244, 63, 94, 0.08)"
      style={styles.replyItem}
    >
      <Text style={styles.replyText}>
        {parentNickname ? (
          <>
            <Text style={styles.replyNickname}>{comment.username}</Text>
            <Text style={styles.reply}> 回复 </Text>
            <Text style={styles.replyNickname}>{parentNickname}</Text>
            <Text>：{comment.content}</Text>
          </>
        ) : (
          <>
            <Text style={styles.replyNickname}>{comment.username}:</Text>
            {comment.content}
          </>
        )}
      </Text>
    </TouchableRipple>
  )
}

export default function CommentItem({
  comment,
  onLike,
  onReply
}: CommentItemProps) {
  const flatReplies = useMemo(() => {
    const result: { node: Comment; parentNickname?: string }[] = []

    const traverse = (items: Comment[], parentNickname?: string) => {
      for (const item of items) {
        result.push({
          node: item,
          parentNickname
        })

        if (item.replies && item.replies.length > 0) {
          traverse(item.replies, item.username)
        }
      }
    }

    if (comment.replies && comment.replies.length > 0) {
      traverse(comment.replies, undefined)
    }

    result.sort((a, b) => {
      const at = a.node.ctime || 0
      const bt = b.node.ctime || 0
      return at - bt
    })

    return result
  }, [comment.replies])

  return (
    <View style={styles.container}>
      <PaperAvatar
        accessibilityLabel={comment.username}
        size={36}
        source={comment.avatar}
        style={styles.avatar}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.nickname}>{comment.username}</Text>

        <TouchableRipple
          onPress={() => onReply?.(comment)}
          rippleColor="rgba(244, 63, 94, 0.08)"
          style={styles.content}
        >
          <>
            <Text>{comment.content}</Text>
            <Text style={styles.metaText}>
              {formatTimeLabel(comment.ctime)}
            </Text>
          </>
        </TouchableRipple>

        {flatReplies.length > 0 ? (
          <View style={styles.repliesContainer}>
            {flatReplies.map(({ node, parentNickname }) => (
              <ReplyItem
                key={node.comment_id}
                comment={node}
                onReply={onReply}
                parentNickname={parentNickname}
              />
            ))}
          </View>
        ) : null}
      </View>

      <TouchableRipple
        onPress={() => onLike?.(comment.comment_id)}
        rippleColor="rgba(244, 63, 94, 0.08)"
        style={styles.likeContainer}
      >
        <>
          <AntDesign
            name="heart"
            size={14}
            color={comment.has_liked ? '#ff4d4f' : '#999'}
          />
          <Text style={styles.likeCount}>
            {comment.like_count! > 0 ? comment.like_count : ''}
          </Text>
        </>
      </TouchableRipple>
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
    marginBottom: 6,
    borderRadius: 12
  },
  metaText: {
    fontSize: 11,
    color: '#999'
  },
  likeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    width: 30,
    height: 30,
    borderRadius: 15
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
    marginBottom: 4,
    borderRadius: 10
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
