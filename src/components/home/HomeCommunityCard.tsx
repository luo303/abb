import React, { memo, useMemo } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'
import { PostItem } from '@/types/home'

interface HomeCommunityCardProps {
  data: PostItem
}

function HomeCommunityCard({ data }: HomeCommunityCardProps) {
  const navigation = useNavigation<NavigationProps>()
  const [avatarLoadError, setAvatarLoadError] = React.useState(false)

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${month}-${day}`
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

  const parsedContent = useMemo(() => {
    try {
      if (typeof data.content === 'string') {
        try {
          const parsed = JSON.parse(data.content) as {
            text?: string
            images?: any[]
          }

          if (parsed && typeof parsed === 'object') {
            return {
              text: parsed.text || data.content,
              images: Array.isArray(parsed.images) ? parsed.images : []
            }
          }

          return {
            text: data.content,
            images: []
          }
        } catch {
          return {
            text: data.content,
            images: []
          }
        }
      }

      if (typeof data.content === 'object' && data.content !== null) {
        return {
          text: data.content.text || '',
          images: Array.isArray(data.content.images) ? data.content.images : []
        }
      }
    } catch {
      return {
        text:
          data.cleanedContent ||
          (typeof data.content === 'string' ? data.content : ''),
        images: []
      }
    }

    return {
      text:
        data.cleanedContent ||
        (typeof data.content === 'string' ? data.content : ''),
      images: []
    }
  }, [data.cleanedContent, data.content])

  const displayImages = useMemo(() => {
    if (parsedContent.images.length > 0) {
      return parsedContent.images
    }

    if (data.imageUrls && data.imageUrls.length > 0) {
      return data.imageUrls
    }

    if (data.images && data.images.length > 0) {
      return data.images
    }

    if (data.cover) {
      return [data.cover]
    }

    return []
  }, [data.cover, data.imageUrls, data.images, parsedContent.images])

  const previewImages = displayImages.slice(0, 3)
  const displayContent = (parsedContent.text || data.content_preview || '')
    .replace(/\s+/g, ' ')
    .trim()
  const isLiked = data.is_like ?? data.is_liked ?? false
  const isDisliked = data.is_dislike ?? data.is_disliked ?? false
  const isCollected = data.is_collect ?? data.is_collected ?? false

  const handlePress = () => {
    const postId = data.post_id || data.id
    if (postId) {
      navigation.navigate('PostDetail', { post_id: postId })
    }
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.88}
      onPress={handlePress}
    >
      <View style={styles.userRow}>
        <Image
          source={
            avatarLoadError
              ? require('@/assets/testAvatar.png')
              : getImageSource(data.author_avatar)
          }
          style={styles.avatar}
          onError={() => setAvatarLoadError(true)}
        />
        <View style={styles.userMeta}>
          <Text style={styles.userName} numberOfLines={1}>
            {data.author_name || '匿名用户'}
          </Text>
          <Text style={styles.userSubText} numberOfLines={1}>
            {data.baby_age_text || formatDate(data.ctime)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(data.ctime)}</Text>
      </View>

      {data.title ? (
        <Text style={styles.title} numberOfLines={2}>
          {data.title}
        </Text>
      ) : null}

      <Text style={styles.content} numberOfLines={2} ellipsizeMode="tail">
        {displayContent}
      </Text>

      {previewImages.length > 0 ? (
        <View
          style={[
            styles.imagesRow,
            previewImages.length === 1 && styles.imagesRowSingle
          ]}
        >
          {previewImages.map((image, index) => {
            const isLastPreview =
              index === previewImages.length - 1 && displayImages.length > 3

            return (
              <View
                key={`${data.post_id}-${index}`}
                style={[
                  styles.imageCard,
                  previewImages.length === 1 && styles.imageCardSingle
                ]}
              >
                <Image
                  source={typeof image === 'string' ? { uri: image } : image}
                  style={styles.postImage}
                />
                {isLastPreview ? (
                  <View style={styles.moreOverlay}>
                    <Text style={styles.moreOverlayText}>
                      +{displayImages.length - 3}
                    </Text>
                  </View>
                ) : null}
              </View>
            )
          })}
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <View style={styles.actionItem}>
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? '#f43f5e' : '#6b7280'}
          />
          <Text style={styles.actionText}>{data.like_count || 0}</Text>
        </View>

        <View style={styles.actionItem}>
          <Ionicons
            name={isDisliked ? 'heart-dislike' : 'heart-dislike-outline'}
            size={18}
            color={isDisliked ? '#64748b' : '#6b7280'}
          />
          <Text style={styles.actionText}>{data.dislike_count || 0}</Text>
        </View>

        <View style={styles.actionItem}>
          <Ionicons
            name={isCollected ? 'star' : 'star-outline'}
            size={18}
            color={isCollected ? '#f59e0b' : '#6b7280'}
          />
          <Text style={styles.actionText}>{data.collect_count || 0}</Text>
        </View>

        <View style={styles.actionItem}>
          <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
          <Text style={styles.actionText}>{data.comment_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default memo(HomeCommunityCard, (prev, next) => {
  return (
    prev.data.post_id === next.data.post_id &&
    prev.data.utime === next.data.utime &&
    prev.data.like_count === next.data.like_count &&
    prev.data.dislike_count === next.data.dislike_count &&
    prev.data.collect_count === next.data.collect_count &&
    prev.data.comment_count === next.data.comment_count
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6'
  },
  userMeta: {
    flex: 1,
    marginLeft: 10
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151'
  },
  userSubText: {
    marginTop: 2,
    fontSize: 12,
    color: '#9ca3af'
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
    color: '#111827'
  },
  content: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
    color: '#6b7280'
  },
  imagesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14
  },
  imagesRowSingle: {
    justifyContent: 'flex-start'
  },
  imageCard: {
    flex: 1,
    height: 116,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6'
  },
  imageCardSingle: {
    flex: 0,
    width: 170
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.45)'
  },
  moreOverlayText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 22
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6b7280'
  }
})
