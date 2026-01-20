import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import HomeBanner from '@/components/home/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'

export default function Home() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. 顶部轮播图组件 */}
      <HomeBanner />

      {/* 2. 中间功能导航组件 */}
      <HomeNavGrid />

      {/* 3. 底部社区模块组件 */}
      <HomeCommunityCard />

      {/* 3. 底部社区模块组件 */}
      <HomeCommunityCard />

      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingTop: 10
  }
})
