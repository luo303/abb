import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { Button } from 'react-native-paper'
import AppKeyboardAvoidingView from '@/components/common/AppKeyboardAvoidingView'
import AddPostHeader from '@/components/post/add/AddPostHeader'
import PostInput from '@/components/post/add/PostInput'
import ImageUploader from '@/components/post/add/ImageUploader'
import PostToolbar from '@/components/post/add/PostToolbar'
import PostUserInfo from '@/components/post/add/PostUserInfo'
import { uploadFile } from '@/api/upload'
import { deleteDraft, publishDraft, updateDraft } from '@/api/post'
import type { DraftContent, PostMineListItem } from '@/types/post'
import type { NavigationProps } from '@/types/navigation'
import { useMessage } from '@/components/Message'
import { useAppDispatch } from '@/hooks/redux'
import { fetchPostList } from '@/store/modules/PostStore'

interface RouteParams {
  draft: PostMineListItem
}

interface ImageItem {
  uri: string
  status: 'uploading' | 'done' | 'error'
  url?: string
}

const parseDraftContent = (content: string): DraftContent => {
  try {
    const parsed = JSON.parse(content) as Partial<DraftContent>
    if (parsed && typeof parsed === 'object') {
      const text = typeof parsed.text === 'string' ? parsed.text : content
      const images = Array.isArray(parsed.images)
        ? parsed.images.filter((v): v is string => typeof v === 'string')
        : []
      return { text, images }
    }
  } catch {}
  return { text: content, images: [] }
}

