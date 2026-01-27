import { View, Text, StyleSheet, ScrollView } from 'react-native'

// 导入组件
import BabyAlbum from '../../components/growth/BabyAlbum'
import GrowthChart from '../../components/growth/GrowthChart'
import BabyDiary from '../../components/growth/BabyDiary'

export default function GrowthRecord() {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false} // 隐藏水平滚动条
        horizontal={false} // 明确禁止水平滚动
      >
        <BabyAlbum />
        <GrowthChart />
        <BabyDiary />

        {/* 底部装饰：添加一个结束语或slogan，让页面不那么突兀 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>—— 记录宝宝成长的每一天 ——</Text>
        </View>

        {/* 底部安全距离占位 */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%', // 确保容器宽度为100%，防止子元素超出
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1,
    width: '100%' // 确保滚动视图宽度占满
  },
  scrollContent: {
    padding: 15
  },
  footer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    letterSpacing: 1
  }
})
