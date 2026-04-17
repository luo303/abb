import React, { useState, useRef } from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Button } from 'react-native-paper'
import { createPost } from '@/api/home'
import { useMessage } from '@/components/Message'
import { NavigationProps } from '@/types/navigation'

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
  const [isPublishing, setIsPublishing] = useState(false)
  const isPublishingRef = useRef(false)
  const { showMessage } = useMessage()

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
        tag_ids: [],
        isPublic: 1,
        status: 'milestone' as const,
        title: data.title || ''
      }

      const createResponse = await createPost(payload)
      const postId = createResponse.data.post_id
      if (!postId) {
        throw new Error('未获取到 post_id')
      }

      showMessage('已保存大事记')
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
      <Button
        mode="contained"
        style={[styles.publishButton, disabled && styles.publishButtonDisabled]}
        contentStyle={styles.publishButtonContent}
        labelStyle={styles.publishText}
        onPress={handlePublish}
        disabled={disabled}
        loading={isPublishing}
        buttonColor="#f43f5e"
        uppercase={false}
      >
        保存大事记
      </Button>
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
    borderRadius: 25,
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
  publishButtonContent: {
    height: 50
  },
  publishText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})
