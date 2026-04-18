import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Platform,
  TextInput,
  Alert,
  Keyboard,
  LayoutChangeEvent,
  TouchableOpacity
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { FlashListRef } from '@shopify/flash-list'
import { AntDesign } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native'

import KeyboardStickyFooter from '../../components/common/KeyboardStickyFooter'
import PostHeader from '../../components/post/PostHeader'
import PostBody from '../../components/post/PostBody'
import CommentItem from '../../components/post/CommentItem'
import PostFooter from '../../components/post/PostFooter'

import DoubleTapLike from '../../components/post/DoubleTapLike'
import { Comment } from '@/types/post'
import { useMessage } from '@/components/Message'
import { useAppSelector, useAppDispatch } from '@/hooks/redux'
import { UserMeResponse } from '@/api/profile'
import {
  fetchPostDetail,
  fetchPostList,
  updatePostStats,
  clearCurrentPost,
  addAuthorPostToFollowing,
  removeAuthorPostFromFollowing,
  fetchFollowingPosts
} from '@/store/modules/PostStore'
import {
  followUser as followUserApi,
  unfollowUser as unfollowUserApi
} from '@/api/follow'
import { followUser, unfollowUser } from '@/store/modules/FollowStore'
import {
  getPostComments,
  getPostCommentReplies,
  CommentApiItem,
  likeComment,
  unlikeComment,
  createPostComment
} from '@/api/home'
import {
  likePost,
  unlikePost,
  collectPost,
  uncollectPost,
  deletePost
} from '@/api/post'
import type { NavigationProps } from '@/types/navigation'

type PostDetailRouteProp = RouteProp<
  { params: { id: string; post_id: string } },
  'params'
>

