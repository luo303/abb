import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { createPost } from '@/api/home'
import { publishPost } from '@/api/post'
import { addMockPost } from '@/data/mock/homePosts'
import { PostItem } from '@/types/home'
import { useMessage } from '@/components/Message'
import { addLocalPost, fetchPostList } from '@/store/modules/PostStore'
import { NavigationProps } from '@/types/navigation'
import { RootState } from '@/store'

// 标签数据（与 PostToolbar 保持一致）
interface Tag {
  id: string
  name: string
}

const TAGS: Tag[] = [
  { id: 'tag_001', name: '宝宝日常' },
  { id: 'tag_002', name: '成长记录' },
  { id: 'tag_003', name: '育儿经验' },
  { id: 'tag_004', name: '亲子时光' },
  { id: 'tag_005', name: '辅食分享' },
  { id: 'tag_006', name: '绘本推荐' },
  { id: 'tag_007', name: '玩具测评' },
  { id: 'tag_008', name: '好物分享' },
  { id: 'tag_009', name: '宝宝穿搭' },
  { id: 'tag_010', name: '出行攻略' },
  { id: 'tag_011', name: '早教启蒙' },
  { id: 'tag_012', name: '睡眠引导' },
  { id: 'tag_013', name: '疾病护理' },
  { id: 'tag_014', name: '疫苗接种' },
  { id: 'tag_015', name: '情感交流' }
]

// 根据标签 ID 获取标签名称
const getTagName = (tagId: string): string => {
  const tag = TAGS.find(t => t.id === tagId)
  return tag ? tag.name : ''
}

// 将标签 ID 数组转换为标签名称数组
const getTagNames = (tagIds: string[]): string[] => {
  return tagIds.map(tagId => getTagName(tagId)).filter(name => name !== '')
}

export interface PostData {
  title?: string
  content: string
  images: string[]
  tags: string[]
  isPublic: boolean
}

export interface PostFooterProps {
  postData: PostData
  onSuccess?: () => void
}

export default function PostFooter({ postData, onSuccess }: PostFooterProps) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const [isPublishing, setIsPublishing] = useState(false)
  const isPublishingRef = useRef(false)
  const { showMessage } = useMessage()

  // 从 Redux store 获取用户信息
  const userInfo = useAppSelector((state: RootState) => state.user.userInfo)

  const isPublishDisabled =
    !postData.content.trim() || !postData.title?.trim() || isPublishing

  const handlePublish = async () => {
    if (isPublishing || isPublishingRef.current) return

    // 表单检查
    if (!postData.title || !postData.title.trim()) {
      Alert.alert('提示', '请输入帖子标题')
      return
    }

    if (!postData.content || !postData.content.trim()) {
      Alert.alert('提示', '请输入帖子内容')
      return
    }

    setIsPublishing(true)
    isPublishingRef.current = true

    try {
      // 图片已经在选择时上传完成，直接使用上传后的 URL
      const validNetworkUrls = postData.images || []

      // 检查图片 URL 是否合法
      for (const url of validNetworkUrls) {
        if (typeof url !== 'string' || !url.startsWith('http')) {
          throw new Error(`Invalid image URL: ${url}`)
        }
      }

      // 封装content为JSON字符串格式
      const contentObj = {
        text: postData.content,
        images: validNetworkUrls
      }
      const jsonContent = JSON.stringify(contentObj)

      // 构造请求数据
      const payload = {
        content: jsonContent,
        images: validNetworkUrls,
        tags: postData.tags,
        tag_ids: postData.tags,
        isPublic: postData.isPublic ? 1 : 0,
        status: 'draft' as const, // 状态：草稿
        title: postData.title // 帖子标题
      }

      // 发送 POST 请求创建帖子
      const createResponse = await createPost(payload)
      // 严格获取 response.data.post_id
      const postId = createResponse.data.post_id

      if (!postId) {
        throw new Error('Failed to get post_id from createPost response')
      }

      // 调用发布接口 POST /post/{post_id}/publish
      const publishResponse = await publishPost(postId)

      // 确保发布请求成功
      if (!publishResponse) {
        throw new Error('发布失败: 响应数据为空')
      }

      // 检查响应状态
      const isSuccess =
        publishResponse.code === 0 ||
        publishResponse.code === 200 ||
        (publishResponse.message && publishResponse.message.includes('成功'))

      if (!isSuccess) {
        throw new Error('发布失败: ' + (publishResponse.message || '未知错误'))
      }

      // 构造完整的帖子对象用于前端展示
      const newPost: PostItem = {
        post_id: postId,
        author_id: userInfo?.user_id || 'user_123456',
        author_avatar: userInfo?.avatar || '',
        author_name: userInfo?.username || userInfo?.account || '稚慧宝用户',
        author_province: userInfo?.province || '',
        author_city: userInfo?.city || '未知位置',
        title: postData.title || '',
        content: jsonContent, // 使用JSON字符串
        content_preview: postData.content.substring(0, 100) || '',
        status: 'published',
        like_count: 0,
        dislike_count: 0,
        collect_count: 0,
        comment_count: 0,
        ctime: Date.now(),
        utime: Date.now(),
        tags: getTagNames(payload.tags),
        images: validNetworkUrls,
        cover: validNetworkUrls[0] || '', // 使用第一张图片作为封面
        baby_age_year: 0,
        baby_age_month: 0,
        baby_age_text: userInfo?.baby_age_text || '稚慧宝用户'
      }

      // 将新帖子真正添加到 Mock 数据列表中，确保刷新后依然存在
      addMockPost(newPost)

      // 将新帖子添加到 Redux 中
      dispatch(addLocalPost(newPost))

      // 触发成功回调
      if (onSuccess) {
        onSuccess()
      }

      // 提示发布成功
      showMessage('发布成功！')

      // 直接返回首页
      navigation.goBack()
    } catch (error) {
      console.error('Publish failed:', error)
      Alert.alert('提示', '发布失败，请稍后重试')
    } finally {
      setIsPublishing(false)
      isPublishingRef.current = false
    }
  }

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}
    >
      <TouchableOpacity
        style={[
          styles.publishButton,
          isPublishDisabled && styles.publishButtonDisabled
        ]}
        onPress={handlePublish}
        disabled={isPublishDisabled}
        activeOpacity={0.8}
      >
        {isPublishing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.publishText}>立即发布</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f5f7fa'
  },
  publishButton: {
    backgroundColor: '#f43f5e',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  publishButtonDisabled: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
    elevation: 0
  },
  publishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1
  }
})
