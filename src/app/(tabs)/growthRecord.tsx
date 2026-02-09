import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

// 导入组件
import BabyStats from '../../components/growth/BabyStats'
import BabyAlbum from '../../components/growth/BabyAlbum'
import GrowthChart from '../../components/growth/GrowthChart'
import BabyDiary from '../../components/growth/BabyDiary'

export default function GrowthRecord() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 顶部背景装饰 */}
      <View style={styles.headerBackgroundContainer}>
        <LinearGradient
          colors={['#fff1f2', '#ffe4e6']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.headerGradient, { height: 280 + insets.top }]}
        />
        <View style={styles.headerCurve} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* 顶部头部区域 */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <View style={styles.greetingRow}>
              <Text style={styles.headerTitle}>成长记录</Text>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>记录中</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              记录宝宝成长的每一个精彩瞬间 ✨
            </Text>
          </View>
          <View style={styles.avatarWrapper}>
            <ImageBackground
              source={require('../../assets/testAvatar.png')}
              style={styles.headerAvatar}
              imageStyle={{ borderRadius: 28 }}
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
    backgroundColor: '#fff' // 保持整体背景干净
  },
  headerBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0
  },
  headerGradient: {
    width: '100%'
  },
  headerCurve: {
    height: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -40
  },
  scrollView: {
    flex: 1,
    zIndex: 1
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 20
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f43f5e'
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f43f5e'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    lineHeight: 20
  },
  avatarWrapper: {
    position: 'relative',
    padding: 3,
    backgroundColor: '#fff',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  moduleList: {
    gap: 24
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    opacity: 0.5
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500'
  }
})