export default function EditDraft() {
  const navigation = useNavigation<NavigationProps>()
  const route = useRoute()
  const { showMessage } = useMessage()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  const { draft } = (route.params || {}) as RouteParams
  const initialContent = useMemo(
    () => parseDraftContent(draft.content),
    [draft]
  )

  const [title, setTitle] = useState(draft.title || '')
  const [content, setContent] = useState(initialContent.text)
  const [images, setImages] = useState<string[]>(initialContent.images)
  const [selectedTags, setSelectedTags] = useState<string[]>(
    Array.isArray(draft.tags) ? draft.tags : []
  )
  const [isPublic, setIsPublic] = useState(true)
  const [pendingImages, setPendingImages] = useState<ImageItem[]>([])

  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const cancelOngoingRequest = () => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    return abortRef.current.signal
  }

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

  const handleAddImage = async () => {
    const activePendingCount = pendingImages.filter(
      img => img.status !== 'done'
    ).length
    const remainingCount = 9 - images.length - activePendingCount
    if (remainingCount <= 0) {
      Alert.alert('提示', '最多只能上传 9 张照片喔！')
      return
    }

    const permissonResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (permissonResult.granted === false) {
      Alert.alert('提示', '需要访问相册权限才能上传图片！')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingCount,
      aspect: [1, 1],
      quality: 1
    })

    if (!result.canceled) {
      const newUris = result.assets.map(item => item.uri)
      const newImageItems: ImageItem[] = newUris.map(uri => ({
        uri,
        status: 'uploading'
      }))
      setPendingImages(prev => [...prev, ...newImageItems])

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
  const isNotDraft = draft.status !== 'draft'

  const refreshHomeLists = () => {
    void dispatch(fetchPostList({ page: 1, strategy: 'random', force: true }))
    void dispatch(fetchPostList({ page: 1, strategy: 'hot', force: true }))
  }

  const handleSave = useCallback(async () => {
    if (saving || publishing || deleting) return
    if (isUploadingImages) {
      Alert.alert('提示', '图片上传中，请稍后再试')
      return
    }
    if (isNotDraft) {
      showMessage('该草稿已发布，无需再保存')
      navigation.goBack()
      return
    }
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle) {
      Alert.alert('提示', '请输入帖子标题')
      return
    }
    if (!trimmedContent) {
      Alert.alert('提示', '请输入帖子内容')
      return
    }

    setSaving(true)
    try {
      const signal = cancelOngoingRequest()
      await updateDraft(
        draft.post_id,
        {
          title: trimmedTitle,
          content: {
            text: trimmedContent,
            images
          },
          tag_ids: selectedTags
        },
        { signal }
      )
      showMessage('已保存草稿')
    } catch (error) {
      console.error(error)
      Alert.alert('提示', error instanceof Error ? error.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }, [
    content,
    deleting,
    draft.post_id,
    images,
    isNotDraft,
    isUploadingImages,
    navigation,
    publishing,
    saving,
    selectedTags,
    showMessage,
    title
  ])

  const handlePublish = useCallback(async () => {
    if (saving || publishing || deleting) return
    if (isUploadingImages) {
      Alert.alert('提示', '图片上传中，请稍后再试')
      return
    }
    if (isNotDraft) {
      showMessage('无需重复发布')
      refreshHomeLists()
      navigation.goBack()
      return
    }
    setPublishing(true)
    try {
      const signal = cancelOngoingRequest()
      await publishDraft(draft.post_id, { signal })
      showMessage('发布成功')
      refreshHomeLists()
      navigation.goBack()
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : '发布失败'
      if (message.includes('已发布') || message.includes('无需')) {
        showMessage('无需重复发布')
        refreshHomeLists()
        navigation.goBack()
        return
      }
      Alert.alert('提示', message)
    } finally {
      setPublishing(false)
    }
  }, [
    deleting,
    draft.post_id,
    isNotDraft,
    isUploadingImages,
    navigation,
    publishing,
    refreshHomeLists,
    saving,
    showMessage
  ])

  const doDelete = useCallback(async () => {
    setDeleting(true)
    try {
      const signal = cancelOngoingRequest()
      await deleteDraft(draft.post_id, { signal })
      showMessage('已删除')
      navigation.goBack()
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : '删除失败'
      if (message.includes('不存在') || message.includes('已删除')) {
        showMessage('草稿不存在或已删除')
        navigation.goBack()
        return
      }
      Alert.alert('提示', message)
    } finally {
      setDeleting(false)
    }
  }, [draft.post_id, navigation, showMessage])

  const handleDelete = useCallback(() => {
    if (saving || publishing || deleting) return
    if (isNotDraft) {
      showMessage('草稿不存在或已删除')
      navigation.goBack()
      return
    }
    Alert.alert('确认删除', '确定要删除这条草稿吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => void doDelete() }
    ])
  }, [
    deleting,
    doDelete,
    isNotDraft,
    navigation,
    publishing,
    saving,
    showMessage
  ])

  const disableActions = saving || publishing || deleting || isUploadingImages

  return (
    <View style={styles.container}>
      <AddPostHeader title="编辑草稿" />

      <AppKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
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

          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={['#ffffff', '#fff1f2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <PostToolbar
                initialTagIds={selectedTags}
                initialIsPublic={isPublic}
                onTagsChange={(tagIds, tagNames) => {
                  setSelectedTags(tagIds)
                }}
                onPrivacyChange={setIsPublic}
              />
            </LinearGradient>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 20) }
          ]}
        >
          <Button
            mode="contained"
            style={styles.footerButton}
            onPress={handleSave}
            loading={saving}
            disabled={disableActions}
            buttonColor="#f43f5e"
            uppercase={false}
          >
            保存
          </Button>
          <Button
            mode="contained"
            style={styles.footerButton}
            onPress={handlePublish}
            loading={publishing}
            disabled={disableActions}
            buttonColor="#fb7185"
            uppercase={false}
          >
            发布
          </Button>
          <Button
            mode="outlined"
            style={styles.footerButton}
            onPress={handleDelete}
            loading={deleting}
            disabled={disableActions}
            textColor="#ef4444"
            uppercase={false}
          >
            删除
          </Button>
        </View>
      </AppKeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  flex: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 15
  },
  cardWrapper: {
    marginBottom: 15,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderRadius: 20,
    backgroundColor: '#fff'
  },
  cardGradient: {
    borderRadius: 20,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#fff'
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f5f7fa'
  },
  footerButton: {
    flex: 1,
    borderRadius: 22
  }
})
