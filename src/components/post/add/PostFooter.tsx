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
import { useNavigation, CommonActions } from '@react-navigation/native'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { createPost } from '@/api/home'
import { uploadFile } from '@/api/upload'
import request from '@/utils/request'
import { MOCK_FALLBACK_IMAGE, addMockPost } from '@/data/mock/homePosts'
import { PostItem } from '@/types/home'
import { useMessage } from '@/components/Message'
import { prepareImagesForUpload } from '@/utils/image'
import { addNewPost } from '@/store/modules/PostStore'
import { NavigationProps } from '@/types/navigation'
import { RootState } from '@/store'

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

  const isPublishDisabled = !postData.content.trim() || isPublishing

  const handlePublish = async () => {
    if (isPublishing || isPublishingRef.current) return

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
        isPublic: postData.isPublic ? 1 : 0,
        status: 'published' as const // 状态：发布
      }

      // 发送 POST 请求创建帖子
      const createResponse = await createPost(payload)
      // 严格获取 response.data.post_id
      const postId = createResponse.data.post_id

      if (!postId) {
        throw new Error('Failed to get post_id from createPost response')
      }

      // 调用发布接口 POST /post/{post_id}/publish
      try {
        await request.post(`/post/${postId}/publish`)
      } catch {
        // 静默处理发布接口失败，继续本地逻辑
      }

      // 构造完整的帖子对象用于前端展示
      const newPost: PostItem = {
        post_id: postId,
        author_id: userInfo?.user_id || 'user_123456',
        author_avatar: userInfo?.avatar
          ? { uri: userInfo.avatar }
          : require('../../../assets/testAvatar.png'),
        author_name: userInfo?.username || userInfo?.account || '稚慧宝用户',
        author_province: userInfo?.province || '',
        author_city: userInfo?.city || '未知位置',
        title: postData.title || '',
        baby_age_text: userInfo?.baby_age_text || '稚慧宝用户',
        ctime: Date.now(),
        content: contentObj, // 直接使用解析后的对象
        tags: payload.tags,
        images: validNetworkUrls,
        like_count: 0,
        dislike_count: 0,
        collect_count: 0,
        comment_count: 0
      }

      // 将新帖子真正添加到 Mock 数据列表中，确保刷新后依然存在
      addMockPost(newPost)

      // 更新Redux状态
      dispatch(addNewPost(newPost))

      // 触发成功回调
      if (onSuccess) {
        onSuccess()
      }

      // 提示发布成功
      showMessage('发布成功！')

      // 使用 reset 重置路由栈，确保用户无法返回发布页，直接跳转到首页并传递新帖子
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Tabs',
              params: {
                screen: 'Home',
                params: {
                  newPost
                }
              }
            }
          ]
        })
      )

      // 延迟一下再跳转到详情页，确保路由栈已经重置
      setTimeout(() => {
        navigation.navigate('PostDetail', { post_id: postId })
      }, 100)
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
