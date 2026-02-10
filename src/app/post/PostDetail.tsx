import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator
} from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRoute, RouteProp } from '@react-navigation/native'

import PostHeader from '../../components/post/PostHeader'
import PostBody from '../../components/post/PostBody'
import CommentItem from '../../components/post/CommentItem'
import PostFooter from '../../components/post/PostFooter'
import ReplyInput from '../../components/post/ReplyInput'
import DoubleTapLike from '../../components/post/DoubleTapLike'
import {
  MOCK_COMMENTS,
  getMockPostById,
  updateMockPost
} from '@/data/mock/homePosts'
import { Comment } from '@/types/post'
import { useMessage } from '@/components/Message'

type PostDetailRouteProp = RouteProp<{ params: { id: string } }, 'params'>

export default function PostDetail() {
  const route = useRoute<PostDetailRouteProp>()
  const { id } = route.params || {} // 获取路由参数中的 ID

  const [post, setPost] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const [isFollowing, setIsFollowing] = useState(false)
  const [comments, setComments] = useState(MOCK_COMMENTS)
  const [isInputVisible, setInputVisible] = useState(false)
  const [replyPlaceholder, setReplyPlaceholder] = useState('说点什么...')
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null)

  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()

  // 初始化加载数据
  useEffect(() => {
    if (id) {
      const data = getMockPostById(id)
      if (data) {
        setPost(data)
        // 模拟：随机生成初始点赞状态，或者从数据中获取（如果数据支持）
        // 这里简单处理：默认未点赞
        setIsLiked(false)
        setIsDisliked(false)
        setIsFavorited(false)
      }
    }
  }, [id])

  // 处理帖子点赞
  const handleLikePost = () => {
    if (!post) return

    // 如果当前是 Dislike 状态，先取消 Dislike
    const newIsDisliked = false
    const newDislikes = isDisliked
      ? post.stats.dislikes - 1
      : post.stats.dislikes

    const newIsLiked = !isLiked
    const newLikes = newIsLiked ? post.stats.likes + 1 : post.stats.likes - 1

    // 更新本地 UI 状态
    setIsLiked(newIsLiked)
    setIsDisliked(newIsDisliked)

    setPost((prev: any) => ({
      ...prev,
      stats: { ...prev.stats, likes: newLikes, dislikes: newDislikes }
    }))

    // 同步更新到 Mock 数据源
    updateMockPost(post.id, {
      stats: { likes: newLikes, dislikes: newDislikes }
    })
  }

  // 处理双击点赞（只点赞，不取消）
  const handleDoubleTapLike = () => {
    if (isLiked) return // 已经点赞了就不重复处理（组件内部会有爱心动画）
    handleLikePost()
  }

  // 处理帖子踩/不喜欢
  const handleDislikePost = () => {
    if (!post) return

    // 如果当前是 Like 状态，先取消 Like
    const newIsLiked = false
    const newLikes = isLiked ? post.stats.likes - 1 : post.stats.likes

    const newIsDisliked = !isDisliked
    const newDislikes = newIsDisliked
      ? (post.stats.dislikes || 0) + 1
      : (post.stats.dislikes || 0) - 1

    // 更新本地 UI 状态
    setIsLiked(newIsLiked)
    setIsDisliked(newIsDisliked)

    setPost((prev: any) => ({
      ...prev,
      stats: { ...prev.stats, likes: newLikes, dislikes: newDislikes }
    }))

    // 同步更新到 Mock 数据源
    updateMockPost(post.id, {
      stats: { likes: newLikes, dislikes: newDislikes }
    })
  }

  // 处理帖子收藏
  const handleFavoritePost = () => {
    if (!post) return
    const newIsFavorited = !isFavorited
    const newFavorites = newIsFavorited
      ? post.stats.favorites + 1
      : post.stats.favorites - 1

    setIsFavorited(newIsFavorited)
    setPost((prev: any) => ({
      ...prev,
      stats: { ...prev.stats, favorites: newFavorites }
    }))

    updateMockPost(post.id, {
      stats: { favorites: newFavorites }
    })

    showMessage(newIsFavorited ? '收藏成功' : '取消收藏')
  }

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
      // 同步更新帖子评论数
      if (post) {
        const newCommentsCount = post.stats.comments + 1
        setPost((prev: any) => ({
          ...prev,
          stats: { ...prev.stats, comments: newCommentsCount }
        }))
        updateMockPost(post.id, {
          stats: { comments: newCommentsCount }
        })
      }
    }
    showMessage('评论成功')
    setInputVisible(false)
  }

  if (!post) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' }
        ]}
      >
        <ActivityIndicator size="large" color="#f43f5e" />
        <Text style={{ marginTop: 10, color: '#999' }}>加载中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        <PostHeader
          avatar={post.avatar}
          nickname={post.nickname}
          description={post.description}
          isFollowing={isFollowing}
          onFollow={() => setIsFollowing(!isFollowing)}
        />
        <DoubleTapLike onLike={handleDoubleTapLike}>
          <PostBody
            content={post.content}
            tags={post.tags}
            images={post.images}
            publishTime={post.publishTime}
            location={post.location}
          />
        </DoubleTapLike>
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
              key={`comment-${comment.id}`}
              comment={comment}
              onLike={handleLikeComment}
              onReply={handleReply}
            />
          ))}
        </View>
      </ScrollView>

      {/* 底部常驻栏 */}
      <View style={[styles.footerWrapper, { paddingBottom: insets.bottom }]}>
        <PostFooter
          onInputPress={handleStartInput}
          stats={post.stats}
          isLiked={isLiked}
          isDisliked={isDisliked}
          isFavorited={isFavorited}
          onLike={handleLikePost}
          onDislike={handleDislikePost}
          onFavorite={handleFavoritePost}
        />
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
