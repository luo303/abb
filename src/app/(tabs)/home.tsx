import React, { useState, useRef } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { HomeScrollToContext } from '@/context/HomeScrollContext'
import HomeBanner from '@/components/home/Banner/HomeBanner'
import HomeNavGrid from '@/components/home/HomeNavGrid'
import HomeCommunityCard from '@/components/home/HomeCommunityCard'
import HomeSearchManager from '@/components/home/search/HomeSearchManager'
import { MOCK_POSTS } from '@/data/mock/homePosts'

/**
 * 首页组件
 * 包含搜索管理、轮播图、功能导航和社区模块列表
 */
export default function Home() {
  const insets = useSafeAreaInsets()
  const scrollViewRef = useRef<ScrollView>(null)
  const [communityY, setCommunityY] = useState(0)
  // 定义滚动动作
  const handleScrollToCommunity = () => {
    scrollViewRef.current?.scrollTo({ y: communityY, animated: true })
  }
  const [isSearching, setIsSearching] = useState(false)

  return (
    <HomeScrollToContext.Provider
      value={{ scrollToCommunity: handleScrollToCommunity }}
    >
      <View
        style={{ flex: 1, paddingTop: insets.top, backgroundColor: '#fff' }}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={true} // 当为 true 时候，显示滚动条
          ref={scrollViewRef}
        >
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
              <View onLayout={e => setCommunityY(e.nativeEvent.layout.y)}>
                {MOCK_POSTS.map(post => (
                  <HomeCommunityCard key={post.id} data={post} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </HomeScrollToContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 改为纯白背景
    paddingTop: 0 // 移除顶部内边距
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8
  },
  sectionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1f99b0',
    marginTop: 2
  }
})
