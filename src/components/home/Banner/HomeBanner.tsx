import React, { useRef, useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import PagerView from 'react-native-pager-view'
import BannerItem from './BannerItem'

/**
 * HomeBanner 组件
 * 实现一个自动轮播的横幅组件，包含多个页面和指示点
 */
export default function HomeBanner() {
  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = 3

  useEffect(() => {
    const timer = setInterval(() => {
      // 正常轮播：当前页 + 1
      let nextPage = currentPage + 1

      // 如果到了最后一页（副本页），则重置为第一页（逻辑上）
      // 但这里我们让它先滑到副本页，然后在 onPageSelected 中处理重置
      if (nextPage > totalPages) {
        nextPage = 0
        pagerRef.current?.setPageWithoutAnimation(nextPage)
        setCurrentPage(nextPage)
      } else {
        pagerRef.current?.setPage(nextPage)
        setCurrentPage(nextPage)
      }
    }, 3000)

    return () => clearInterval(timer)
  }, [currentPage])

  const onPageSelected = (e: any) => {
    const position = e.nativeEvent.position
    setCurrentPage(position)

    // 如果滚动到了最后一页（副本页），瞬间切回第一页
    if (position === totalPages) {
      setTimeout(() => {
        pagerRef.current?.setPageWithoutAnimation(0)
        setCurrentPage(0)
      }, 500) // 等待动画完成
    }
  }

  return (
    <View style={styles.pagerContainer}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        {/* 页面 1 ： AI 助手 */}
        <BannerItem
          key="1"
          imageSource={require('../../../assets/poster_ai 2.0.jpg')}
          targetPage={'AIAssistant'}
        ></BannerItem>

        {/* 页面 2 ： 查忌口 */}
        <BannerItem
          key="2"
          imageSource={require('../../../assets/poster_cjk.png')}
          targetPage={'Taboo'}
        ></BannerItem>

        {/* 页面 3 ： 社区 */}
        <BannerItem
          key="3"
          imageSource={require('../../../assets/poster_community.png')}
          targetPage="scrollToCommunity"
        ></BannerItem>
      </PagerView>
      {/* 指示点 */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2].map(index => (
          <View
            key={index}
            style={[
              styles.indicator,
              (currentPage === index ||
                (currentPage === totalPages && index === 0)) &&
                styles.activeIndicator
            ]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pagerContainer: {
    height: 200,
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  pagerView: {
    flex: 1
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  overlay: {
    padding: 10,
    borderRadius: 5
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)', // 默认半透明白
    marginHorizontal: 4
  },
  activeIndicator: {
    backgroundColor: '#ffffff', // 激活时纯白
    width: 16 // 激活时变宽
  }
})
