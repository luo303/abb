import React from 'react'
import { View, Text, StyleSheet, ImageBackground } from 'react-native'
import PagerView from 'react-native-pager-view'

export default function HomeBanner() {
  return (
    <View style={styles.pagerContainer}>
      <PagerView style={styles.pagerView} initialPage={0}>
        {/* 页面1：专家建议 */}
        <View key="1" style={styles.page}>
          <ImageBackground
            source={{
              uri: 'https://via.placeholder.com/600x300/e0f7fa/006064?text=专家建议'
            }}
            style={styles.backgroundImage}
            imageStyle={{ borderRadius: 15 }}
          >
            {/* 实际项目中这里可以使用真实的图片组件 */}
            <View style={styles.overlay}>
              <Text style={styles.bannerText}>专家建议</Text>
            </View>
          </ImageBackground>
        </View>
        {/* 页面2：热门帖子 */}
        <View key="2" style={styles.page}>
          <ImageBackground
            source={{
              uri: 'https://via.placeholder.com/600x300/fff9c4/fbc02d?text=热门帖子'
            }}
            style={styles.backgroundImage}
            imageStyle={{ borderRadius: 15 }}
          >
            <View style={styles.overlay}>
              <Text style={styles.bannerText}>热门帖子</Text>
            </View>
          </ImageBackground>
        </View>
        {/* 页面3：AI问答 */}
        <View key="3" style={styles.page}>
          <ImageBackground
            source={{
              uri: 'https://via.placeholder.com/600x300/e1bee7/8e24aa?text=AI问答'
            }}
            style={styles.backgroundImage}
            imageStyle={{ borderRadius: 15 }}
          >
            <View style={styles.overlay}>
              <Text style={styles.bannerText}>AI问答</Text>
            </View>
          </ImageBackground>
        </View>
      </PagerView>
      {/* 指示点 (可选) */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicator} />
        <View style={styles.indicator} />
        <View style={styles.indicator} />
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
    // backgroundColor: 'rgba(0,0,0,0.1)',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginHorizontal: 4
  }
})
