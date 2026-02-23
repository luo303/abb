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
import { useAppDispatch } from '@/hooks/redux'
import { createPost } from '@/api/home'
import { uploadFile } from '@/api/upload'
import request from '@/utils/request'
import {
  MOCK_FALLBACK_IMAGE,
  MOCK_CURRENT_USER,
  addMockPost
} from '@/data/mock/homePosts'
import { PostItem } from '@/types/home'
import { useMessage } from '@/components/Message'
import { prepareImagesForUpload } from '@/utils/image'
import { addNewPost } from '@/store/modules/PostStore'
import { NavigationProps } from '@/types/navigation'

export interface PostData {
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

  const isPublishDisabled = !postData.content.trim() || isPublishing

  const handlePublish = async () => {
    if (isPublishing || isPublishingRef.current) return

    setIsPublishing(true)
    isPublishingRef.current = true

    try {
      // 1. 处理图片（如果有）
      let processedImages = postData.images || []

      // 处理图片：格式转换和压缩
      if (processedImages.length > 0) {
        const preparedImages = await prepareImagesForUpload(processedImages, {
          maxSize: 2 * 1024 * 1024, // 2MB 限制
          quality: 0.8, // 80% 质量
          targetFormat: 'jpeg' // 转换为 JPEG 格式
        })
        processedImages = preparedImages.map(img => img.uri)
      }

      // 2. 上传图片（如果有）
      let uploadedImageUrls: string[] = []
      // 保存有效的网络图片URL
      const validNetworkUrls: string[] = []

      if (processedImages.length > 0) {
        // 并发上传所有图片
        const uploadPromises = processedImages.map(uri =>
          uploadFile(uri).catch(err => {
            console.warn('Image upload failed:', err)
            return null
          })
        )
        const results = await Promise.all(uploadPromises)

        // 提取返回的 URL
        uploadedImageUrls = results
          .map((res: any) => {
            if (!res) return ''

            // 兼容多种可能的返回结构
            if (res.data && res.data.url) return res.data.url
            if (res.url) return res.url
            if (typeof res.data === 'string') return res.data
            // 如果后端返回 code 0，也认为成功
            if (res.code === 0 && res.data) {
              // 有些接口直接把 url 放在 data 里，有些放在 data.url
              return typeof res.data === 'string'
                ? res.data
                : res.data.url || ''
            }
            // Mock 环境兜底
            if (res.code === 200) return MOCK_FALLBACK_IMAGE

            return ''
          })
          .filter((url: string) => !!url) // 显式声明类型

        validNetworkUrls.push(...uploadedImageUrls)
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
      const postId = createResponse.data.post_id || '1011' // 确保获取到post_id

      // 调用发布接口 POST /post/{post_id}/publish
      try {
        await request.post(`/post/${postId}/publish`)
      } catch (error) {
        console.warn(
          'Publish API call failed, continuing with local logic:',
          error
        )
      }

      // 构造完整的帖子对象用于前端展示
      const newPost: PostItem = {
        post_id: postId,
        author_id: MOCK_CURRENT_USER.author_id,
        author_avatar: MOCK_CURRENT_USER.author_avatar,
        author_name: MOCK_CURRENT_USER.author_name,
        baby_age_text: MOCK_CURRENT_USER.baby_age_text,
        ctime: Date.now(),
        author_city: '未知位置',
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
        navigation.navigate('PostDetail', { id: postId })
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
