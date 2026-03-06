import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface TimelineNodeProps {
  style?: ViewStyle
  isLast?: boolean
}

/**
 * 统一的时间轴左侧节点组件
 * 包含一个红色圆点和向下延伸的线条
 */
export default function TimelineNode({
  style,
  isLast = false
}: TimelineNodeProps) {
  return (
    <View style={[styles.container, style]}>
      {/* 垂直连线 */}
      {!isLast && <View style={styles.line} />}
      {/* 节点圆点 */}
      <View style={styles.dot} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    // 确保容器有高度
    minHeight: 20
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f43f5e',
    borderWidth: 2,
    borderColor: '#fff', // 白色描边增加层次感
    zIndex: 10,
    marginTop: 6, // 稍微下移以对齐标题文字基线
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  line: {
    position: 'absolute',
    top: 14, // 从圆点中心下方开始
    bottom: -24, // 向下延伸，覆盖 item 之间的 margin
    width: 2,
    backgroundColor: '#ffe4e6',
    zIndex: 0
  }
})
