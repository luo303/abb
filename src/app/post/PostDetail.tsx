import React, { useState, useEffect, useMemo } from 'react'
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
import { MOCK_COMMENTS } from '@/data/mock/homePosts'
import { Comment } from '@/types/post'
import { useMessage } from '@/components/Message'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import {
  fetchPostDetail,
  updatePostStats,
  toggleFollow
} from '@/store/modules/PostStore'

type PostDetailRouteProp = RouteProp<
  { params: { id: string; post_id: string } },
  'params'
>

export default function PostDetail() {
  const route = useRoute<PostDetailRouteProp>()
  const { id, post_id } = route.params || {}
  const postId = post_id || id

  const dispatch = useAppDispatch()
  const { currentPost, loading: isLoading } = useAppSelector(
    state => state.post
  )

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

  // 加载帖子详情
  useEffect(() => {
    if (postId) {
      dispatch(fetchPostDetail(postId))
    }
  }, [dispatch, postId])

  // 初始化交互状态（仅在 post 加载完成后执行一次）
  useEffect(() => {
    if (currentPost) {
      setIsLiked(currentPost.like_count > 0 && Math.random() > 0.5) // 模拟：随机初始状态
      setIsDisliked(false)
      setIsFavorited(false)
      setIsFollowing(currentPost.is_followed || false)
    }
  }, [currentPost?.post_id])

  // 处理显示数据：头像和图片
  const displayAvatar = useMemo(() => {
    if (!currentPost?.author_avatar) {
      return require('@/assets/testAvatar.png')
    }
    return typeof currentPost.author_avatar === 'string'
      ? { uri: currentPost.author_avatar }
      : currentPost.author_avatar
  }, [currentPost?.author_avatar])

  const displayImages = useMemo(() => {
    if (!currentPost) return []
    if (currentPost.images && currentPost.images.length > 0) {
      return currentPost.images
    }
    if (currentPost.cover) {
      return [currentPost.cover]
    }
    return []
  }, [currentPost])

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  // 处理帖子点赞
  const handleLikePost = () => {
    if (!currentPost) return

    const newIsLiked = !isLiked
    // 简单的计数逻辑，实际应由后端返回
    const newLikes = newIsLiked
      ? currentPost.like_count + 1
      : Math.max(0, currentPost.like_count - 1)

    setIsLiked(newIsLiked)
    if (newIsLiked && isDisliked) {
      setIsDisliked(false)
      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: {
            like_count: newLikes,
            dislike_count: Math.max(0, currentPost.dislike_count - 1)
          }
        })
      )
    } else {
      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: { like_count: newLikes }
        })
      )
    }
  }

  // 处理双击点赞
  const handleDoubleTapLike = () => {
    if (isLiked) return
    handleLikePost()
  }

  // 处理帖子踩
  const handleDislikePost = () => {
    if (!currentPost) return

    const newIsDisliked = !isDisliked
    const newDislikes = newIsDisliked
      ? currentPost.dislike_count + 1
      : Math.max(0, currentPost.dislike_count - 1)

    setIsDisliked(newIsDisliked)
    if (newIsDisliked && isLiked) {
      setIsLiked(false)
      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: {
            dislike_count: newDislikes,
            like_count: Math.max(0, currentPost.like_count - 1)
          }
        })
      )
    } else {
      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: { dislike_count: newDislikes }
        })
      )
    }
  }

  // 处理帖子收藏
  const handleFavoritePost = () => {
    if (!currentPost) return
    const newIsFavorited = !isFavorited
    const newFavorites = newIsFavorited
      ? currentPost.collect_count + 1
      : Math.max(0, currentPost.collect_count - 1)

    setIsFavorited(newIsFavorited)
    dispatch(
      updatePostStats({
        postId: currentPost.post_id,
        stats: { collect_count: newFavorites }
      })
    )

    showMessage(newIsFavorited ? '收藏成功' : '取消收藏')
  }

  // 处理关注作者
  const handleFollowAuthor = () => {
    if (!currentPost) return
    const newIsFollowing = !isFollowing
    setIsFollowing(newIsFollowing)
    dispatch(toggleFollow(currentPost.author_id))
    showMessage(newIsFollowing ? '关注成功' : '取消关注')
  }

  // ... 评论相关逻辑保持不变 ...
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
      avatar: require('../../assets/icon.png'),
      nickname: '我',
      content: text,
      time: '刚刚',
      location: '北京',
      likes: 0,
      isLiked: false,
      replies: []
    }

    if (replyTarget) {
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
      setComments(prev => [newComment, ...prev])
      if (currentPost) {
        const newCommentsCount = currentPost.comment_count + 1
        dispatch(
          updatePostStats({
            postId: currentPost.post_id,
            stats: { comment_count: newCommentsCount }
          })
        )
      }
    }
    showMessage('评论成功')
    setInputVisible(false)
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#f43f5e" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  if (!currentPost) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>未找到帖子内容</Text>
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
          avatar={displayAvatar}
          nickname={currentPost.author_name}
          description={currentPost.baby_age_text}
          isFollowing={isFollowing}
          onFollow={handleFollowAuthor}
        />
        <DoubleTapLike onLike={handleDoubleTapLike}>
          <PostBody
            content={currentPost.content}
            tags={currentPost.tags}
            images={displayImages}
            publishTime={formatDate(currentPost.ctime)}
            location={currentPost.author_city}
          />
        </DoubleTapLike>

        <View style={styles.divider} />

        {/* 评论区头部 */}
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
          likeCount={currentPost.like_count}
          dislikeCount={currentPost.dislike_count}
          collectCount={currentPost.collect_count}
          commentCount={currentPost.comment_count}
          isLiked={isLiked}
          isDisliked={isDisliked}
          isFavorited={isFavorited}
          onLike={handleLikePost}
          onDislike={handleDislikePost}
          onFavorite={handleFavoritePost}
        />
      </View>

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
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#999'
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
