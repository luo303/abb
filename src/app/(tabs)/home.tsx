import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import {
  MaterialCommunityIcons,
  FontAwesome5,
  MaterialIcons,
  Ionicons
} from '@expo/vector-icons'
import PagerView from 'react-native-pager-view'

const { width } = Dimensions.get('window')

export default function Home() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. 顶部轮播图 */}
      <View style={styles.pagerContainer}>
        <PagerView style={styles.pagerView} initialPage={0}>
          {/* 页面1：热门帖子 */}
          <View key="1" style={[styles.page, { backgroundColor: '#fff9c4' }]}>
            <Text style={styles.pageTitle}>热门帖子</Text>
          </View>
          {/* 页面2：AI问答 */}
          <View key="2" style={[styles.page, { backgroundColor: '#03a9f4' }]}>
            <Text style={styles.pageTitle}>AI问答</Text>
          </View>
          {/* 页面3：科普知识 */}
          <View key="3" style={[styles.page, { backgroundColor: '#76ff03' }]}>
            <Text style={styles.pageTitle}>科普知识</Text>
          </View>
          {/* 页面4：专家建议 */}
          <View key="4" style={[styles.page, { backgroundColor: '#e98120ff' }]}>
            <Text style={styles.pageTitle}>专家建议</Text>
          </View>
        </PagerView>
        {/* 指示点 (可选) */}
        <View style={styles.indicatorContainer}>
          <View style={styles.indicator} />
          <View style={styles.indicator} />
          <View style={styles.indicator} />
          <View style={styles.indicator} />
        </View>
      </View>

      {/* 2. 宝宝信息卡片 */}
      <View style={styles.cardContainer}>
        <View style={styles.babyInfoRow}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/icon.png')} // 暂时使用 App 图标作为头像占位
              style={styles.avatar}
            />
          </View>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              今天的我又长大啦！明天一定更加可爱吧！
            </Text>
          </View>
        </View>

        {/* 2x2 数据网格 */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatItem label="我的生日" value="2023-01-01" color="#1f99b0" />
            <View style={styles.verticalDivider} />
            <StatItem label="我的身高" value="75 cm" color="#1f99b0" />
          </View>
          <View style={styles.horizontalDivider} />
          <View style={styles.statsRow}>
            <StatItem label="我的体重" value="9.5 kg" color="#1f99b0" />
            <View style={styles.verticalDivider} />
            <StatItem label="我的习惯" value="记录 >" color="#1f99b0" />
          </View>
        </View>
      </View>

      {/* 3. 功能导航栏 */}
      <View style={styles.menuContainer}>
        <MenuItem
          icon="food-off"
          label="查忌口"
          library="MaterialCommunityIcons"
        />
        <MenuItem
          icon="book-open-page-variant"
          label="孕育百科"
          library="MaterialCommunityIcons"
        />
        <MenuItem
          icon="weight"
          label="体重记录"
          library="MaterialCommunityIcons"
        />
        <MenuItem icon="vaccines" label="疫苗记录" library="MaterialIcons" />
      </View>

      {/* 4. 进入社区 */}
      <TouchableOpacity style={styles.communityContainer} activeOpacity={0.9}>
        <View style={styles.communityHeader}>
          <Text style={styles.communityTitle}>进入社区</Text>
        </View>
        <View style={styles.communityContent}>
          {/* 模拟波浪图表效果 */}
          <View style={styles.chartPlaceholder}>
            <Ionicons
              name="stats-chart"
              size={60}
              color="#1f99b0"
              style={{ opacity: 0.5 }}
            />
            <Text style={styles.communitySubText}>
              查看宝宝生长曲线与同龄人对比
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

// 子组件：状态项
const StatItem = ({ label, value, color }: any) => (
  <TouchableOpacity style={styles.statItem}>
    <Text style={[styles.statLabel, { color }]}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </TouchableOpacity>
)

// 子组件：菜单项
const MenuItem = ({ icon, label, library }: any) => {
  const IconComponent =
    library === 'MaterialIcons'
      ? MaterialIcons
      : library === 'FontAwesome5'
        ? FontAwesome5
        : MaterialCommunityIcons
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.iconCircle}>
        <IconComponent name={icon} size={24} color="#333" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa'
  },
  // 轮播图容器
  pagerContainer: {
    height: 220, // 增加高度
    marginBottom: 20
  },
  pagerView: {
    flex: 1
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  // 指示点容器（简单的视觉占位）
  indicatorContainer: {
    position: 'absolute',
    bottom: 20, // 调整位置
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4
  },
  // 专家建议 (旧样式，如不再使用可移除，这里保留以防万一)
  headerBanner: {
    backgroundColor: '#fddcae',
    padding: 20,
    paddingTop: 30,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5d4037',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8d6e63'
  },
  // 卡片容器
  cardContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginTop: 0, // 上移重叠效果
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  babyInfoRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center'
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  messageBox: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 10,
    borderRadius: 8
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20
  },
  // 统计网格
  statsGrid: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden'
  },
  statsRow: {
    flexDirection: 'row',
    height: 50
  },
  statItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2
  },
  statValue: {
    fontSize: 12,
    color: '#666'
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    height: '100%'
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%'
  },
  // 菜单
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  menuItem: {
    alignItems: 'center',
    flex: 1
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5', // 浅灰色背景
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee'
  },
  menuLabel: {
    fontSize: 12,
    color: '#333'
  },
  // 社区入口
  communityContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  communityHeader: {
    backgroundColor: '#80deea', // 青色背景
    paddingVertical: 10,
    alignItems: 'center'
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006064'
  },
  communityContent: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    height: 120
  },
  chartPlaceholder: {
    alignItems: 'center'
  },
  communitySubText: {
    marginTop: 10,
    color: '#999',
    fontSize: 12
  }
})
