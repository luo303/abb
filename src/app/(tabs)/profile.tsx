import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  NavigationProp,
  useFocusEffect,
  useNavigation
} from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Dropdown } from 'react-native-element-dropdown'
import * as ImagePicker from 'expo-image-picker'
import { TabBar, TabView } from 'react-native-tab-view'

import { uploadFile } from '@/api/upload'
import {
  ApiResponse,
  getUserMeReq,
  UpdateAvatarResponse,
  updateAvatarReq,
  UserMeResponse
} from '@/api/profile'
import PaperAvatar from '@/components/common/PaperAvatar'
import { useMessage } from '@/components/Message'
import { HOME_PINK_THEME } from '@/components/home/homePalette'
import { useRelationshipCounts } from '@/hooks/useRelationshipCounts'
import { AppDispatch, RootState } from '@/store'
import {
  fetchBabies,
  fetchBabyProfile,
  setCurrentBabyIdPersist
} from '@/store/modules/BabyStore'
import { setUserInfo } from '@/store/modules/userStore'
import { APP_COLORS, APP_GRADIENTS } from '@/theme/paperTheme'
import { RootStackParamList } from '@/types/navigation'

import MyDrafts from '../profile/MyDrafts'
import MyFavorites from '../profile/MyFavorites'
import MyPosts from '../profile/MyPosts'

type NavigationProps = NavigationProp<RootStackParamList>

type ProfileRoute = {
  key: 'favorites' | 'posts' | 'drafts'
  title: string
}

type ProfileHeaderSectionProps = {
  babiesList: any[]
  displayEmail: string
  displayName: string
  dropdownFlatListProps: { ListHeaderComponent: () => React.JSX.Element }
  dropdownRef: React.RefObject<any>
  dropdownStyle: StyleProp<ViewStyle>
  followerCount: number | null
  followingCount: number | null
  handleBabyChange: (item: { baby_id: string }) => void
  handleChangeAvatar: () => void
  handleEditProfile: () => void
  loadingCounts: boolean
  renderBabyItem: (item: any) => React.JSX.Element
  renderDropdownLeftIcon: () => React.JSX.Element
  renderRelationshipCount: (count: number | null) => number | string
  selectedBabyId: string | null
  setIsBabyDropdownFocused: (focused: boolean) => void
  topInset: number
  uploadingAvatar: boolean
  userInfo: UserMeResponse | null
}

const ROUTES: ProfileRoute[] = [
  { key: 'favorites', title: '收藏' },
  { key: 'posts', title: '我的帖子' },
  { key: 'drafts', title: '草稿箱' }
]

