import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

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

  const handlePublish = () => {
    if (isPublishing) return

    setIsPublishing(true)
    // 模拟网络请求延迟
    setTimeout(() => {
      // 构建帖子数据
      const newPost = {
        id: Date.now().toString(),
        ...postData,
        user: {
          name: '当前用户',
          avatar: require('../../../assets/testAvatar.png')
        },
        createTime: '刚刚',
        likes: 0,
        comments: 0,
        isLiked: false
      }

      console.log('Publishing Post:', newPost)

      // TODO: 这里应该调用实际的 API 发送数据到后端
      // 这里的 console.log 模拟发送成功

      setIsPublishing(false)

      // 触发成功回调
      if (onSuccess) {
        onSuccess()
      }

      // 返回上一页（首页）
      navigation.goBack()

      // 提示发布成功 (可选)
      // Alert.alert('提示', '发布成功！')
    }, 1500)
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
