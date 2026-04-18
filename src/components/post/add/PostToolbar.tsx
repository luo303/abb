import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Switch, TouchableRipple } from 'react-native-paper'

import { getPostTags } from '@/api/post'

interface Tag {
  id: string
  name: string
}

interface PostToolbarProps {
  onTagsChange?: (tagIds: string[], tagNames: string[]) => void
  onPrivacyChange?: (isPublic: boolean) => void
  initialTagIds?: string[]
  initialIsPublic?: boolean
}

export default function PostToolbar({
  onTagsChange,
  onPrivacyChange,
  initialTagIds,
  initialIsPublic
}: PostToolbarProps) {
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [isTagsLoading, setIsTagsLoading] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)

  useEffect(() => {
    if (initialTagIds && initialTagIds.length > 0) {
      setSelectedTagIds(initialTagIds)
    }
    if (typeof initialIsPublic === 'boolean') {
      setIsPublic(initialIsPublic)
    }
  }, [initialIsPublic, initialTagIds])

  useEffect(() => {
    let cancelled = false

    const fetchTags = async () => {
      setIsTagsLoading(true)
      try {
        const pageSize = 20
        let page = 1
        let hasMore = true
        const tagMap = new Map<string, Tag>()

        while (hasMore) {
          const res = await getPostTags(page, pageSize)
          if (res.code !== 0 && res.code !== 200) {
            throw new Error(res.message || '获取话题列表失败')
          }
          const items = res.data?.items || []
          items.forEach(item => {
            if (!tagMap.has(item.tag_id)) {
              tagMap.set(item.tag_id, { id: item.tag_id, name: item.name })
            }
          })
          hasMore = !!res.data?.has_more
          page += 1
        }

        if (!cancelled) {
          setTags(Array.from(tagMap.values()))
        }
      } catch {
        if (!cancelled) {
          Alert.alert('提示', '获取话题列表失败，请稍后重试')
        }
      } finally {
        if (!cancelled) {
          setIsTagsLoading(false)
        }
      }
    }

    fetchTags()
    return () => {
      cancelled = true
    }
  }, [])

  const getTagName = (tagId: string): string => {
    const tag = tags.find(item => item.id === tagId)
    return tag ? tag.name : ''
  }

  useEffect(() => {
    if (!onTagsChange) return
    if (selectedTagIds.length === 0) return
    const names = selectedTagIds.map(id => getTagName(id)).filter(Boolean)
    onTagsChange(selectedTagIds, names)
  }, [onTagsChange, selectedTagIds, tags])

  const toggleTag = (tagId: string) => {
    let newTagIds: string[]
    if (selectedTagIds.includes(tagId)) {
      newTagIds = selectedTagIds.filter(id => id !== tagId)
    } else {
      newTagIds = [...selectedTagIds, tagId]
    }
    setSelectedTagIds(newTagIds)
    onTagsChange?.(
      newTagIds,
      newTagIds.map(id => getTagName(id)).filter(Boolean)
    )
  }

  const handlePrivacyChange = (checked: boolean) => {
    setIsPublic(checked)
    onPrivacyChange?.(checked)
  }

  const togglePrivacy = () => {
    handlePrivacyChange(!isPublic)
  }

  return (
    <View style={styles.toolbar}>
      <TouchableRipple
        onPress={() => setShowTagsModal(true)}
        rippleColor="rgba(244, 63, 94, 0.08)"
        style={styles.toolItem}
      >
        <>
          <View style={[styles.iconBg, { backgroundColor: '#fff1f2' }]}>
            <Ionicons name="pricetag" size={20} color="#f43f5e" />
          </View>
          <Text style={styles.toolText}>添加话题</Text>
          <View style={styles.tagsContainer}>
            {isTagsLoading ? (
              <ActivityIndicator size="small" color="#f43f5e" />
            ) : selectedTagIds.length > 0 ? (
              selectedTagIds.slice(0, 2).map(tagId => (
                <Text key={tagId} style={styles.tag}>
                  #{getTagName(tagId)}
                </Text>
              ))
            ) : null}
            {selectedTagIds.length > 2 ? (
              <Text style={styles.tag}>+{selectedTagIds.length - 2}</Text>
            ) : null}
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#ccc"
            style={styles.arrow}
          />
        </>
      </TouchableRipple>

      <Modal
        visible={showTagsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTagsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择话题</Text>
              <TouchableRipple
                borderless
                onPress={() => setShowTagsModal(false)}
                style={styles.iconButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableRipple>
            </View>

            <ScrollView contentContainerStyle={styles.tagsList}>
              <View style={styles.tagsWrapper}>
                {isTagsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#f43f5e" />
                    <Text style={styles.loadingText}>话题加载中...</Text>
                  </View>
                ) : tags.length > 0 ? (
                  tags.map(tag => (
                    <TouchableRipple
                      key={tag.id}
                      onPress={() => toggleTag(tag.id)}
                      rippleColor="rgba(244, 63, 94, 0.08)"
                      style={[
                        styles.tagItem,
                        selectedTagIds.includes(tag.id) && styles.tagItemActive
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagItemText,
                          selectedTagIds.includes(tag.id) &&
                            styles.tagItemTextActive
                        ]}
                      >
                        #{tag.name}
                      </Text>
                    </TouchableRipple>
                  ))
                ) : (
                  <Text style={styles.emptyText}>暂无可选话题</Text>
                )}
              </View>
            </ScrollView>

            <TouchableRipple
              onPress={() => setShowTagsModal(false)}
              style={styles.confirmButton}
            >
              <LinearGradient
                colors={['#ff9a9e', '#f43f5e']}
                end={{ x: 1, y: 0 }}
                start={{ x: 0, y: 0 }}
                style={styles.confirmGradient}
              >
                <Text style={styles.confirmText}>确定</Text>
              </LinearGradient>
            </TouchableRipple>
          </View>
        </View>
      </Modal>

      <View style={styles.divider} />

      <TouchableRipple
        onPress={togglePrivacy}
        rippleColor="rgba(244, 63, 94, 0.08)"
        style={styles.toolItem}
      >
        <>
          <View style={[styles.iconBg, { backgroundColor: '#fff1f2' }]}>
            <Ionicons
              name={isPublic ? 'eye' : 'eye-off'}
              size={20}
              color="#f43f5e"
            />
          </View>
          <Text style={styles.toolText}>可见范围</Text>
          <View style={styles.switchContainer}>
            <Text style={[styles.valueText, { marginRight: 8 }]}>
              {isPublic ? '公开' : '私密'}
            </Text>
            <Switch
              color="#f43f5e"
              onValueChange={handlePrivacyChange}
              style={{ transform: [{ scale: 0.8 }] }}
              value={isPublic}
            />
          </View>
        </>
      </TouchableRipple>

      <View style={styles.divider} />

      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb-outline" size={18} color="#f59e0b" />
          <Text style={styles.tipsTitle}>优质帖子小贴士</Text>
        </View>
        <Text style={styles.tipsContent}>
          1. 分享真实的育儿经验更容易获得共鸣{'\n'}
          2. 添加清晰的宝宝照片会更受欢迎{'\n'}
          3. 使用合适的话题标签可以让更多人看到{'\n'}
          4. 尊重他人隐私，不发布他人敏感信息{'\n'}
          5. 友善互动，共建温暖的育儿社区
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    marginTop: 0
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    overflow: 'hidden'
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 20,
    backgroundColor: '#fff1f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  toolText: {
    fontSize: 15,
    color: '#333',
    flex: 1
  },
  valueText: {
    fontSize: 14,
    color: '#999',
    marginRight: 5
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8
  },
  tag: {
    fontSize: 12,
    color: '#f43f5e',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    overflow: 'hidden'
  },
  arrow: {
    marginLeft: 10
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '50%',
    padding: 16
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  iconButton: {
    borderRadius: 16
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 59
  },
  tipsCard: {
    margin: 15,
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fffbe6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffe58f'
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d48806',
    marginLeft: 6
  },
  tipsContent: {
    fontSize: 12,
    color: '#d48806',
    lineHeight: 20
  },
  tagsList: {
    paddingVertical: 10
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  loadingContainer: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999'
  },
  emptyText: {
    width: '100%',
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
    paddingVertical: 20
  },
  tagItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden'
  },
  tagItemActive: {
    backgroundColor: '#fff1f2',
    borderColor: '#f43f5e'
  },
  tagItemText: {
    fontSize: 14,
    color: '#666'
  },
  tagItemTextActive: {
    color: '#f43f5e',
    fontWeight: 'bold'
  },
  confirmButton: {
    marginTop: 16,
    borderRadius: 24,
    overflow: 'hidden'
  },
  confirmGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
