import React, { useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import { useSelector } from 'react-redux'
import { useNavigation, NavigationProp } from '@react-navigation/native'

// 导入页面组件
import HomeScreen from './home'
import GrowthRecordScreen from './growthRecord'
import AIAssistantScreen from './AIAssistant'
import ProfileScreen from './profile'

type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
}

type NavigationProps = NavigationProp<RootStackParamList>

const Tab = createBottomTabNavigator()

export default function TabsLayout() {
  const navigation = useNavigation<NavigationProps>()
  const token = useSelector((state: any) => state.user.token)

  // 路由鉴权：如果没有token，重定向到登录页
  useEffect(() => {
    if (!token) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      })
    }
  }, [token, navigation])

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitle: '',
        headerStyle: {
          backgroundColor: '#ffffff'
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: '#1f99b0', //tab选中颜色
        tabBarInactiveTintColor: '#999999', //tab未选中颜色
        tabBarStyle: {
          height: 56,
          borderTopColor: '#eeeeee',
          borderTopWidth: 1,
          backgroundColor: '#ffffff'
        },
        tabBarLabelStyle: {
          fontSize: 12
        }
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
            <AntDesign name="folder-view" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{
          title: 'AI助手',
          headerTitle: 'AI助手',
          tabBarIcon: ({ color }) => (
            <AntDesign name="comment" size={24} color={color} />
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
