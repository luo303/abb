import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export default function PostToolbar() {
  return (
    <View style={styles.toolbar}>
      <TouchableOpacity style={styles.toolItem}>
        <View style={styles.iconBg}>
          <Ionicons name="location" size={20} color="#1f99b0" />
        </View>
        <Text style={styles.toolText}>所在位置</Text>
        <Text style={styles.valueText}>北京市·朝阳区</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="#ccc"
          style={styles.arrow}
        />
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity style={styles.toolItem}>
        <View style={[styles.iconBg, { backgroundColor: '#fff0f6' }]}>
          <Ionicons name="pricetag" size={20} color="#eb2f96" />
        </View>
        <Text style={styles.toolText}>添加话题</Text>
        <View style={styles.tagsContainer}>
          <Text style={styles.tag}>#宝宝日常</Text>
          <Text style={styles.tag}>#成长记录</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="#ccc"
          style={styles.arrow}
        />
      </TouchableOpacity>
      <View style={styles.divider} />

      <TouchableOpacity style={styles.toolItem}>
        <View style={[styles.iconBg, { backgroundColor: '#f6ffed' }]}>
          <Ionicons name="eye" size={20} color="#52c41a" />
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

      {/* 静态提示卡片 */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb-outline" size={18} color="#faad14" />
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
    backgroundColor: '#fff',
    marginTop: 10 // 只保留一点间距，不再使用粗边框
  },
  toolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff'
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e6f7ff',
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
    color: '#1f99b0',
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden'
  },
  arrow: {
    marginLeft: 10
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
    borderRadius: 12,
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
  }
})
