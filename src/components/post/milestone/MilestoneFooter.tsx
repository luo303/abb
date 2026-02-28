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
import request from '@/utils/request'
import { PostItem } from '@/types/home'
import { useMessage } from '@/components/Message'
import { addNewPost, fetchPostList } from '@/store/modules/PostStore'
import { NavigationProps } from '@/types/navigation'
import { RootState } from '@/store'

interface MilestoneData {
  title?: string
  content: string
  images: string[]
  eventTime?: number
}

interface MilestoneFooterProps {
  data: MilestoneData
  onSuccess?: () => void
}

export default function MilestoneFooter({
  data,
  onSuccess
}: MilestoneFooterProps) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const [isPublishing, setIsPublishing] = useState(false)
  const isPublishingRef = useRef(false)
  const { showMessage } = useMessage()
  const userInfo = useAppSelector((state: RootState) => state.user.userInfo)

  const disabled =
    !data.title?.trim() ||
    !data.content?.trim() ||
    !data.eventTime ||
    isPublishing

  const handlePublish = async () => {
    if (disabled || isPublishingRef.current) return

    if (!data.title || !data.title.trim()) {
      Alert.alert('提示', '请输入标题')
      return
    }
    if (!data.content || !data.content.trim()) {
      Alert.alert('提示', '请输入内容')
      return
    }
    if (!data.eventTime) {
      Alert.alert('提示', '请选择时间')
      return
    }

    setIsPublishing(true)
    isPublishingRef.current = true
    try {
      const contentObj = {
        text: data.content,
        images: data.images || [],
        event_time: data.eventTime
      }
      const jsonContent = JSON.stringify(contentObj)

      const payload = {
        content: jsonContent,
        images: data.images || [],
        tags: [],
        isPublic: 1,
        status: 'milestone' as const,
        title: data.title || ''
      }

      const createResponse = await createPost(payload)
      const postId = createResponse.data.post_id
      if (!postId) {
        throw new Error('未获取到 post_id')
      }

      // 与帖子一致，走发布接口
      const publishResponse = (await request.post(
        `/post/${postId}/publish`
      )) as { code: number; message: string }
      if (publishResponse.code !== 0) {
        throw new Error('发布失败: ' + publishResponse.message)
      }

      // 本地构造对象用于刷新
      const newPost: PostItem = {
        post_id: postId,
        author_id: userInfo?.user_id || 'user_123456',
        author_avatar: userInfo?.avatar
          ? { uri: userInfo.avatar }
          : require('../../../assets/testAvatar.png'),
        author_name: userInfo?.username || userInfo?.account || '稚慧宝用户',
        author_province: userInfo?.province || '',
        author_city: userInfo?.city || '未知位置',
        title: payload.title,
        baby_age_text: userInfo?.baby_age_text || '稚慧宝用户',
        ctime: Date.now(),
        content: contentObj,
        tags: [],
        images: data.images || [],
        like_count: 0,
        dislike_count: 0,
        collect_count: 0,
        comment_count: 0
      }
      dispatch(addNewPost(newPost))
      try {
        await dispatch(fetchPostList({ page: 1, strategy: 'ctime' })).unwrap()
      } catch {}

      showMessage('已记录大事记')
      onSuccess?.()
      navigation.goBack()
    } catch (e) {
      console.error(e)
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
        style={[styles.publishButton, disabled && styles.publishButtonDisabled]}
        onPress={handlePublish}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {isPublishing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.publishText}>保存大事记</Text>
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
    borderTopColor: '#ffe4e6'
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
    fontWeight: '600'
  }
})
