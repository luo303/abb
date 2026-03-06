import React from 'react'
import { View, StyleSheet } from 'react-native'
import HomeBanner from './Banner/HomeBanner'
import HomeNavGrid from './HomeNavGrid'

// 记忆化组件，防止闪烁
const MemoBanner = React.memo(HomeBanner)
const MemoNavGrid = React.memo(HomeNavGrid)

interface MemoHeaderSectionsProps {
  style?: any
}

export default function MemoHeaderSections({ style }: MemoHeaderSectionsProps) {
  return (
    <View style={[styles.container, style]}>
      <MemoBanner />
      <MemoNavGrid />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 5
  }
})
