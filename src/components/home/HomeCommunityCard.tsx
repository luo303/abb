import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import { LinearGradient } from 'expo-linear-gradient'

// 计算宽度，与 HomeNavGrid 和 HomeBanner 一致
const { width } = Dimensions.get('window')
const NAV_MARGIN_H = 16
const TARGET_WIDTH = width - NAV_MARGIN_H * 2
const CARD_PADDING = 15
const CAROUSEL_WIDTH = TARGET_WIDTH - CARD_PADDING * 2
const GAP = 8
const ITEM_WIDTH = (CAROUSEL_WIDTH - GAP * 2) / 3 // 减去间距计算每个item宽度
const ITEM_HEIGHT = ITEM_WIDTH

interface HomeCommunityCardProps {
  data: any
}

export default function HomeCommunityCard({ data }: HomeCommunityCardProps) {
  const navigation = useNavigation<NavigationProps>()

  const renderCarouselItem = ({ item }: { item: any }) => (
    <View style={styles.carouselItem}>
      <Image
        source={typeof item === 'string' ? { uri: item } : item}
        style={styles.postImage}
      />
    </View>
  )

  return (
    <TouchableOpacity
      style={styles.communityContainer}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('PostDetail', { id: data.id })}
    >
      <LinearGradient
        colors={['#ffffff', '#fff1f2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardContainer}
      >
        {/* 用户信息行 */}
        <View style={styles.userInfoRow}>
          <Image
            source={
              typeof data.avatar === 'string'
                ? { uri: data.avatar }
                : data.avatar
            }
            style={styles.avatar}
          />
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

        {/* 标签展示 */}
        {data.tags && data.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {data.tags.map((tag: string, index: number) => (
              <Text key={index} style={styles.tag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* 图片展示 - 使用 FlatList 以实现完美的边界对齐效果 */}
        {data.images && data.images.length > 0 && (
          <View style={styles.carouselContainer}>
            <FlatList
              data={data.images}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderCarouselItem}
              ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
              // 模拟 Carousel 的吸附效果
              snapToInterval={ITEM_WIDTH + GAP}
              decelerationRate="fast"
              // 当图片少于3张时禁止滑动，避免松动感
              scrollEnabled={data.images.length > 3}
              // 优化性能
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH + GAP,
                offset: (ITEM_WIDTH + GAP) * index,
                index
              })}
            />
          </View>
        )}

        {/* 底部交互栏 */}
        <View style={styles.actionRow}>
          <View style={styles.actionItem}>
            <Ionicons name="heart-outline" size={20} color="#f43f5e" />
            <Text style={styles.actionText}>{data.stats.likes}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="heart-dislike-outline" size={20} color="#94a3b8" />
            <Text style={styles.actionText}>{data.stats.dislikes}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="star-outline" size={20} color="#f59e0b" />
            <Text style={styles.actionText}>{data.stats.favorites}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>{data.stats.comments}</Text>
          </View>
        </View>
      </LinearGradient>
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
    // backgroundColor: '#fff', // Removed for gradient
    borderRadius: 24, // 统一圆角
    padding: 15,
    marginBottom: 20, // 下边距可以保留在外部或内部，这里是内部
    // Shadow
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 }, // 统一阴影方向
    shadowOpacity: 0.1,
    shadowRadius: 12, // 统一阴影半径
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fff'
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  tag: {
    fontSize: 12,
    color: '#f43f5e',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden'
  },
  carouselContainer: {
    marginBottom: 16,
    // 确保容器居中
    alignItems: 'flex-start'
  },
  carouselItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5'
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
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
