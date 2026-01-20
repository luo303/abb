import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import HomeBanner from '@/components/home/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchManager from '@/components/home/search/HomeSearchManager'
import { MOCK_POSTS } from '@/data/mock/homePosts'

export default function Home() {
  const [isSearching, setIsSearching] = useState(false)

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. 搜索管理组件 (包含搜索栏和搜索结果) */}
      <HomeSearchManager
        posts={MOCK_POSTS}
        onSearchStateChange={setIsSearching}
      />

      {/* 只有在没有搜索内容时，才显示轮播图和导航网格以及默认帖子列表 */}
      {!isSearching && (
        <>
          {/* 2. 顶部轮播图组件 */}
          <HomeBanner />

          {/* 3. 中间功能导航组件 */}
          <HomeNavGrid />

          {/* 4. 底部默认社区模块组件列表 */}
          {MOCK_POSTS.map(post => (
            <HomeCommunityCard key={post.id} data={post} />
          ))}
        </>
      )}

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
