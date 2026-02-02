import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

// 导入组件
import BabyStats from '../../components/growth/BabyStats'
import BabyAlbum from '../../components/growth/BabyAlbum'
import GrowthChart from '../../components/growth/GrowthChart'
import BabyDiary from '../../components/growth/BabyDiary'

export default function GrowthRecord() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#fff', '#f0f4f8']} style={styles.background} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* 顶部头部区域 */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.headerTitle}>成长记录</Text>
            <Text style={styles.headerSubtitle}>陪伴宝宝成长的每一步</Text>
          </View>
          <View style={styles.avatarContainer}>
            <ImageBackground
              source={require('../../assets/testAvatar.png')}
              style={styles.headerAvatar}
              imageStyle={{ borderRadius: 20 }}
            />
          </View>
        </View>

        {/* 模块列表 */}
        <View style={styles.moduleList}>
          <BabyStats />
          <BabyAlbum />
          <GrowthChart />
          <BabyDiary />
        </View>

        {/* 底部装饰 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>—— 记录宝宝成长的每一天 ——</Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 20
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  avatarContainer: {
    shadowColor: '#4A8B95',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  headerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff'
  },
  moduleList: {
    gap: 20
  },
  footer: {
    marginTop: 30,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerText: {
    fontSize: 12,
    color: '#a0aec0',
    letterSpacing: 2
  }
})
