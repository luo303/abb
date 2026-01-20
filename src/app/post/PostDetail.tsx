import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, StatusBar, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
    nickname: '酷飒没头发的陈道6Y5O',
    content: '具体时间发出来不好吧',
    time: '2025-10-28',
    location: '福建',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        avatar: require('../../assets/icon.png'),
        nickname: '看星星的仙酱AZ6B',
        content: '为什么',
        time: '2025-12-24',
        likes: 0
      },
      {
        id: '1-2',
        avatar: require('../../assets/icon.png'),
        nickname: '需要仰望的小宝ATR4',
        content: '回复 看星星的仙酱AZ6B：因为是八字',
        time: '2025-12-25',
        likes: 0
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
    isLiked: false
  },
  {
    id: '3',
    avatar: require('../../assets/icon.png'),
    nickname: '何必彷徨的人类之光0EVC',
    content: '现在好多都会把这个和出生证明发出来，但就看真不包含差值。',
    time: '2026-01-01',
    location: '广东',
    likes: 2,
    isLiked: false
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backBtn: {
    padding: 8
  },
  searchBar: {
    flex: 1,
    height: 32,
    backgroundColor: '#f5f7fa', // Very light grey usually not visible in white header unless customized
    borderRadius: 16,
    marginHorizontal: 12,
    justifyContent: 'center', // Align icon
    alignItems: 'flex-end',
    paddingRight: 0
  },
  moreBtn: {
    padding: 8
  },
  scrollView: {
    flex: 1
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
