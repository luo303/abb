import React, { useEffect, useState, useCallback } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Provider } from 'react-redux'
import store from '../store'
import { LogBox, View, Image, StyleSheet } from 'react-native'
import { initFollowingIds } from '../store/modules/FollowStore'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { fetchPostList, fetchFollowingPosts } from '../store/modules/PostStore'
import {
  fetchBabies,
  fetchBabyProfile,
  loadCurrentBabyId
} from '../store/modules/BabyStore'
import * as SplashScreen from 'expo-splash-screen'

// 导入页面组件
import LoginScreen from './login'
import RegisterScreen from './register'
import PasswordScreen from './password'
import TabsLayout from './(tabs)/TabsLayout'
import PostDetail from './post/PostDetail'
import AddPostScreen from './post/AddPost'
import AddMilestoneScreen from './milestone/AddMilestone'
import MilestoneListScreen from './milestone/MilestoneList'
import AddBabyScreen from '../components/profile/AddBady'
import EditProfileScreen from '../components/profile/EditProfile'
import MyPostsScreen from './profile/MyPosts'
import MyFavoritesScreen from './profile/MyFavorites'
import DailyRecordScreen from './(HomeNavGrid)/DailyRecord'
import VaccineRecordScreen from './(HomeNavGrid)/VaccineRecord'
import VaccineDetailScreen from './(HomeNavGrid)/vaccine-detail'
import AlbumScreen from './(GrowthSubPages)/Album'
import GrowthCurveScreen from './(GrowthSubPages)/GrowthCurve'
import GrowthAnalysisScreen from './(GrowthSubPages)/GrowthAnalysis'
import DiaryScreen from './(GrowthSubPages)/Diary'
import FeedingRecordScreen from './FeedingRecordScreen'
import SleepRecordScreen from './(HomeNavGrid)/daily-record/sleep'
import DiaperFormScreen from './DiaperFormScreen'

import KnowledgeUploadScreen from './KnowledgeUpload'
import SearchScreen from './search/SearchScreen'

// 导入弹框组件
import { MessageProvider } from '../components/Message'
import AIAssistant from './(tabs)/AIAssistant'
import PartnerChat from './(tabs)/PartnerChat'
// 忽略特定的日志警告
LogBox.ignoreLogs([
  'Unsupported top level event type "topSvgLayout" dispatched'
])
const Stack = createNativeStackNavigator()

// 初始化组件，用于在应用启动时加载关注列表
function AppInitializer({ onReady }: { onReady?: () => void }) {
  const dispatch = useAppDispatch()
  const token = useAppSelector(state => state.user.token)

  useEffect(() => {
    let active = true
    const run = async () => {
      if (!token) {
        if (active) onReady?.()
        return
      }
      try {
        await dispatch(initFollowingIds())
        await dispatch(loadCurrentBabyId() as any)
        await dispatch(fetchBabies())
        const babyId = store.getState().baby.currentBabyId
        if (babyId) {
          await dispatch(fetchBabyProfile(babyId))
        }
        await dispatch(fetchPostList({ page: 1, strategy: 'random' }))
        await dispatch(fetchPostList({ page: 1, strategy: 'hot' }))
        await dispatch(fetchFollowingPosts({ page: 1 }))
      } finally {
        if (active) onReady?.()
      }
    }
    run()
    return () => {
      active = false
    }
  }, [dispatch, onReady, token])

  return null
}

export default function Layout() {
  const [splashVisible, setSplashVisible] = useState(true)
  const [appReady, setAppReady] = useState(false)
  const [rootViewReady, setRootViewReady] = useState(false)
  const [minDelayDone, setMinDelayDone] = useState(false)

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayDone(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const onLayoutRootView = useCallback(() => {
    setRootViewReady(true)
  }, [])

  useEffect(() => {
    if (appReady && rootViewReady && minDelayDone && splashVisible) {
      SplashScreen.hideAsync().catch(() => {})
      setSplashVisible(false)
    }
  }, [appReady, rootViewReady, minDelayDone, splashVisible])

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <MessageProvider>
          <AppInitializer onReady={() => setAppReady(true)} />
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={store.getState().user.token ? 'Tabs' : 'Login'}
              screenOptions={{
                title: '', //默认标题为空
                headerTitleAlign: 'center', //安卓系统标题居中
                headerShadowVisible: false, //隐藏标题栏阴影
                contentStyle: { backgroundColor: '#fff' }, // Native Stack 使用 contentStyle 设置背景
                headerTitleStyle: {
                  fontSize: 16,
                  fontWeight: '400',
                  color: '#2A2929'
                }
                // Windows 开发环境下无法修改 iOS 原生配置，暂时注释掉以避免 Expo Go 红屏报错
                // statusBarAnimation: 'slide',
                // statusBarStyle: 'dark'
              }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Password"
                component={PasswordScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Tabs"
                component={TabsLayout}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="AIAssistant"
                component={AIAssistant}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="PartnerChat"
                component={PartnerChat}
                options={{
                  title: '另一半',
                  headerTitleAlign: 'center',
                  headerShadowVisible: false
                }}
              />
              <Stack.Screen
                name="PostDetail"
                component={PostDetail}
                options={{ title: '帖子详情' }}
              />
              <Stack.Screen
                name="DailyRecord"
                component={DailyRecordScreen}
                options={{ title: '日常记录' }}
              />
              <Stack.Screen
                name="VaccineRecord"
                component={VaccineRecordScreen}
                options={{
                  title: '疫苗接种'
                }}
              />
              <Stack.Screen
                name="VaccineDetail"
                component={VaccineDetailScreen}
                options={{ title: '详情', headerShown: false }}
              />
              <Stack.Screen
                name="Album"
                component={AlbumScreen}
                options={{ title: '宝宝相册' }}
              />
              <Stack.Screen
                name="GrowthCurve"
                component={GrowthCurveScreen}
                options={{ title: '成长曲线' }}
              />
              <Stack.Screen
                name="GrowthAnalysis"
                component={GrowthAnalysisScreen}
                options={{ title: 'AI 智能分析' }}
              />
              <Stack.Screen
                name="Diary"
                component={DiaryScreen}
                options={{ title: '宝宝日记' }}
              />
              <Stack.Screen
                name="AddPost"
                component={AddPostScreen}
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="AddMilestone"
                component={AddMilestoneScreen}
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen
                name="MilestoneList"
                component={MilestoneListScreen}
                options={{ title: '大事记' }}
              />
              <Stack.Screen
                name="AddBaby"
                component={AddBabyScreen}
                options={{ title: '新增宝宝' }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{ title: '编辑资料' }}
              />
              <Stack.Screen
                name="FeedingRecord"
                component={FeedingRecordScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SleepRecord"
                component={SleepRecordScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="DiaperForm"
                component={DiaperFormScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="KnowledgeUpload"
                component={KnowledgeUploadScreen}
                options={{ title: '上传知识库' }}
              />
              <Stack.Screen
                name="MyPosts"
                component={MyPostsScreen}
                options={{ title: '我的帖子' }}
              />
              <Stack.Screen
                name="MyFavorites"
                component={MyFavoritesScreen}
                options={{ title: '我的收藏' }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </MessageProvider>
      </Provider>
      {splashVisible && (
        <View style={localStyles.splashOverlay}>
          <Image
            source={require('../assets/splash.png')}
            style={localStyles.splashImage}
            resizeMode="cover"
          />
        </View>
      )}
    </GestureHandlerRootView>
  )
}

const localStyles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff'
  },
  splashImage: {
    width: '100%',
    height: '100%'
  }
})
