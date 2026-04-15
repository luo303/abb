import { StyleSheet, Dimensions } from 'react-native'

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffe4e6'
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
  safeArea: {
    flex: 1
  },
  container: {
    flex: 1
  },
  topSection: {
    marginBottom: 5
  },
  bannerSection: {
    marginBottom: 5
  },
  communitySection: {
    paddingHorizontal: 16,
    marginTop: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  titleAndTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 20
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
    shadowColor: '#f43f5e',
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
    backgroundColor: '#f43f5e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  badgeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold'
  },
  // 标签栏样式
  tabContainer: {
    flexDirection: 'row',
    gap: 20
  },
  tab: {
    paddingVertical: 5
  },
  activeTab: {
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#ff1744'
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  activeTabText: {
    fontSize: 16,
    color: '#ff1744',
    fontWeight: '600'
  },
  // 吸顶标题栏样式
  stickyHeader: {
    paddingHorizontal: 8,
    marginTop: 15,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10
  },
  // 关注标签空状态样式
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30
  },
  emptyStateButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10
  },
  postItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  postAvatar: {
    fontSize: 24,
    marginRight: 8
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  postActionIcon: {
    fontSize: 16,
    marginRight: 4
  },
  postActionText: {
    fontSize: 14,
    color: '#999'
  }
})
