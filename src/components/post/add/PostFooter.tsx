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
import { useNavigation } from '@react-navigation/native'
import request from '@/utils/request'

export interface PostData {
  content: string
  images: string[]
  location: string
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
      // 构造请求数据
      // 注意：这里假设后端接口需要的字段结构，实际应根据后端 API 文档调整
      const payload = {
        content: postData.content,
        images: postData.images, // 实际场景可能需要先上传图片获取 URL
        location: postData.location,
        tags: postData.tags,
        isPublic: postData.isPublic ? 1 : 0, // 假设后端用 1/0 表示布尔值
        createTime: new Date().toISOString()
      }

      console.log('Sending publish request:', payload)

      // 发送 POST 请求 （此处使用云端 mock 地址）
      const response = await request.post(
        'https://m1.apifoxmock.com/m1/7571791-7309471-default/post/createPost',
        payload
      )

      console.log('Publish response:', response)

      // 假设后端返回 code 200 表示成功
      // 由于拦截器直接返回 response.data，这里需要根据实际返回结构判断
      // 这里暂时认为只要没抛出异常就是成功

      // 触发成功回调
      if (onSuccess) {
        onSuccess()
      }

      // 返回上一页（首页）
      navigation.goBack()

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
