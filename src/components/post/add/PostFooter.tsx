import React, { useState, useRef } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Button } from 'react-native-paper'
import { useAppDispatch } from '@/hooks/redux'
import { createPost } from '@/api/home'
import { publishPost } from '@/api/post'
import { useMessage } from '@/components/Message'
import { fetchPostList } from '@/store/modules/PostStore'
import { NavigationProps } from '@/types/navigation'

export interface PostData {
  title?: string
  content: string
  images: string[]
  tags: string[] // 话题 tag_id 数组
  tagNames?: string[] // 仅用于本地展示
  isPublic: boolean
}

export interface PostFooterProps {
  postData: PostData
  onSuccess?: () => void
  hasUploadingImages?: boolean
}

export default function PostFooter({
  postData,
  onSuccess,
  hasUploadingImages = false
}: PostFooterProps) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const isPublishingRef = useRef(false)
  const { showMessage, showDialog } = useMessage()

  const isPublishDisabled =
    !postData.content.trim() ||
    !postData.title?.trim() ||
    isPublishing ||
    isSavingDraft ||
    hasUploadingImages

  const isSaveDisabled = isPublishDisabled

  const navigateToDrafts = () => {
    navigation.goBack()
    setTimeout(() => {
      navigation.navigate('MyDrafts')
    }, 0)
  }

  const buildJsonContent = (networkImages: string[]) => {
    const contentObj = {
      text: postData.content,
      images: networkImages
    }
    return JSON.stringify(contentObj)
  }

  const validateBaseForm = () => {
    if (!postData.title || !postData.title.trim()) {
      Alert.alert('提示', '请输入帖子标题')
      return false
    }

    if (!postData.content || !postData.content.trim()) {
      Alert.alert('提示', '请输入帖子内容')
      return false
    }

    if (hasUploadingImages) {
      Alert.alert('提示', '图片上传中，请稍后再试')
      return false
    }
    return true
  }

  const getValidNetworkUrls = () => {
    const validNetworkUrls = postData.images || []
    for (const url of validNetworkUrls) {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        throw new Error(`Invalid image URL: ${url}`)
      }
    }
    return validNetworkUrls
  }

  const handlePublish = async () => {
    if (isPublishing || isSavingDraft || isPublishingRef.current) return
    if (!validateBaseForm()) return

    setIsPublishing(true)
    isPublishingRef.current = true

    try {
      // 图片已经在选择时上传完成，直接使用上传后的 URL
      const validNetworkUrls = getValidNetworkUrls()
      const jsonContent = buildJsonContent(validNetworkUrls)

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

      let postId = ''
      // 发送 POST 请求创建帖子
      const createResponse = await createPost(payload)
      // 严格获取 response.data.post_id
      postId = createResponse.data.post_id

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

      // Phase 4 选择“重新拉取列表”策略，避免本地乐观数据与详情不一致
      void dispatch(fetchPostList({ page: 1, strategy: 'random', force: true }))
      void dispatch(fetchPostList({ page: 1, strategy: 'hot', force: true }))

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
      showDialog('发布失败', '已保存为草稿，可稍后在草稿箱继续发布。', [
        { text: '继续编辑', style: 'cancel' },
        { text: '去草稿箱', onPress: navigateToDrafts }
      ])
    } finally {
      setIsPublishing(false)
      isPublishingRef.current = false
    }
  }

  const handleSaveDraft = async () => {
    if (isPublishing || isSavingDraft || isPublishingRef.current) return
    if (!validateBaseForm()) return

    setIsSavingDraft(true)
    isPublishingRef.current = true

    try {
      const validNetworkUrls = getValidNetworkUrls()
      const jsonContent = buildJsonContent(validNetworkUrls)

      const payload = {
        content: jsonContent,
        images: validNetworkUrls,
        tags: postData.tags,
        tag_ids: postData.tags,
        isPublic: postData.isPublic ? 1 : 0,
        status: 'draft' as const,
        title: postData.title
      }

      const createResponse = await createPost(payload)
      const postId = createResponse.data.post_id

      if (!postId) {
        throw new Error('Failed to get post_id from createPost response')
      }

      showDialog('已保存到草稿箱', '下次可以在草稿箱继续编辑或发布。', [
        { text: '继续编辑', style: 'cancel' },
        { text: '去草稿箱', onPress: navigateToDrafts }
      ])
    } catch (error) {
      console.error('Save draft failed:', error)
      Alert.alert('提示', '保存草稿失败，请稍后重试')
    } finally {
      setIsSavingDraft(false)
      isPublishingRef.current = false
    }
  }

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}
    >
      <View style={styles.buttonRow}>
        <Button
          mode="outlined"
          style={styles.secondaryButton}
          contentStyle={styles.publishButtonContent}
          labelStyle={styles.secondaryText}
          onPress={handleSaveDraft}
          disabled={isSaveDisabled}
          loading={isSavingDraft}
          textColor="#f43f5e"
          uppercase={false}
        >
          保存草稿
        </Button>
        <Button
          mode="contained"
          style={[
            styles.publishButton,
            isPublishDisabled && styles.publishButtonDisabled
          ]}
          contentStyle={styles.publishButtonContent}
          labelStyle={styles.publishText}
          onPress={handlePublish}
          disabled={isPublishDisabled}
          loading={isPublishing}
          buttonColor="#f43f5e"
          uppercase={false}
        >
          立即发布
        </Button>
      </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 25
  },
  publishButton: {
    borderRadius: 25,
    flex: 1,
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
  publishButtonContent: {
    height: 50
  },
  publishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1
  },
  secondaryText: {
    color: '#f43f5e',
    fontSize: 14,
    fontWeight: '700'
  }
})