function ProfileHeaderSection({
  babiesList,
  displayEmail,
  displayName,
  dropdownFlatListProps,
  dropdownRef,
  dropdownStyle,
  followerCount,
  followingCount,
  handleBabyChange,
  handleChangeAvatar,
  handleEditProfile,
  loadingCounts,
  renderBabyItem,
  renderDropdownLeftIcon,
  renderRelationshipCount,
  selectedBabyId,
  setIsBabyDropdownFocused,
  topInset,
  uploadingAvatar,
  userInfo
}: ProfileHeaderSectionProps) {
  return (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={APP_GRADIENTS.primary}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[styles.heroSection, { paddingTop: topInset + 10 }]}
      >
        <View style={styles.heroShapePrimary} />
        <View style={styles.heroShapeSecondary} />

        <View style={styles.heroTopRow}>
          <Dropdown
            ref={dropdownRef}
            autoScroll={false}
            containerStyle={styles.dropdownListContainer}
            data={babiesList}
            flatListProps={dropdownFlatListProps}
            iconStyle={styles.dropdownIcon}
            labelField="name"
            maxHeight={280}
            onBlur={() => setIsBabyDropdownFocused(false)}
            onChange={handleBabyChange}
            onFocus={() => setIsBabyDropdownFocused(true)}
            placeholder={babiesList.length === 0 ? '暂无宝宝' : '选择宝宝'}
            placeholderStyle={styles.dropdownPlaceholder}
            renderItem={renderBabyItem}
            renderLeftIcon={renderDropdownLeftIcon}
            selectedTextStyle={styles.dropdownSelectedText}
            style={dropdownStyle}
            value={selectedBabyId}
            valueField="baby_id"
          />
        </View>
      </LinearGradient>

      <View style={styles.profileSection}>
        <TouchableOpacity
          activeOpacity={0.88}
          disabled={uploadingAvatar}
          onPress={handleChangeAvatar}
          style={styles.avatarButton}
        >
          <PaperAvatar
            accessibilityLabel={displayName}
            size={88}
            source={userInfo?.avatar}
            style={styles.avatar}
          />
          <View style={styles.avatarBadge}>
            {uploadingAvatar ? (
              <ActivityIndicator
                color={APP_COLORS.primaryStrong}
                size="small"
              />
            ) : (
              <Ionicons
                name="camera-outline"
                size={14}
                color={APP_COLORS.primaryStrong}
              />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.profileInfoSection}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.userName}>
              {displayName}
            </Text>
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={handleEditProfile}
              style={styles.editButton}
            >
              <Ionicons
                name="create-outline"
                size={15}
                color={APP_COLORS.primaryStrong}
              />
              <Text style={styles.editButtonText}>编辑</Text>
            </TouchableOpacity>
          </View>

          <Text numberOfLines={1} style={styles.emailText}>
            {displayEmail}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {renderRelationshipCount(followingCount)}
              </Text>
              <Text style={styles.statLabel}>关注</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {renderRelationshipCount(followerCount)}
              </Text>
              <Text style={styles.statLabel}>粉丝</Text>
            </View>

            {loadingCounts ? (
              <ActivityIndicator
                color={APP_COLORS.secondaryStrong}
                size="small"
                style={styles.statsLoading}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  )
}

export default function Profile() {
  const layout = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch<AppDispatch>()
  const navigation = useNavigation<NavigationProps>()
  const { showMessage } = useMessage()
  const dropdownRef = useRef<any>(null)

  const userInfo = useSelector(
    (state: RootState) => state.user.userInfo
  ) as UserMeResponse | null
  const { babiesList, currentBabyId } = useSelector(
    (state: RootState) => state.baby
  )
  const { followerCount, followingCount, loadingCounts } =
    useRelationshipCounts(userInfo?.user_id)

  const [index, setIndex] = useState(1)
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null)
  const [isBabyDropdownFocused, setIsBabyDropdownFocused] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let isActive = true

      const fetchUserInfo = async () => {
        void dispatch(fetchBabies())

        try {
          const res =
            (await getUserMeReq()) as unknown as ApiResponse<UserMeResponse>

          if (!isActive) return

          if (res.code === 0 && res.data) {
            dispatch(setUserInfo(res.data))
          } else {
            showMessage(res.message || '获取用户信息失败')
          }
        } catch (error) {
          if (!isActive) return

          console.error(error)
          showMessage('获取用户信息失败，请稍后重试')
        }
      }

      void fetchUserInfo()

      return () => {
        isActive = false
      }
    }, [dispatch, showMessage])
  )

  useEffect(() => {
    if (currentBabyId) {
      setSelectedBabyId(currentBabyId)
      return
    }

    if (babiesList.length > 0) {
      setSelectedBabyId(babiesList[0].baby_id)
      return
    }

    setSelectedBabyId(null)
  }, [babiesList, currentBabyId])

  const displayName =
    userInfo?.username || userInfo?.account || 'Love Baby 用户'
  const displayEmail = userInfo?.email || userInfo?.account || '暂无邮箱'

  const dropdownStyle = useMemo(
    () => [
      styles.dropdown,
      isBabyDropdownFocused ? styles.dropdownFocused : null
    ],
    [isBabyDropdownFocused]
  )

  const renderRelationshipCount = useCallback(
    (count: number | null) => {
      if (loadingCounts) {
        return '--'
      }

      return count ?? '--'
    },
    [loadingCounts]
  )

  const handleBabyChange = useCallback(
    (item: { baby_id: string }) => {
      setSelectedBabyId(item.baby_id)
      dispatch(setCurrentBabyIdPersist(item.baby_id))
      dispatch(fetchBabyProfile(item.baby_id))
      setIsBabyDropdownFocused(false)
    },
    [dispatch]
  )

  const handleNavigateToAddBaby = useCallback(() => {
    dropdownRef.current?.close()
    setIsBabyDropdownFocused(false)
    navigation.navigate('AddBaby')
  }, [navigation])

  const renderBabyItem = useCallback((item: any) => {
    return (
      <View style={styles.dropdownItem}>
        <PaperAvatar
          size={32}
          source={item.avatar}
          style={styles.dropdownAvatar}
        />
        <Text style={styles.dropdownItemText}>{item.name}</Text>
      </View>
    )
  }, [])

  const renderDropdownHeader = useCallback(() => {
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={handleNavigateToAddBaby}
        style={styles.addBabyButton}
      >
        <Ionicons
          name="add-circle-outline"
          size={22}
          color={APP_COLORS.primaryStrong}
        />
        <Text style={styles.addBabyButtonText}>新增宝宝</Text>
      </TouchableOpacity>
    )
  }, [handleNavigateToAddBaby])

  const dropdownFlatListProps = useMemo(
    () => ({
      ListHeaderComponent: renderDropdownHeader
    }),
    [renderDropdownHeader]
  )

  const renderDropdownLeftIcon = useCallback(() => {
    const selectedItem = babiesList.find(
      item => item.baby_id === selectedBabyId
    )

    return (
      <PaperAvatar
        size={28}
        source={selectedItem?.avatar}
        style={styles.dropdownSelectedAvatar}
      />
    )
  }, [babiesList, selectedBabyId])

  const handleChangeAvatar = useCallback(async () => {
    if (uploadingAvatar) return

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      showMessage('需要相册权限后才能更换头像')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return
    }

    try {
      setUploadingAvatar(true)

      const uploadRes = await uploadFile(result.assets[0].uri)

      let avatarUrl = ''
      if (typeof uploadRes.data === 'string') {
        avatarUrl = uploadRes.data
      } else if (uploadRes.data && typeof uploadRes.data.url === 'string') {
        avatarUrl = uploadRes.data.url
      }

      if (!avatarUrl) {
        showMessage('图片上传失败，请稍后重试')
        return
      }

      const avatarRes = (await updateAvatarReq({
        avatar: avatarUrl
      })) as unknown as ApiResponse<UpdateAvatarResponse>

      if (avatarRes.code !== 0) {
        showMessage(avatarRes.message || '头像更新失败')
        return
      }

      if (userInfo) {
        dispatch(setUserInfo({ ...userInfo, avatar: avatarUrl }))
      }

      showMessage('头像更新成功')
    } catch (error) {
      console.error(error)
      showMessage('头像更新失败，请稍后重试')
    } finally {
      setUploadingAvatar(false)
    }
  }, [dispatch, showMessage, uploadingAvatar, userInfo])

  const renderScene = useCallback(({ route }: { route: ProfileRoute }) => {
    switch (route.key) {
      case 'favorites':
        return <MyFavorites />
      case 'posts':
        return <MyPosts />
      case 'drafts':
      default:
        return <MyDrafts />
    }
  }, [])

  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        activeColor={HOME_PINK_THEME.text}
        inactiveColor={HOME_PINK_THEME.textMuted}
        indicatorStyle={styles.tabIndicator}
        labelStyle={styles.tabLabel}
        pressColor="transparent"
        scrollEnabled={false}
        style={styles.tabBar}
        tabStyle={[
          styles.tabItem,
          { width: layout.width / props.navigationState.routes.length }
        ]}
      />
    ),
    [layout.width]
  )

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={APP_GRADIENTS.auth}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.pageBackground}
      />

      <ProfileHeaderSection
        babiesList={babiesList}
        displayEmail={displayEmail}
        displayName={displayName}
        dropdownFlatListProps={dropdownFlatListProps}
        dropdownRef={dropdownRef}
        dropdownStyle={dropdownStyle}
        followerCount={followerCount}
        followingCount={followingCount}
        handleBabyChange={handleBabyChange}
        handleChangeAvatar={handleChangeAvatar}
        handleEditProfile={() => navigation.navigate('EditProfile')}
        loadingCounts={loadingCounts}
        renderBabyItem={renderBabyItem}
        renderDropdownLeftIcon={renderDropdownLeftIcon}
        renderRelationshipCount={renderRelationshipCount}
        selectedBabyId={selectedBabyId}
        setIsBabyDropdownFocused={setIsBabyDropdownFocused}
        topInset={insets.top}
        uploadingAvatar={uploadingAvatar}
        userInfo={userInfo}
      />

      <TabView
        initialLayout={{ width: layout.width }}
        lazy
        navigationState={{ index, routes: ROUTES }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        style={styles.tabView}
        swipeEnabled
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: HOME_PINK_THEME.background
  },
  pageBackground: {
    ...StyleSheet.absoluteFillObject
  },
  headerWrapper: {
    zIndex: 20,
    elevation: 20
  },
  heroSection: {
    height: 154,
    overflow: 'visible'
  },
  heroShapePrimary: {
    position: 'absolute',
    top: -18,
    right: -24,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.14)'
  },
  heroShapeSecondary: {
    position: 'absolute',
    left: -54,
    bottom: -96,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  heroTopRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    zIndex: 30
  },
  profileSection: {
    marginTop: -46,
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  avatarButton: {
    width: 92
  },
  avatar: {
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff'
  },
  avatarBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#ffd8e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfoSection: {
    marginTop: 14
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userName: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  editButton: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffd1dc'
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: APP_COLORS.primaryStrong
  },
  emailText: {
    marginTop: 8,
    fontSize: 14,
    color: APP_COLORS.textMuted
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  },
  statItem: {
    marginRight: 28
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: APP_COLORS.text
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: APP_COLORS.textMuted
  },
  statsLoading: {
    marginLeft: 4
  },
  tabView: {
    flex: 1
  },
  tabBar: {
    backgroundColor: HOME_PINK_THEME.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HOME_PINK_THEME.border
  },
  tabItem: {
    justifyContent: 'center'
  },
  tabLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textTransform: 'none'
  },
  tabIndicator: {
    height: 3,
    borderRadius: 999,
    backgroundColor: HOME_PINK_THEME.primary
  },
  dropdown: {
    width: 156,
    height: 46,
    borderRadius: 24,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)'
  },
  dropdownFocused: {
    borderColor: '#ffc1ce'
  },
  dropdownListContainer: {
    marginTop: 8,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: APP_COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 24
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: APP_COLORS.textMuted
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: APP_COLORS.text
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    tintColor: APP_COLORS.textMuted
  },
  dropdownSelectedAvatar: {
    marginRight: 8
  },
  addBabyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f5dce3',
    backgroundColor: '#fff'
  },
  addBabyButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: APP_COLORS.primaryStrong
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f8e6eb'
  },
  dropdownAvatar: {
    marginRight: 10
  },
  dropdownItemText: {
    fontSize: 14,
    color: APP_COLORS.text
  }
})
