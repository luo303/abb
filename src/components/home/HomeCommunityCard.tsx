import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'

// 计算宽度，与 HomeNavGrid 和 HomeBanner 一致
const { width } = Dimensions.get('window')
const NAV_MARGIN_H = 16
const TARGET_WIDTH = width - NAV_MARGIN_H * 2

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
    alignItems: 'center' // 居中显示
  },
  cardContainer: {
    width: TARGET_WIDTH, // 统一宽度
    backgroundColor: '#fff',
    borderRadius: 24, // 统一圆角
    padding: 15,
    marginBottom: 20, // 下边距可以保留在外部或内部，这里是内部
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // 统一阴影方向
    shadowOpacity: 0.1,
    shadowRadius: 8, // 统一阴影半径
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
    marginBottom: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5'
  },
  userInfo: {
    marginLeft: 12,
    flex: 1
  },
  userName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600'
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
    marginBottom: 12,
    lineHeight: 24
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    marginBottom: 16
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f5f5f5'
  },
  postImagePlaceholder: {
    // 空占位，不显示
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12 // 增加上方间距
    // 移除边框，更干净
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  actionText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6
  }
})
