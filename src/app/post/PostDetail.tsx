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
import { Comment } from '@/types/post'
import { useMessage } from '@/components/Message'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import { UserMeResponse } from '@/api/profile'
import {
  fetchPostDetail,
  updatePostStats,
  clearCurrentPost,
  addAuthorPostToFollowing,
  toggleFollow as toggleFollowAction
} from '@/store/modules/PostStore'
import { toggleFollow } from '@/api/follow'
import {
  getPostComments,
  getPostCommentReplies,
  CommentApiItem,
  likeComment,
  unlikeComment,
  createPostComment
} from '@/api/home'

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
  const userInfo = useAppSelector(
    state => state.user.userInfo
  ) as UserMeResponse | null

  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const [isFollowing, setIsFollowing] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [isInputVisible, setInputVisible] = useState(false)
  const [replyPlaceholder, setReplyPlaceholder] = useState('说点什么...')
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null)

  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()

  // 加载帖子详情
  useEffect(() => {
    // 清空之前的帖子数据，确保每次进入都是“白屏加载”状态
    dispatch(clearCurrentPost())
    if (postId) {
      dispatch(fetchPostDetail(postId))
    }

    // 卸载时清空状态
    return () => {
      dispatch(clearCurrentPost())
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

  useEffect(() => {
    if (!postId) return
    let isActive = true

    const fetchCommentsTree = async () => {
      setIsCommentsLoading(true)
      try {
        const res = await getPostComments(postId, {
          page: 1,
          page_size: 10,
          strategy: 'ctime'
        })
        if (!isActive) return
        if (res.code !== 0 || !res.data) {
          return
        }
        const parents = res.data.items
        const list: Comment[] = []
        const seenParentIds = new Set<string>()
        for (const item of parents) {
          if (seenParentIds.has(item.comment_id)) {
            continue
          }
          seenParentIds.add(item.comment_id)
          let replies: Comment[] = []
          if (item.reply_count && item.reply_count > 0) {
            replies = await fetchRepliesTree(postId, item.comment_id)
            if (!isActive) return
          }
          list.push(mapApiItemToComment(item, replies))
        }
        setComments(list)
      } catch (error) {
        if (!isActive) return
        console.error('获取评论失败：', error)
      } finally {
        if (isActive) setIsCommentsLoading(false)
      }
    }

    fetchCommentsTree()

    return () => {
      isActive = false
    }
  }, [postId])

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

  const mapApiItemToComment = (item: CommentApiItem, replies: Comment[]) => {
    return {
      comment_id: item.comment_id,
      user_id: item.user_id,
      username: item.username || '稚慧宝用户',
      avatar: item.avatar,
      content: item.content,
      like_count: item.like_count,
      reply_count: item.reply_count,
      ctime: item.ctime,
      utime: item.utime,
      has_liked: item.has_liked,
      replies
    }
  }

  const fetchRepliesTree = async (
    targetPostId: string,
    parentCommentId: string
  ): Promise<Comment[]> => {
    const allItems: CommentApiItem[] = []
    const seenIds = new Set<string>()
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await getPostCommentReplies(targetPostId, parentCommentId, {
        page,
        page_size: 10,
        strategy: 'ctime'
      })
      if (res.code !== 0 || !res.data) {
        break
      }
      for (const item of res.data.items) {
        if (seenIds.has(item.comment_id)) continue
        seenIds.add(item.comment_id)
        allItems.push(item)
      }
      hasMore = res.data.has_more
      page = res.data.page + 1
    }

    const result: Comment[] = []
    for (const item of allItems) {
      let children: Comment[] = []
      if (item.reply_count && item.reply_count > 0) {
        children = await fetchRepliesTree(targetPostId, item.comment_id)
      }
      result.push(mapApiItemToComment(item, children))
    }
    return result
  }

  const findCommentById = (
    items: Comment[],
    targetId: string
  ): Comment | null => {
    for (const item of items) {
      if (item.comment_id === targetId) return item
      if (item.replies && item.replies.length > 0) {
        const found = findCommentById(item.replies, targetId)
        if (found) return found
      }
    }
    return null
  }

  const updateCommentLikeState = (
    items: Comment[],
    targetId: string,
    isLikedBefore: boolean
  ): Comment[] => {
    return items.map(item => {
      if (item.comment_id === targetId) {
        const currentLikes = item.like_count || 0
        const newLikes = currentLikes + (isLikedBefore ? -1 : 1)
        return {
          ...item,
          like_count: newLikes < 0 ? 0 : newLikes,
          has_liked: !isLikedBefore
        }
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: updateCommentLikeState(item.replies, targetId, isLikedBefore)
        }
      }
      return item
    })
  }

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
            dislike_count: Math.max(0, currentPost.dislike_count - 1),
            is_liked: newIsLiked,
            is_disliked: false
          }
        })
      )
    } else {
      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: {
            like_count: newLikes,
            is_liked: newIsLiked
          }
        })
      )
    }
  }

  const handleDoubleTapLike = () => {
    if (isLiked) return
    handleLikePost()
  }

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
            like_count: Math.max(0, currentPost.like_count - 1),
            is_disliked: newIsDisliked,
            is_liked: false
          }
        })
      )
    } else {
      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: {
            dislike_count: newDislikes,
            is_disliked: newIsDisliked
          }
        })
      )
    }
  }

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
        stats: {
          collect_count: newFavorites,
          is_collected: newIsFavorited
        }
      })
    )

    showMessage(newIsFavorited ? '收藏成功' : '取消收藏')
  }

  const handleFollowAuthor = async () => {
    if (!currentPost) return
    try {
      const newIsFollowing = !isFollowing
      setIsFollowing(newIsFollowing)

      console.log('Author ID:', currentPost.author_id)
      console.log('Author ID type:', typeof currentPost.author_id)

      // 乐观更新：当关注作者时，将当前帖子添加到关注列表
      if (newIsFollowing) {
        dispatch(addAuthorPostToFollowing(currentPost))
      }

      // 更新 Redux 中的关注状态
      dispatch(toggleFollowAction(currentPost.author_id as string))

      await toggleFollow(currentPost.author_id as string)
      showMessage(newIsFollowing ? '关注成功' : '取消关注')
    } catch (error) {
      console.error('关注操作失败:', error)
      setIsFollowing(prev => !prev)
      // 失败时回滚 Redux 中的关注状态
      dispatch(toggleFollowAction(currentPost.author_id as string))
      showMessage('操作失败，请稍后重试')
    }
  }

  const handleLikeComment = (id: string) => {
    const target = findCommentById(comments, id)
    if (!target) return

    const prevIsLiked = !!target.has_liked

    setComments(prev => updateCommentLikeState(prev, id, prevIsLiked))
    ;(async () => {
      try {
        if (prevIsLiked) {
          await unlikeComment(id)
        } else {
          await likeComment(id)
        }
      } catch (error) {
        console.error('评论点赞接口失败：', error)
        setComments(prev => updateCommentLikeState(prev, id, !prevIsLiked))
        showMessage('操作失败，请稍后重试')
      }
    })()
  }

  const handleReply = (comment: Comment) => {
    setReplyTarget(comment)
    setReplyPlaceholder(`回复 ${comment.username}：`)
    setInputVisible(true)
  }

  const handleStartInput = () => {
    setReplyTarget(null)
    setReplyPlaceholder('说点什么...')
    setInputVisible(true)
  }

  const handleSend = (text: string) => {
    const content = text.trim()
    if (!content || !postId) return

    const parentId = replyTarget ? replyTarget.comment_id : ''
    const tempId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const now = Date.now()

    const apiItem: CommentApiItem = {
      comment_id: tempId,
      user_id: userInfo?.user_id || '',
      username: userInfo?.username || userInfo?.account || '稚慧宝用户',
      avatar: userInfo?.avatar || '',
      content,
      like_count: 0,
      reply_count: 0,
      ctime: now,
      utime: now,
      has_liked: false
    }

    const newComment: Comment = mapApiItemToComment(apiItem, [])

    if (replyTarget) {
      const addReply = (items: Comment[]): Comment[] => {
        return items.map(item => {
          if (item.comment_id === replyTarget.comment_id) {
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

    setInputVisible(false)
    ;(async () => {
      try {
        const res = await createPostComment(postId, {
          parent_id: parentId,
          content
        })

        if (res.code !== 0 || !res.data) {
          throw new Error(res.message || '评论失败')
        }

        const serverId = res.data.comment_id

        const replaceId = (items: Comment[]): Comment[] => {
          return items.map(item => {
            if (item.comment_id === tempId) {
              return {
                ...item,
                comment_id: serverId
              }
            }
            if (item.replies && item.replies.length > 0) {
              return {
                ...item,
                replies: replaceId(item.replies)
              }
            }
            return item
          })
        }

        setComments(prev => replaceId(prev))
      } catch (error) {
        const removeTemp = (items: Comment[]): Comment[] => {
          const result: Comment[] = []
          for (const item of items) {
            if (item.comment_id === tempId) {
              continue
            }
            if (item.replies && item.replies.length > 0) {
              result.push({
                ...item,
                replies: removeTemp(item.replies)
              })
            } else {
              result.push(item)
            }
          }
          return result
        }

        setComments(prev => removeTemp(prev))
        showMessage('评论失败，请稍后重试')
      }
    })()
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
            title={currentPost.title}
            content={
              typeof currentPost.content === 'string'
                ? currentPost.content
                : JSON.stringify(currentPost.content)
            }
            tags={currentPost.tags}
            images={displayImages}
            publishTime={formatDate(currentPost.ctime)}
            location={
              currentPost.author_province && currentPost.author_city
                ? `${currentPost.author_province} ${currentPost.author_city}`
                : currentPost.author_city
            }
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

        {isCommentsLoading ? (
          <View style={styles.commentsLoading}>
            <ActivityIndicator size="small" color="#f43f5e" />
            <Text style={{ color: '#999', marginTop: 8 }}>加载评论中...</Text>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.commentsEmpty}>
            <Text style={styles.commentsEmptyText}>
              还没有评论，来做第一个吧
            </Text>
          </View>
        ) : (
          <View style={styles.commentsList}>
            {comments.map((comment, index) => (
              <CommentItem
                key={`comment-${comment.comment_id}-${index}`}
                comment={comment}
                onLike={handleLikeComment}
                onReply={handleReply}
              />
            ))}
          </View>
        )}
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
  },
  commentsLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentsEmpty: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  commentsEmptyText: {
    color: '#999',
    fontSize: 13
  }
})
