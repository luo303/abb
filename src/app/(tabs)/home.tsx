import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import HomeBanner from '@/components/home/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchBar from '@/components/home/HomeSearchBar'

export default function Home() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. 顶部搜索栏组件 */}
      <HomeSearchBar />

      {/* 2. 顶部轮播图组件 */}
      <HomeBanner />

      {/* 3. 中间功能导航组件 */}
      <HomeNavGrid />

      {/* 4. 底部社区模块组件 */}
      <HomeCommunityCard />

      {/* 4. 底部社区模块组件 */}
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
