import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Switch, Provider } from '@ant-design/react-native'

interface Tag {
  id: string
  name: string
}

interface PostToolbarProps {
  onTagsChange?: (tagIds: string[]) => void
  onPrivacyChange?: (isPublic: boolean) => void
}

const TAGS: Tag[] = [
  { id: 'tag_001', name: '宝宝日常' },
  { id: 'tag_002', name: '成长记录' },
  { id: 'tag_003', name: '育儿经验' },
  { id: 'tag_004', name: '亲子时光' },
  { id: 'tag_005', name: '辅食分享' },
  { id: 'tag_006', name: '绘本推荐' },
  { id: 'tag_007', name: '玩具测评' },
  { id: 'tag_008', name: '好物分享' },
  { id: 'tag_009', name: '宝宝穿搭' },
  { id: 'tag_010', name: '出行攻略' },
  { id: 'tag_011', name: '早教启蒙' },
  { id: 'tag_012', name: '睡眠引导' },
  { id: 'tag_013', name: '疾病护理' },
  { id: 'tag_014', name: '疫苗接种' },
  { id: 'tag_015', name: '情感交流' }
]

const customTheme = {
  // 修改主色调为 App 主题色 (Warm Red)
  brand_primary: '#f43f5e',
  color_link: '#f43f5e', // 影响“确定”按钮颜色

  // 优化字体颜色
  color_text_base: '#333333',
  color_text_caption: '#999999',

  // 边框颜色
  border_color_base: '#eeeeee'
}

export default function PostToolbar({
  onTagsChange,
  onPrivacyChange
}: PostToolbarProps) {
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)

  const toggleTag = (tagId: string) => {
    let newTagIds
    if (selectedTagIds.includes(tagId)) {
      newTagIds = selectedTagIds.filter(id => id !== tagId)
    } else {
      newTagIds = [...selectedTagIds, tagId]
    }
    setSelectedTagIds(newTagIds)
    if (onTagsChange) {
      onTagsChange(newTagIds)
    }
  }

  // Helper function to get tag name from ID
  const getTagName = (tagId: string): string => {
    const tag = TAGS.find(t => t.id === tagId)
    return tag ? tag.name : ''
  }

  const handlePrivacyChange = (checked: boolean) => {
    setIsPublic(checked)
    if (onPrivacyChange) {
      onPrivacyChange(checked)
    }
  }

  // 点击整个条目切换开关状态
  const togglePrivacy = () => {
    handlePrivacyChange(!isPublic)
  }

  return (
    <Provider theme={customTheme}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setShowTagsModal(true)}
        >
          <View style={[styles.iconBg, { backgroundColor: '#fff1f2' }]}>
            <Ionicons name="pricetag" size={20} color="#f43f5e" />
          </View>
          <Text style={styles.toolText}>添加话题</Text>
          <View style={styles.tagsContainer}>
            {selectedTagIds.length > 0
              ? selectedTagIds.slice(0, 2).map(tagId => (
                  <Text key={tagId} style={styles.tag}>
                    #{getTagName(tagId)}
                  </Text>
                ))
              : null}
            {selectedTagIds.length > 2 && (
              <Text style={styles.tag}>+{selectedTagIds.length - 2}</Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#ccc"
            style={styles.arrow}
          />
        </TouchableOpacity>

        <Modal
          visible={showTagsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTagsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '60%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>选择话题</Text>
                <TouchableOpacity onPress={() => setShowTagsModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* 已选择的话题显示区域 */}
              {selectedTagIds.length > 0 && (
                <View style={styles.selectedTagsContainer}>
                  <Text style={styles.selectedTagsTitle}>已选择的话题</Text>
                  <View style={styles.selectedTagsList}>
                    {selectedTagIds.map(tagId => (
                      <TouchableOpacity
                        key={tagId}
                        style={styles.selectedTagItem}
                        onPress={() => toggleTag(tagId)}
                      >
                        <Text style={styles.selectedTagText}>
                          #{getTagName(tagId)}
                        </Text>
                        <Ionicons
                          name="close-circle"
                          size={16}
                          color="#f43f5e"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <ScrollView contentContainerStyle={styles.tagsList}>
                <View style={styles.tagsWrapper}>
                  {TAGS.map(tag => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagItem,
                        selectedTagIds.includes(tag.id) && styles.tagItemActive
                      ]}
                      onPress={() => toggleTag(tag.id)}
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
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setShowTagsModal(false)}
              >
                <LinearGradient
                  colors={['#ff9a9e', '#f43f5e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmText}>确定</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.toolItem}
          activeOpacity={0.7}
          onPress={togglePrivacy}
        >
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
              checked={isPublic}
              onChange={handlePrivacyChange}
              style={{ transform: [{ scale: 0.8 }] }}
              trackColor={{ false: '#e5e5e5', true: '#f43f5e' }}
              thumbColor="#fff"
            />
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />

        {/* 静态提示卡片 */}
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
    </Provider>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    marginTop: 0
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 59 // icon width + margin + padding
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
  tagItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#f0f0f0'
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
  },
  customTagInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 16,
    gap: 10
  },
  customTagInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: '#f8f8f8'
  },
  addTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addTagButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  selectedTagsContainer: {
    marginBottom: 16,
    paddingHorizontal: 10
  },
  selectedTagsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  selectedTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  selectedTagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#f43f5e',
    gap: 6
  },
  selectedTagText: {
    fontSize: 13,
    color: '#f43f5e'
  }
})
