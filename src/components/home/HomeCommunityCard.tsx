import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import { LinearGradient } from 'expo-linear-gradient'
import { PostItem } from '@/types/home'

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
  data: PostItem
}

export default function HomeCommunityCard({ data }: HomeCommunityCardProps) {
  const navigation = useNavigation<NavigationProps>()
  const [avatarLoadError, setAvatarLoadError] = React.useState(false)

  // 图片组件，处理加载和错误状态
  const PostImage = ({ item }: { item: any }) => {
    const [imageLoading, setImageLoading] = React.useState(true)
    const [imageError, setImageError] = React.useState(false)
    const imageUrl = typeof item === 'string' ? item : undefined

    const handleImageLoad = () => {
      setImageLoading(false)
      setImageError(false)
    }

    const handleImageError = (error: any) => {
      console.error('Image load failed:', imageUrl, error.nativeEvent.error)
      setImageLoading(false)
      setImageError(true)
    }

    return (
      <View style={styles.carouselItem}>
        {/* 图片加载态 */}
        {imageLoading && (
          <View style={[styles.postImage, styles.imageLoading]}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        )}

        {/* 图片组件 */}
        <Image
          source={typeof item === 'string' ? { uri: item } : item}
          style={[
            styles.postImage,
            (imageLoading || imageError) && styles.imageHidden
          ]}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

        {/* 错误占位图 */}
        {imageError && (
          <View style={[styles.postImage, styles.imageError]}>
            <Ionicons name="image-outline" size={24} color="#ccc" />
          </View>
        )}
      </View>
    )
  }

  // 渲染轮播项
  const renderCarouselItem = ({ item }: { item: any }) => (
    <PostImage item={item} />
  )

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }

  const getImageSource = (img: string | any) => {
    if (typeof img === 'string') {
      return img ? { uri: img } : require('@/assets/testAvatar.png')
    }
    return img
  }

  React.useEffect(() => {
    setAvatarLoadError(false)
  }, [data.author_avatar])

  // 解析 content 的函数，使用 useMemo 缓存结果
  const parsedContent = React.useMemo(() => {
    try {
      // 检查 content 是否已经是对象
      if (typeof data.content === 'object' && data.content.text) {
        return {
          success: true,
          text: data.content.text || '',
          images: data.content.images || []
        }
      }
      // 尝试解析 content 字符串
      if (typeof data.content === 'string') {
        const parsed = JSON.parse(data.content)
        return {
          success: true,
          text: parsed.text || '',
          images: parsed.images || []
        }
      }
      // 解析失败，返回原始 content
      return {
        success: false,
        text:
          data.cleanedContent ||
          (typeof data.content === 'string' ? data.content : ''),
        images: []
      }
    } catch (error) {
      // 解析失败，返回原始 content
      return {
        success: false,
        text:
          data.cleanedContent ||
          (typeof data.content === 'string' ? data.content : ''),
        images: []
      }
    }
  }, [data.content, data.cleanedContent])

  /**
   * 获取文章图片的函数
   * 优先级顺序为：解析出的 images > 提取的 imageUrls > 数据中的 images > 封面图
   * @returns {Array} 返回图片URL数组，如果没有图片则返回空数组
   */
  const displayImages = React.useMemo(() => {
    // 优先使用解析出的 images
    if (parsedContent.success && parsedContent.images.length > 0) {
      return parsedContent.images
    }
    // 其次使用提取的 imageUrls
    if (data.imageUrls && data.imageUrls.length > 0) {
      return data.imageUrls
    }
    // 再次使用 data.images
    if (data.images && data.images.length > 0) {
      return data.images
    }
    // 最后使用 cover
    if (data.cover) {
      return [data.cover]
    }
    return []
  }, [parsedContent, data.imageUrls, data.images, data.cover])

  const displayContent = parsedContent.text

  const handlePress = () => {
    // 优先使用 post_id，如果不存在则尝试使用 id
    const postId = data.post_id || data.id
    if (postId) {
      console.log('点击帖子的 ID 为:', postId)
      navigation.navigate('PostDetail', { post_id: postId })
    }
  }

  return (
    <TouchableOpacity
      style={styles.communityContainer}
      activeOpacity={0.9}
      onPress={handlePress}
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
              avatarLoadError
                ? require('@/assets/testAvatar.png')
                : getImageSource(data.author_avatar)
            }
            style={styles.avatar}
            onError={() => setAvatarLoadError(true)}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{data.author_name}</Text>
            {/* 显示宝宝年龄描述，与详情页保持一致 */}
            <Text style={styles.userDesc}>{data.baby_age_text}</Text>
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(data.ctime)}</Text>
            <Text style={styles.timeText}>
              {data.author_province && data.author_city
                ? `${data.author_province} ${data.author_city}`
                : data.author_city}
            </Text>
          </View>
        </View>

        {/* 帖子标题 */}
        {data.title && (
          <Text style={styles.postTitle} numberOfLines={1} ellipsizeMode="tail">
            {data.title}
          </Text>
        )}

        {/* 帖子内容 - 只显示第一行或者截断 */}
        <Text style={styles.postContent} numberOfLines={2} ellipsizeMode="tail">
          {displayContent}
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
        {displayImages.length > 0 && (
          <View style={styles.carouselContainer}>
            <FlatList
              data={displayImages}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderCarouselItem}
              ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
              // 模拟 Carousel 的吸附效果
              snapToInterval={ITEM_WIDTH + GAP}
              decelerationRate="fast"
              // 当图片少于3张时禁止滑动，避免松动感
              scrollEnabled={displayImages.length > 3}
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
            <Ionicons
              name={data.is_liked ? 'heart' : 'heart-outline'}
              size={20}
              color={data.is_liked ? '#f43f5e' : '#f43f5e'}
            />
            <Text style={styles.actionText}>{data.like_count || 0}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons
              name={
                data.is_disliked ? 'heart-dislike' : 'heart-dislike-outline'
              }
              size={20}
              color={data.is_disliked ? '#94a3b8' : '#94a3b8'}
            />
            <Text style={styles.actionText}>{data.dislike_count || 0}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons
              name={data.is_collected ? 'star' : 'star-outline'}
              size={20}
              color={data.is_collected ? '#f59e0b' : '#f59e0b'}
            />
            <Text style={styles.actionText}>{data.collect_count || 0}</Text>
          </View>
          <View style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>{data.comment_count || 0}</Text>
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
    marginBottom: 10, // 减小下边距
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
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22
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
  imageLoading: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageHidden: {
    position: 'absolute',
    opacity: 0
  },
  imageError: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center'
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
