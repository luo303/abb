import React, { useCallback } from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  useNavigation,
  NavigationProp,
  useFocusEffect
} from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { logoutAndClearAll, setUserInfo } from '../../store/modules/userStore'
import { RootStackParamList } from '../../types/navigation'
import { LinearGradient } from 'expo-linear-gradient'
import { getUserMeReq, ApiResponse, UserMeResponse } from '../../api/profile'
import { useMessage } from '../../components/Message'
import { RootState } from '../../store'

// 导入组件
import UserInfo from '../../components/profile/UserInfo'
import InfoCard from '../../components/profile/InfoCard'
import ActionMenu from '../../components/profile/ActionMenu'

type NavigationProps = NavigationProp<RootStackParamList>

export default function Profile() {
  const insets = useSafeAreaInsets()
  const dispatch = useDispatch()
  const navigation = useNavigation<NavigationProps>()
  const { showMessage } = useMessage()
  const userInfo = useSelector(
    (state: RootState) => state.user.userInfo
  ) as UserMeResponse | null

  useFocusEffect(
    useCallback(() => {
      let isActive = true

      const fetchUserInfo = async () => {
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

      fetchUserInfo()

      return () => {
        isActive = false
      }
    }, [dispatch, showMessage])
  )

  const handleLogout = () => {
    dispatch(logoutAndClearAll() as any)
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }]
    })
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#fff1f2', '#ffe4e6', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              (Platform.OS === 'ios' ? 46 : 56) + insets.bottom + 16
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部个人信息 Banner */}
        <UserInfo userInfo={userInfo} />

        {/* 下方内容区域 */}
        <View style={styles.contentContainer}>
          <InfoCard userInfo={userInfo} />
          <ActionMenu
            onLogout={handleLogout}
            onMyPosts={() => navigation.navigate('MyPosts')}
          />
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
  scrollView: {
    flex: 1
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%'
  },
  content: {
    paddingTop: 0
  },
  contentContainer: {
    paddingTop: 15
  }
})
