import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FontAwesome, AntDesign } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// 导入页面组件
import HomeScreen from './home'
import GrowthRecordScreen from './growthRecord'
import ProfileScreen from './profile'

import { NavigationProps } from '../../types/navigation'

const Tab = createBottomTabNavigator()

// 定义一个空的占位组件，避免内联函数导致的重渲染警告
const NullComponent = () => null

export default function TabsLayout() {
  const navigation = useNavigation<NavigationProps>()
  const token = useSelector((state: any) => state.user.token)
  const insets = useSafeAreaInsets()

  // 路由鉴权：如果没有token，重定向到登录页
  // useEffect(() => {
  //   if (!token) {
  //     navigation.reset({
  //       index: 0,
  //       routes: [{ name: 'Login' }]
  //     })
  //   }
  // }, [token, navigation])

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerTitleAlign: 'center',
        headerTitle: '',
        headerStyle: {
          backgroundColor: '#ffffff'
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: '#f43f5e', //tab选中颜色 (Warm Red)
        tabBarInactiveTintColor: '#999999', //tab未选中颜色
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 46 + insets.bottom : 56,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
          borderTopColor: '#eeeeee',
          borderTopWidth: 1,
          backgroundColor: '#ffffff'
        },
        tabBarLabelStyle: {
          fontSize: 12
        },
        animation: 'shift'
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '首页',
          headerTitle: '首页',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="GrowthRecord"
        component={GrowthRecordScreen}
        options={{
          title: '成长记录',
          headerTitle: '成长记录',
          tabBarIcon: ({ color }) => (
            <AntDesign name="line-chart" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AIAssistantTab"
        component={NullComponent}
        listeners={{
          tabPress: e => {
            // 阻止默认的跳转行为
            e.preventDefault()
            // 跳转到 Stack 中的 AIAssistant 页面
            navigation.navigate('AIAssistant')
          }
        }}
        options={{
          title: 'AI助手',
          tabBarIcon: ({ color }) => (
            <AntDesign name="twitch" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '我的',
          headerTitle: '我的',
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}
