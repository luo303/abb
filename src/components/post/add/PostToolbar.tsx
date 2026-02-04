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
import { Picker, Provider } from '@ant-design/react-native'

interface PostToolbarProps {
  onLocationChange?: (locationName: string) => void
  onTagsChange?: (tags: string[]) => void
}

const PROVINCES = [
  { label: '不显示位置', value: '' },
  { label: '北京市', value: '北京市' },
  { label: '天津市', value: '天津市' },
  { label: '河北省', value: '河北省' },
  { label: '山西省', value: '山西省' },
  { label: '内蒙古自治区', value: '内蒙古自治区' },
  { label: '辽宁省', value: '辽宁省' },
  { label: '吉林省', value: '吉林省' },
  { label: '黑龙江省', value: '黑龙江省' },
  { label: '上海市', value: '上海市' },
  { label: '江苏省', value: '江苏省' },
  { label: '浙江省', value: '浙江省' },
  { label: '安徽省', value: '安徽省' },
  { label: '福建省', value: '福建省' },
  { label: '江西省', value: '江西省' },
  { label: '山东省', value: '山东省' },
  { label: '河南省', value: '河南省' },
  { label: '湖北省', value: '湖北省' },
  { label: '湖南省', value: '湖南省' },
  { label: '广东省', value: '广东省' },
  { label: '广西壮族自治区', value: '广西壮族自治区' },
  { label: '海南省', value: '海南省' },
  { label: '重庆市', value: '重庆市' },
  { label: '四川省', value: '四川省' },
  { label: '贵州省', value: '贵州省' },
  { label: '云南省', value: '云南省' },
  { label: '西藏自治区', value: '西藏自治区' },
  { label: '陕西省', value: '陕西省' },
  { label: '甘肃省', value: '甘肃省' },
  { label: '青海省', value: '青海省' },
  { label: '宁夏回族自治区', value: '宁夏回族自治区' },
  { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区' },
  { label: '香港特别行政区', value: '香港特别行政区' },
  { label: '澳门特别行政区', value: '澳门特别行政区' },
  { label: '台湾省', value: '台湾省' }
]

const TAGS = [
  '宝宝日常',
  '成长记录',
  '育儿经验',
  '亲子时光',
  '辅食分享',
  '绘本推荐',
  '玩具测评',
  '好物分享',
  '宝宝穿搭',
  '出行攻略',
  '早教启蒙',
  '睡眠引导',
  '疾病护理',
  '疫苗接种',
  '情感交流'
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
  onLocationChange,
  onTagsChange
}: PostToolbarProps) {
  const [locationName, setLocationName] = useState('')
  const [visible, setVisible] = useState(false)
  const [showTagsModal, setShowTagsModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleSelectLocation = (value: any) => {
    const selectedValue = value[0]
    setLocationName(selectedValue)
    if (onLocationChange) {
      onLocationChange(selectedValue)
    }
    setVisible(false)
  }

  const toggleTag = (tag: string) => {
    let newTags
    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag)
    } else {
      if (selectedTags.length >= 5) {
        Alert.alert('提示', '最多只能添加5个话题哦')
        return
      }
      newTags = [...selectedTags, tag]
    }
    setSelectedTags(newTags)
    if (onTagsChange) {
      onTagsChange(newTags)
    }
  }

  return (
    <Provider theme={customTheme}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setVisible(true)}
        >
          <View style={styles.iconBg}>
            <Ionicons name="location" size={20} color="#f43f5e" />
          </View>
          <Text style={styles.toolText}>所在位置</Text>
          <Text style={styles.valueText}>{locationName || '点击选择省份'}</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#ccc"
            style={styles.arrow}
          />
        </TouchableOpacity>

        <Picker
          visible={visible}
          data={PROVINCES}
          cols={1}
          value={[locationName]}
          onChange={handleSelectLocation}
          onDismiss={() => setVisible(false)}
          onOk={handleSelectLocation}
          title="选择所在省份"
          okText="确定"
          dismissText="取消"
          itemStyle={{ fontSize: 16, fontWeight: '500', color: '#333' }}
        >
          <View />
        </Picker>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.toolItem}
          onPress={() => setShowTagsModal(true)}
        >
          <View style={[styles.iconBg, { backgroundColor: '#fff1f2' }]}>
            <Ionicons name="pricetag" size={20} color="#f43f5e" />
          </View>
          <Text style={styles.toolText}>添加话题</Text>
          <View style={styles.tagsContainer}>
            {selectedTags.length > 0 ? (
              selectedTags.slice(0, 2).map(tag => (
                <Text key={tag} style={styles.tag}>
                  #{tag}
                </Text>
              ))
            ) : (
              <>
                <Text style={styles.tag}>#宝宝日常</Text>
                <Text style={styles.tag}>#成长记录</Text>
              </>
            )}
            {selectedTags.length > 2 && (
              <Text style={styles.tag}>+{selectedTags.length - 2}</Text>
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
                <Text style={styles.modalTitle}>选择话题 (最多5个)</Text>
                <TouchableOpacity onPress={() => setShowTagsModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.tagsList}>
                <View style={styles.tagsWrapper}>
                  {TAGS.map(tag => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagItem,
                        selectedTags.includes(tag) && styles.tagItemActive
                      ]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text
                        style={[
                          styles.tagItemText,
                          selectedTags.includes(tag) && styles.tagItemTextActive
                        ]}
                      >
                        #{tag}
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

        <TouchableOpacity style={styles.toolItem}>
          <View style={[styles.iconBg, { backgroundColor: '#fff7ed' }]}>
            <Ionicons name="eye" size={20} color="#f97316" />
          </View>
          <Text style={styles.toolText}>可见范围</Text>
          <Text style={styles.valueText}>公开</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#ccc"
            style={styles.arrow}
          />
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
  listContent: {
    paddingBottom: 20
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0'
  },
  locationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  locationInfo: {
    flex: 1
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4
  },
  locationAddress: {
    fontSize: 12,
    color: '#999'
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
  }
})
