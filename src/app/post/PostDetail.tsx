import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Text } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

import PostHeader from '../../components/post/PostHeader'
import PostBody from '../../components/post/PostBody'
import CommentItem from '../../components/post/CommentItem'
import PostFooter from '../../components/post/PostFooter'
import { MOCK_POSTS, MOCK_COMMENTS } from '@/data/mock/homePosts'

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
