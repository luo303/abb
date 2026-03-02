import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Provider } from 'react-redux'
import store from '../store'
import { LogBox } from 'react-native'

// 导入页面组件
import LoginScreen from './login'
import RegisterScreen from './register'
import PasswordScreen from './password'
import TabsLayout from './(tabs)/TabsLayout'
import PostDetail from './post/PostDetail'
import AddPostScreen from './post/AddPost'
import AddMilestoneScreen from './milestone/AddMilestone'
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
import SleepManualInputScreen from './(HomeNavGrid)/daily-record/manual'

import KnowledgeUploadScreen from './KnowledgeUpload'

// 导入弹框组件
import { MessageProvider } from '../components/Message'
import AIAssistant from './(tabs)/AIAssistant'
import PartnerChat from './(tabs)/PartnerChat'
// 忽略特定的日志警告
LogBox.ignoreLogs([
  'Unsupported top level event type "topSvgLayout" dispatched'
])
const Stack = createNativeStackNavigator()

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <MessageProvider>
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
                name="SleepManualInput"
                component={SleepManualInputScreen}
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
            </Stack.Navigator>
          </NavigationContainer>
        </MessageProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}
