import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import PostHeader from '../../components/post/PostHeader'
import PostBody from '../../components/post/PostBody'
import CommentItem from '../../components/post/CommentItem'
import PostFooter from '../../components/post/PostFooter'
import ReplyInput from '../../components/post/ReplyInput'
import { MOCK_POSTS, MOCK_COMMENTS } from '@/data/mock/homePosts'
import { Comment } from '@/types/post'
import { useMessage } from '@/components/Message'

export default function PostDetail() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [isInputVisible, setInputVisible] = useState(false)
  const [replyPlaceholder, setReplyPlaceholder] = useState('说点什么...')
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null)

  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()

  const handleLikeComment = (id: string) => {
    setComments(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              likes: item.isLiked ? item.likes! - 1 : item.likes! + 1,
              isLiked: !item.isLiked
            }
          : item
      )
    )
  }

  const handleReply = (comment: Comment) => {
    setReplyTarget(comment)
    setReplyPlaceholder(`回复 ${comment.nickname}：`)
    setInputVisible(true)
  }

  const handleStartInput = () => {
    setReplyTarget(null)
    setReplyPlaceholder('说点什么...')
    setInputVisible(true)
  }

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const newComment: Comment = {
      id: Date.now().toString(),
      avatar: require('../../assets/icon.png'), // 默认头像
      nickname: '我', // 模拟当前用户
      content: text,
      time: '刚刚',
      location: '北京',
      likes: 0,
      isLiked: false,
      replies: []
    }

    if (replyTarget) {
      // 如果是回复某个评论，则添加到该评论的 replies 中
      const addReply = (items: Comment[]): Comment[] => {
        return items.map(item => {
          if (item.id === replyTarget.id) {
            return {
              ...item,
              replies: [...(item.replies || []), newComment]
            }
          } else if (item.replies && item.replies.length > 0) {
            return {
              ...item,
              replies: addReply(item.replies)
            }
          }
          return item
        })
      }
      setComments(prev => addReply(prev))
    } else {
      // 如果是发表新评论，则添加到根列表中
      setComments(prev => [newComment, ...prev])
    }
    showMessage('评论成功')
    setInputVisible(false)
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        <PostHeader
          avatar={MOCK_POSTS[0].avatar}
          nickname={MOCK_POSTS[0].nickname}
          description={MOCK_POSTS[0].description}
          isFollowing={isFollowing}
          onFollow={() => setIsFollowing(!isFollowing)}
        />
        <PostBody
          content={MOCK_POSTS[0].content}
          images={MOCK_POSTS[0].images}
          publishTime={MOCK_POSTS[0].publishTime}
          location={MOCK_POSTS[0].location}
        />
        <View style={styles.divider} />
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>回帖 {comments.length}</Text>
          <View style={styles.filterContainer}>
            <Text style={styles.filterText}>热门</Text>
            <AntDesign
              name="down"
              size={10}
              color="#999"
              style={{ marginLeft: 2 }}
            />
          </View>
        </View>
        <View style={styles.tipContainer}>
          <View style={styles.tipIcon} />
          <Text style={styles.tipText}>优秀回帖将会被优先展示</Text>
          <View style={styles.uIcon}>
            <Text style={styles.uText}>U</Text>
          </View>
        </View>
        <View style={styles.commentsList}>
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLikeComment}
              onReply={handleReply}
            />
          ))}
        </View>
      </ScrollView>

      {/* 底部常驻栏 */}
      <View style={[styles.footerWrapper, { paddingBottom: insets.bottom }]}>
        <PostFooter onInputPress={handleStartInput} />
      </View>

      {/* 真正的输入框 Modal */}
      <ReplyInput
        visible={isInputVisible}
        placeholder={replyPlaceholder}
        onSend={handleSend}
        onDismiss={() => setInputVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1
  },
  footerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  divider: {
    height: 8,
    backgroundColor: '#f5f7fa'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333'
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  filterText: {
    fontSize: 12,
    color: '#999'
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8
  },
  tipIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#eee',
    marginRight: 8
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#999'
  },
  uIcon: {
    backgroundColor: '#ffba00',
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  uText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  commentsList: {
    paddingBottom: 20
  }
})
