import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'

interface HomeCommunityCardProps {
  data: any
}

export default function HomeCommunityCard({ data }: HomeCommunityCardProps) {
  const navigation = useNavigation<NavigationProps>()
  return (
    <TouchableOpacity
      style={styles.communityContainer}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PostDetail', { id: data.id })}
    >
      <View style={styles.cardContainer}>
        {/* 用户信息行 */}
        <View style={styles.userInfoRow}>
          <Image source={data.avatar} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{data.nickname}</Text>
            {/* 显示宝宝年龄描述，与详情页保持一致 */}
            <Text style={styles.userDesc}>{data.description}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{data.publishTime}</Text>
            <Text style={styles.timeText}>{data.location}</Text>
          </View>
        </View>

        {/* 帖子内容 - 只显示第一行或者截断 */}
        <Text style={styles.postContent} numberOfLines={2} ellipsizeMode="tail">
          {data.content}
        </Text>

        {/* 图片网格 */}
        <View style={styles.imageGrid}>
          {data.images.map((img: any, index: number) => (
            <Image key={index} source={img} style={styles.postImage} />
          ))}
          {/* 占位，保持布局平衡如果图片少于3张 */}
          {data.images.length < 3 && (
            <View style={styles.postImagePlaceholder} />
          )}
        </View>

        {/* 底部交互栏 */}
        <View style={styles.actionRow}>
          <View style={styles.actionItem}>
            <Ionicons name="heart-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{data.stats.likes}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="heart-dislike-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{data.stats.dislikes}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="star-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{data.stats.favorites}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
            <Text style={styles.actionText}>{data.stats.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  communityContainer: {
    // 确保点击区域正常
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    padding: 15,
    marginBottom: 20,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  header: {
    marginBottom: 15
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee'
  },
  userInfo: {
    marginLeft: 10,
    flex: 1
  },
  userName: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold'
  },
  userDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  },
  dateContainer: {
    alignItems: 'flex-end'
  },
  dateText: {
    fontSize: 12,
    color: '#999'
  },
  timeText: {
    fontSize: 12,
    color: '#999'
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    lineHeight: 22
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // 改为左对齐
    gap: 10, // 使用 gap 属性控制间距
    marginBottom: 15
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0'
  },
  postImagePlaceholder: {
    // 空占位，不显示
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  }
})