const formatDate = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const mapApiItemToComment = (
  item: CommentApiItem,
  replies: Comment[]
): Comment => {
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

export default function PostDetail() {
  const route = useRoute<PostDetailRouteProp>()
  const { id, post_id } = route.params || {}
  const postId = post_id || id

  const dispatch = useAppDispatch()
  const navigation = useNavigation<NavigationProps>()
  const { currentPost, loading: isLoading } = useAppSelector(
    state => state.post
  )
  const userInfo = useAppSelector(
    state => state.user.userInfo
  ) as UserMeResponse | null
  const isOwnPost = useMemo(() => {
    if (!currentPost?.author_id || !userInfo?.user_id) return false
    return String(currentPost.author_id) === String(userInfo.user_id)
  }, [currentPost?.author_id, userInfo?.user_id])

  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [isCommentsLoading, setIsCommentsLoading] = useState(false)
  const [replyPlaceholder, setReplyPlaceholder] = useState('说点什么...')
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null)

  const insets = useSafeAreaInsets()
  const { showMessage } = useMessage()
  const listRef = useRef<FlashListRef<any>>(null)
  const scrollOffsetRef = useRef(0)
  const inputRef = useRef<TextInput>(null)
  const [inputText, setInputText] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [footerHeight, setFooterHeight] = useState(76)
  const [isDeletingPost, setIsDeletingPost] = useState(false)
  const deleteControllerRef = useRef<AbortController | null>(null)

  const cancelOngoingDelete = useCallback(() => {
    if (deleteControllerRef.current) {
      deleteControllerRef.current.abort()
    }
    const controller = new AbortController()
    deleteControllerRef.current = controller
    return controller.signal
  }, [])

  useEffect(() => {
    return () => {
      if (deleteControllerRef.current) {
        deleteControllerRef.current.abort()
      }
    }
  }, [])

  // 从 FollowStore 获取关注状态：根据作者ID判断是否关注
  const isFollowingFromStore = useAppSelector(state => {
    if (!currentPost) return false
    return state.follow.followingIds.includes(currentPost.author_id)
  })
  const isFollowing = useMemo(() => {
    const isFollowingFromApi = !!(
      currentPost?.is_follow ?? currentPost?.is_followed
    )
    return isFollowingFromApi || isFollowingFromStore
  }, [currentPost?.is_follow, currentPost?.is_followed, isFollowingFromStore])

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
      setIsLiked(!!(currentPost.is_like ?? currentPost.is_liked))
      setIsDisliked(!!(currentPost.is_dislike ?? currentPost.is_disliked))
      setIsFavorited(!!(currentPost.is_collect ?? currentPost.is_collected))
    }
  }, [currentPost])

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
    return currentPost?.author_avatar || null
  }, [currentPost?.author_avatar])

  const displayImages = useMemo(() => {
    if (currentPost?.images && currentPost.images.length > 0) {
      return currentPost.images
    }
    if (currentPost?.cover) {
      return [currentPost.cover]
    }
    return []
  }, [currentPost?.images, currentPost?.cover])

  const displayContent = useMemo(() => {
    if (!currentPost) return ''
    return typeof currentPost.content === 'string'
      ? currentPost.content
      : JSON.stringify(currentPost.content)
  }, [currentPost])

  const restoreScrollPosition = useCallback(() => {
    if (Platform.OS !== 'android') return
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: scrollOffsetRef.current,
        animated: false
      })
    })
  }, [])

  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isCollectLoading, setIsCollectLoading] = useState(false)

  const handleLikePost = useCallback(() => {
    if (!currentPost) return
    if (isLikeLoading) return

    const newIsLiked = !isLiked
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
            is_like: newIsLiked,
            is_liked: newIsLiked,
            is_dislike: false,
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
            is_like: newIsLiked,
            is_liked: newIsLiked
          }
        })
      )
    }
    ;(async () => {
      try {
        setIsLikeLoading(true)
        if (newIsLiked) {
          const res = await likePost(currentPost.post_id)
          console.log('like post res:', res)
        } else {
          const res = await unlikePost(currentPost.post_id)
          console.log('unlike post res:', res)
        }
      } catch {
        const rollbackLikes = newIsLiked
          ? Math.max(0, newLikes - 1)
          : newLikes + 1
        setIsLiked(!newIsLiked)
        dispatch(
          updatePostStats({
            postId: currentPost.post_id,
            stats: {
              like_count: rollbackLikes,
              is_like: !newIsLiked,
              is_liked: !newIsLiked
            }
          })
        )
        showMessage('操作失败，请稍后重试')
      } finally {
        setIsLikeLoading(false)
      }
    })()
  }, [currentPost, dispatch, isDisliked, isLikeLoading, isLiked, showMessage])

  const handleDoubleTapLike = useCallback(() => {
    if (isLiked) return
    handleLikePost()
  }, [handleLikePost, isLiked])

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
            is_dislike: newIsDisliked,
            is_disliked: newIsDisliked,
            is_like: false,
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
            is_dislike: newIsDisliked,
            is_disliked: newIsDisliked
          }
        })
      )
    }
  }

  const handleFavoritePost = () => {
    if (!currentPost) return
    if (isCollectLoading) return
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
          is_collect: newIsFavorited,
          is_collected: newIsFavorited
        }
      })
    )
    restoreScrollPosition()
    ;(async () => {
      try {
        setIsCollectLoading(true)
        if (newIsFavorited) {
          await collectPost(currentPost.post_id)
        } else {
          await uncollectPost(currentPost.post_id)
        }
      } catch {
        const rollbackCount = newIsFavorited
          ? Math.max(0, newFavorites - 1)
          : newFavorites + 1
        setIsFavorited(!newIsFavorited)
        dispatch(
          updatePostStats({
            postId: currentPost.post_id,
            stats: {
              collect_count: rollbackCount,
              is_collect: !newIsFavorited,
              is_collected: !newIsFavorited
            }
          })
        )
        showMessage('操作失败，请稍后重试')
      } finally {
        setIsCollectLoading(false)
      }
    })()
  }

  // 防抖处理：防止连续快速点击
  const [isFollowingLoading, setIsFollowingLoading] = useState(false)

  const handleFollowAuthor = useCallback(async () => {
    if (!currentPost || isFollowingLoading) return
    const newIsFollowing = !isFollowing

    try {
      setIsFollowingLoading(true)

      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: {
            is_follow: newIsFollowing,
            is_followed: newIsFollowing
          }
        })
      )

      // 乐观更新：更新FollowStore中的关注状态
      if (newIsFollowing) {
        dispatch(followUser(currentPost.author_id as string))
        // 同时将当前帖子添加到关注列表
        dispatch(
          addAuthorPostToFollowing({
            ...currentPost,
            is_follow: true,
            is_followed: true
          })
        )
      } else {
        dispatch(unfollowUser(currentPost.author_id as string))
        // 同时从关注列表中移除该帖子
        dispatch(removeAuthorPostFromFollowing(currentPost.post_id))
      }

      if (newIsFollowing) {
        await followUserApi(currentPost.author_id as string)
      } else {
        await unfollowUserApi(currentPost.author_id as string)
      }
      await dispatch(fetchFollowingPosts({ page: 1, force: true }))
    } catch (error) {
      console.error('关注操作失败:', error)
      // 失败时回滚状态
      if (newIsFollowing) {
        dispatch(unfollowUser(currentPost.author_id as string))
        dispatch(removeAuthorPostFromFollowing(currentPost.post_id))
      } else {
        dispatch(followUser(currentPost.author_id as string))
        dispatch(
          addAuthorPostToFollowing({
            ...currentPost,
            is_follow: true,
            is_followed: true
          })
        )
      }
      dispatch(
        updatePostStats({
          postId: currentPost.post_id,
          stats: {
            is_follow: !newIsFollowing,
            is_followed: !newIsFollowing
          }
        })
      )
      showMessage('操作失败，请稍后重试')
    } finally {
      // 延迟一点时间，确保用户无法连续点击
      setTimeout(() => {
        setIsFollowingLoading(false)
      }, 500)
    }
  }, [currentPost, dispatch, isFollowing, isFollowingLoading, showMessage])

  const handleLikeComment = useCallback(
    (id: string) => {
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
    },
    [comments, showMessage]
  )

  const handleStartInput = useCallback(() => {
    if (!isInputFocused && !inputText.trim()) {
      setReplyTarget(null)
      setReplyPlaceholder('说点什么...')
    }
    setIsInputFocused(true)
    inputRef.current?.focus()
  }, [inputText, isInputFocused])

  const handleReply = useCallback((comment: Comment) => {
    setReplyTarget(comment)
    setReplyPlaceholder(`回复 ${comment.username}：`)
    setIsInputFocused(true)
    inputRef.current?.focus()
  }, [])

  const handleFooterLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.ceil(event.nativeEvent.layout.height)
    setFooterHeight(prev => (prev === nextHeight ? prev : nextHeight))
  }, [])

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
      } catch {
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

  const refreshHomeLists = useCallback(() => {
    void dispatch(fetchPostList({ page: 1, strategy: 'random', force: true }))
    void dispatch(fetchPostList({ page: 1, strategy: 'hot', force: true }))
    void dispatch(fetchFollowingPosts({ page: 1, force: true }))
  }, [dispatch])

  const doDeletePost = useCallback(async () => {
    if (!postId) return
    if (isDeletingPost) return
    setIsDeletingPost(true)
    try {
      const signal = cancelOngoingDelete()
      await deletePost(postId, { signal })
      showMessage('已删除')
      refreshHomeLists()
      navigation.goBack()
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : '删除失败'
      if (message.includes('不存在') || message.includes('已删除')) {
        showMessage('帖子不存在或已删除')
        refreshHomeLists()
        navigation.goBack()
        return
      }
      Alert.alert('提示', message)
    } finally {
      setIsDeletingPost(false)
    }
  }, [
    cancelOngoingDelete,
    isDeletingPost,
    navigation,
    postId,
    refreshHomeLists,
    showMessage
  ])

  const handleDeletePost = useCallback(() => {
    if (isDeletingPost) return
    Alert.alert('确认删除', '确定要删除这条帖子吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => void doDeletePost() }
    ])
  }, [doDeletePost, isDeletingPost])

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <PostHeader
          avatar={displayAvatar}
          nickname={currentPost?.author_name || ''}
          description={currentPost?.baby_age_text || ''}
          isFollowing={isFollowing}
          onFollow={handleFollowAuthor}
          showFollow={!isOwnPost}
          rightAccessory={
            isOwnPost ? (
              <TouchableOpacity
                onPress={handleDeletePost}
                activeOpacity={0.8}
                disabled={isDeletingPost}
                style={[
                  styles.deleteButton,
                  isDeletingPost && styles.deleteButtonDisabled
                ]}
              >
                <AntDesign
                  name="delete"
                  size={16}
                  color={isDeletingPost ? '#fca5a5' : '#ef4444'}
                />
                <Text
                  style={[
                    styles.deleteButtonText,
                    isDeletingPost && styles.deleteButtonTextDisabled
                  ]}
                >
                  删除
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
        <DoubleTapLike onLike={handleDoubleTapLike}>
          <PostBody
            title={currentPost?.title || ''}
            content={displayContent}
            tags={currentPost?.tags || []}
            images={displayImages}
            publishTime={formatDate(currentPost?.ctime || Date.now())}
            location={
              currentPost?.author_province && currentPost?.author_city
                ? `${currentPost.author_province} ${currentPost.author_city}`
                : currentPost?.author_city || ''
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

        {isCommentsLoading && (
          <View style={styles.commentsLoading}>
            <ActivityIndicator size="small" color="#f43f5e" />
            <Text style={{ color: '#999', marginTop: 8 }}>加载评论中...</Text>
          </View>
        )}

        {!isCommentsLoading && comments.length === 0 && (
          <View style={styles.commentsEmpty}>
            <Text style={styles.commentsEmptyText}>
              还没有评论，来做第一个吧
            </Text>
          </View>
        )}
      </>
    ),
    [
      currentPost,
      displayAvatar,
      isFollowing,
      handleFollowAuthor,
      isOwnPost,
      handleDeletePost,
      isDeletingPost,
      handleDoubleTapLike,
      displayContent,
      displayImages,
      comments.length,
      isCommentsLoading
    ]
  )

  const keyExtractor = useCallback((item: Comment) => item.comment_id, [])

  const renderCommentItem = useCallback(
    ({ item }: { item: Comment }) => {
      return (
        <CommentItem
          comment={item}
          onLike={handleLikeComment}
          onReply={handleReply}
        />
      )
    },
    [handleLikeComment, handleReply]
  )

  const handleListScroll = useCallback((event: any) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y
  }, [])

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
      <FlashList
        ref={listRef}
        data={comments}
        keyExtractor={keyExtractor}
        renderItem={renderCommentItem}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={{
          paddingBottom: footerHeight + 12
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleListScroll}
        scrollEventThrottle={16}
      />

      <KeyboardStickyFooter style={styles.inputSticky}>
        <PostFooter
          onLayout={handleFooterLayout}
          onInputPress={handleStartInput}
          inputRef={inputRef}
          inputValue={inputText}
          inputPlaceholder={replyPlaceholder}
          onInputChangeText={setInputText}
          onInputFocus={() => {
            setIsInputFocused(true)
          }}
          onInputBlur={() => {
            if (!inputText.trim()) {
              setReplyTarget(null)
              setReplyPlaceholder('说点什么...')
              setIsInputFocused(false)
            }
          }}
          onSend={() => {
            if (!inputText.trim()) return
            handleSend(inputText)
            setInputText('')
            setReplyTarget(null)
            setReplyPlaceholder('说点什么...')
            setIsInputFocused(false)
            Keyboard.dismiss()
          }}
          isComposerActive={isInputFocused}
          bottomInset={Platform.OS === 'ios' ? insets.bottom : 0}
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
      </KeyboardStickyFooter>
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
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff'
  },
  deleteButtonDisabled: {
    opacity: 0.7
  },
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444'
  },
  deleteButtonTextDisabled: {
    color: '#fca5a5'
  },
  inputSticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000
  }
})
