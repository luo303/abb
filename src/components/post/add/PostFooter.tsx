import React, { useState } from 'react'
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
import { uploadFile } from '@/api/upload'
import request from '@/utils/request'
import { MOCK_FALLBACK_IMAGE, MOCK_CURRENT_USER } from '@/data/mock/homePosts'

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
  const navigation = useNavigation()
  const [isPublishing, setIsPublishing] = useState(false)

  const isPublishDisabled = !postData.content.trim() || isPublishing

  const handlePublish = async () => {
    if (isPublishing) return

    setIsPublishing(true)

    try {
      // 1. 上传图片（如果有）
      let uploadedImageUrls: string[] = []
      // 保存有效的网络图片URL
      const validNetworkUrls: string[] = []

      if (postData.images && postData.images.length > 0) {
        // 并发上传所有图片
        const uploadPromises = postData.images.map(uri =>
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
            // Mock 环境兜底
            if (res.code === 200) return MOCK_FALLBACK_IMAGE

            return ''
          })
          .filter(url => !!url)

        validNetworkUrls.push(...uploadedImageUrls)
      }

      // 构造请求数据
      const payload = {
        content: postData.content,
        images: validNetworkUrls,
        tags: postData.tags,
        isPublic: postData.isPublic ? 1 : 0,
        createTime: new Date().toISOString()
      }

      // 发送 POST 请求
      await request.post(
        'https://m1.apifoxmock.com/m1/7571791-7309471-default/post/createPost',
        payload
      )

      console.log('Publish success')

      // 构造完整的帖子对象用于前端展示
      // 如果上传失败或 Mock 接口没返回 URL，回退使用本地 URI，确保首页能显示图片
      const displayImages =
        validNetworkUrls.length > 0 ? validNetworkUrls : postData.images

      const newPost = {
        id: Date.now().toString(), // 临时 ID
        avatar: MOCK_CURRENT_USER.avatar, // Mock 头像
        nickname: MOCK_CURRENT_USER.nickname, // Mock 昵称
        description: MOCK_CURRENT_USER.description,
        publishTime: '刚刚',
        location: '未知位置', // 如果有定位功能可填充
        content: payload.content,
        tags: payload.tags,
        images: displayImages, // 优先使用网络图，无则用本地图
        stats: {
          likes: 0,
          dislikes: 0,
          favorites: 0,
          comments: 0
        }
      }

      // 触发成功回调
      if (onSuccess) {
        onSuccess()
      }

      // 使用 reset 重置路由栈，确保用户无法返回发布页
      // @ts-ignore
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'Tabs',
              params: {
                screen: 'Home',
                params: { newPost }
              }
            }
          ]
        })
      )

      // 提示发布成功
      Alert.alert('提示', '发布成功！')
    } catch (error) {
      console.error('Publish failed:', error)
      Alert.alert('提示', '发布失败，请稍后重试')
    } finally {
      setIsPublishing(false)
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
