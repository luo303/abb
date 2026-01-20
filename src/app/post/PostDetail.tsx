import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

import PostHeader from '../../components/post/PostHeader'
import PostBody from '../../components/post/PostBody'
import CommentItem, { Comment } from '../../components/post/CommentItem'
import PostFooter from '../../components/post/PostFooter'

const MOCK_POST = {
  id: '1',
  avatar: require('../../assets/icon.png'), // Using default icon as placeholder
  nickname: '有青春的猫咪脸JAP8',
  description: '宝宝1岁8个月',
  content: '老婆辛苦了❤️\n母女平安，6斤5两\n浓眉大眼双眼皮，随我',
  images: [require('../../assets/icon.png'), require('../../assets/icon.png')],
  publishTime: '2024-05-17',
  location: '周口'
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    avatar: require('../../assets/icon.png'),
    nickname: '用户1',
    content: '具体时间发出来不好吧',
    time: '2025-10-28',
    location: '福建',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        avatar: require('../../assets/icon.png'),
        nickname: '用户2',
        content: '为什么',
        time: '2025-12-24',
        likes: 0,
        replies: [
          {
            id: '1-1-1',
            avatar: require('../../assets/icon.png'),
            nickname: '用户3',
            content: '因为是八字',
            time: '2025-12-25',
            likes: 0,
            replies: [
              {
                id: '1-1-2',
                avatar: require('../../assets/icon.png'),
                nickname: '用户4',
                content:
                  '现在好多都会把这个和出生证明发出来，但就看真不包含差值。',
                time: '2026-01-01',
                location: '广东',
                likes: 2,
                isLiked: false
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    avatar: require('../../assets/icon.png'),
    nickname: '春暖花开的海盗SL72',
    content: '这个爸爸有点虎，生辰八字都给别人看',
    time: '2025-12-29',
    location: '四川',
    likes: 4,
    isLiked: false,
    replies: [
      {
        id: '2-1',
        avatar: require('../../assets/icon.png'),
        nickname: '用户5',
        content: '哈哈，确实有点莽',
        time: '2025-12-30',
        likes: 3,
        replies: [
          {
            id: '2-1-1',
            avatar: require('../../assets/icon.png'),
            nickname: '用户6',
            content: '可能新手爸爸太激动了',
            time: '2025-12-31',
            likes: 1
          }
        ]
      }
    ]
  },
  {
    id: '3',
    avatar: require('../../assets/icon.png'),
    nickname: '何必彷徨的人类之光0EVC',
    content: '现在好多都会把这个和出生证明发出来，但就看真不包含差值。',
    time: '2026-01-01',
    location: '广东',
    likes: 2,
    isLiked: false,
    replies: [
      {
        id: '3-1',
        avatar: require('../../assets/icon.png'),
        nickname: '用户7',
        content: '我觉得还好吧，图个喜庆',
        time: '2026-01-02',
        likes: 2,
        replies: [
          {
            id: '3-1-1',
            avatar: require('../../assets/icon.png'),
            nickname: '用户8',
            content: '主要是怕有心人利用',
            time: '2026-01-03',
            likes: 1,
            replies: [
              {
                id: '3-1-2',
                avatar: require('../../assets/icon.png'),
                nickname: '用户9',
                content: '现在信息泄露太严重了',
                time: '2026-01-04',
                likes: 1,
                isLiked: false
              }
            ]
          }
        ]
      }
    ]
  }
]

export default function PostDetail() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [comments, setComments] = useState(MOCK_COMMENTS)

  const handleLikeComment = (id: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              isLiked: !c.isLiked,
              likes: c.isLiked ? c.likes - 1 : c.likes + 1
            }
          : c
      )
    )
  }

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <PostHeader
          avatar={MOCK_POST.avatar}
          nickname={MOCK_POST.nickname}
          description={MOCK_POST.description}
          isFollowing={isFollowing}
          onFollow={() => setIsFollowing(!isFollowing)}
        />
        <PostBody
          content={MOCK_POST.content}
          images={MOCK_POST.images}
          publishTime={MOCK_POST.publishTime}
          location={MOCK_POST.location}
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
            />
          ))}
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
      <PostFooter />
    </>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: '#fff'
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
