import React, { useCallback, useState } from 'react'
import { View, StyleSheet, ScrollView, Platform, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { uploadFile } from '@/api/upload'
import AppKeyboardAvoidingView from '@/components/common/AppKeyboardAvoidingView'

// 导入子组件
import AddPostHeader from '@/components/post/add/AddPostHeader'
import PostInput from '@/components/post/add/PostInput'
import ImageUploader from '@/components/post/add/ImageUploader'
import PostToolbar from '@/components/post/add/PostToolbar'
import PostUserInfo from '@/components/post/add/PostUserInfo'
import PostFooter from '@/components/post/add/PostFooter'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '@/types/navigation'

// 图片信息接口
interface ImageItem {
  uri: string
  status: 'uploading' | 'done' | 'error'
  url?: string
}

export default function AddPostScreen() {
  const navigation = useNavigation<NavigationProps>()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [pendingImages, setPendingImages] = useState<ImageItem[]>([])

  const uploadSingleImage = async (uri: string) => {
    try {
      const response = await uploadFile(uri)

      let url = ''
      if (typeof response.data === 'string') {
        url = response.data
      } else if (response.data && typeof response.data.url === 'string') {
        url = response.data.url
      } else {
        url = typeof response.data === 'string' ? response.data : ''
      }

      if (!url) {
        throw new Error('Invalid upload response')
      }

      setPendingImages(prev =>
        prev.map(p => (p.uri === uri ? { ...p, status: 'done', url } : p))
      )
      setImages(prev => [...prev, url])
    } catch (error) {
      console.warn('Image upload failed:', error)
      setPendingImages(prev =>
        prev.map(p => (p.uri === uri ? { ...p, status: 'error' } : p))
      )
      Alert.alert('提示', '图片上传失败，点击图片可重试')
    }
  }

  // 从本地相册添加图片
  const handleAddImage = async () => {
    // 计算发布帖子剩余的存储量
    const activePendingCount = pendingImages.filter(
      img => img.status !== 'done'
    ).length
    const remainingCount = 9 - images.length - activePendingCount

    // 处理发布帖子照片数量已满的情况（即剩余能上传的图片数量小于等于 0 ）
    if (remainingCount <= 0) {
      alert('最多只能上传 9 张照片喔！')
      return
    }
    // 请求相册权限
    const permissonResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permissonResult.granted === false) {
      alert('需要访问相册权限才能上传图片！')
      return
    }

    // 打开相册选择图片
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // 使用字符串数组 'images' 替代被弃用的 MediaTypeOptions.Images
      allowsMultipleSelection: true, // 允许多选
      selectionLimit: remainingCount, // 最多选择 remainingCount 张图片
      aspect: [1, 1], // 裁剪比例： 1：1
      quality: 1 // 图片压缩质量
    })

    if (!result.canceled) {
      const newUris = result.assets.map(item => item.uri) // 使用 map 方法将每张图片的 uri 提取出来

      // 添加到待上传列表
      const newImageItems: ImageItem[] = newUris.map(uri => ({
        uri,
        status: 'uploading'
      }))
      setPendingImages(prev => [...prev, ...newImageItems])

      // 对每个新图片进行上传
      newImageItems.forEach(async img => {
        await uploadSingleImage(img.uri)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleRetryPendingImage = (uri: string) => {
    setPendingImages(prev =>
      prev.map(p => (p.uri === uri ? { ...p, status: 'uploading' } : p))
    )
    void uploadSingleImage(uri)
  }

  const handleRemovePendingImage = (uri: string) => {
    setPendingImages(prev => prev.filter(p => p.uri !== uri))
  }

  const isUploadingImages = pendingImages.some(
    img => img.status === 'uploading'
  )

  const handleTagsChange = useCallback(
    (tagIds: string[], tagNames: string[]) => {
      setSelectedTags(tagIds)
      setSelectedTagNames(tagNames)
    },
    []
  )

  return (
    <View style={styles.container}>
      <AddPostHeader
        rightText="草稿箱"
        onRightPress={() => navigation.navigate('MyDrafts')}
      />

      <AppKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 主要内容卡片：包含用户信息、输入框和图片上传 */}
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#ffffff', '#fff1f2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <PostUserInfo />
              <PostInput
                title={title}
                onTitleChange={setTitle}
                value={content}
                onChangeText={setContent}
              />
              <ImageUploader
                images={images}
                pendingImages={pendingImages}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                onRetryPendingImage={handleRetryPendingImage}
                onRemovePendingImage={handleRemovePendingImage}
              />
            </LinearGradient>
          </View>

          {/* 工具栏卡片 */}
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#ffffff', '#fff1f2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <PostToolbar
                onTagsChange={handleTagsChange}
                onPrivacyChange={setIsPublic}
              />
            </LinearGradient>
          </View>
        </ScrollView>

        <PostFooter
          postData={{
            title,
            content,
            images,
            tags: selectedTags,
            tagNames: selectedTagNames,
            isPublic
          }}
          hasUploadingImages={isUploadingImages}
        />
      </AppKeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff' // 调整背景色为白色，与 Profile 页面一致
  },
  flex: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 15 // 给 ScrollView 添加内边距
  },
  cardWrapper: {
    marginBottom: 15,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderRadius: 20,
    backgroundColor: '#fff' // Fallback
  },
  cardGradient: {
    borderRadius: 20,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#fff'
  }
})
