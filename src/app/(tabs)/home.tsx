import React, { useState, useRef } from 'react'
import { View, StyleSheet, ScrollView, Text, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
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
  const scrollViewRef = useRef<ScrollView>(null)
  const [communityY, setCommunityY] = useState(0)
  const scrollY = useRef(new Animated.Value(0)).current

  // 定义滚动动作
  const handleScrollToCommunity = () => {
    scrollViewRef.current?.scrollTo({ y: communityY, animated: true })
  }
  const [isSearching, setIsSearching] = useState(false)

  return (
    <HomeScrollToContext.Provider
      value={{ scrollToCommunity: handleScrollToCommunity }}
    >
      <View style={styles.mainContainer}>
        {/* 全局背景渐变 */}
        <LinearGradient
          colors={['#cffafe', '#e0f2fe', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        />

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* 1. 搜索管理组件 (包含搜索栏和搜索结果) */}
          <View style={styles.searchSection}>
            <HomeSearchManager
              posts={MOCK_POSTS}
              onSearchStateChange={setIsSearching}
            />
          </View>

          {/* 只有在没有搜索内容时，才显示轮播图和导航网格以及默认帖子列表 */}
          {!isSearching && (
            <>
              {/* 2. 顶部轮播图组件 */}
              <View style={styles.bannerSection}>
                <HomeBanner />
              </View>

              {/* 3. 中间功能导航组件 */}
              <HomeNavGrid />

              {/* 4. 底部默认社区模块组件列表 */}
              <View
                style={styles.communitySection}
                onLayout={e => setCommunityY(e.nativeEvent.layout.y)}
              >
                {/* 社区标题头 */}
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleWrapper}>
                    <LinearGradient
                      colors={['#22d3ee', '#3b82f6']}
                      style={styles.iconBox}
                    >
                      <Ionicons name="people" size={16} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.sectionTitle}>宝妈社区</Text>
                  </View>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.badgeText}>最新动态</Text>
                  </View>
                </View>

                {MOCK_POSTS.map((post, index) => (
                  <View key={post.id} style={{ marginBottom: 12 }}>
                    <HomeCommunityCard data={post} />
                  </View>
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  container: {
    flex: 1,
    paddingTop: 10
  },
  searchSection: {
    paddingHorizontal: 0,
    marginBottom: 10,
    zIndex: 10
  },
  bannerSection: {
    marginBottom: 10
  },
  communitySection: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  sectionBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd'
  },
  badgeText: {
    fontSize: 11,
    color: '#0ea5e9',
    fontWeight: '600'
  }
})
