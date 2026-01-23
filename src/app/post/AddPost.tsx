import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NavigationProps } from '../../types/navigation'

// 导入子组件
import AddPostHeader from '@/components/post/add/AddPostHeader'
import PostInput from '@/components/post/add/PostInput'
import ImageUploader from '@/components/post/add/ImageUploader'
import PostToolbar from '@/components/post/add/PostToolbar'
import PostUserInfo from '@/components/post/add/PostUserInfo'
import PostFooter from '@/components/post/add/PostFooter'

export default function AddPostScreen() {
  const navigation = useNavigation<NavigationProps>()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])

  const handlePublish = () => {
    // 这里处理发布逻辑
    console.log('Publishing:', { content, images })
    // TODO: 调用API发布帖子
    navigation.goBack()
  }

  const handleAddImage = () => {
    // 这里先整张模拟图片，到时候调用 expo-image-picker
    setImages([...images, 'https://via.placeholder.com/150'])
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  return (
    <View style={styles.container}>
      <AddPostHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 主要内容卡片：包含用户信息、输入框和图片上传 */}
          <View style={styles.card}>
            <PostUserInfo />
            <PostInput value={content} onChangeText={setContent} />
            <ImageUploader
              images={images}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
            />
          </View>

          {/* 工具栏卡片 */}
          <View style={styles.card}>
            <PostToolbar />
          </View>
        </ScrollView>

        <PostFooter
          onPublish={handlePublish}
          isPublishDisabled={!content.trim()}
        />
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa' // 调整背景色为淡灰，以突显卡片
  },
  flex: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 15 // 给 ScrollView 添加内边距
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    paddingVertical: 5,
    // 阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2, // Android 阴影
    overflow: 'hidden' // 确保圆角生效
  }
})
