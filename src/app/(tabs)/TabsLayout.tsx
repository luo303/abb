import React, { useEffect } from 'react'
import { View, Platform, Dimensions, Alert } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FontAwesome, AntDesign } from '@expo/vector-icons'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'

// 导入页面组件
import HomeScreen from './home'
import GrowthRecordScreen from './growthRecord'
import ProfileScreen from './profile'

// 导入 API
import { getUserMeReq } from '../../api/profile'

// 导入 Redux action
import { clearToken } from '../../store/modules/userStore'

import { NavigationProps } from '../../types/navigation'

const Tab = createBottomTabNavigator()

// 定义一个空的占位组件，避免内联函数导致的重渲染警告
const NullComponent = () => null

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const CustomTabBarBackground = () => {
  const insets = useSafeAreaInsets()
  const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 46 + insets.bottom : 56

  // Calculate path
  const centerWidth = 100 // Wider opening for a gentler curve
  const centerHeight = 28 // Increased depth slightly (was 22)
  const startX = (SCREEN_WIDTH - centerWidth) / 2
  const endX = (SCREEN_WIDTH + centerWidth) / 2
  const centerX = SCREEN_WIDTH / 2

  // Optimized smooth curve using cubic bezier to match the reference image
  // The curve starts flat, gently dips, and returns flat
  const path = `
    M0,0 
    L${startX},0 
    C${startX + 35},0 ${centerX - 35},${centerHeight} ${centerX},${centerHeight} 
    C${centerX + 35},${centerHeight} ${endX - 35},0 ${endX},0 
    L${SCREEN_WIDTH},0 
    L${SCREEN_WIDTH},${TAB_BAR_HEIGHT + 50} 
    L0,${TAB_BAR_HEIGHT + 50} 
    Z
  `

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,

        elevation: 0,
        backgroundColor: 'transparent'
      }}
    >
      <Svg
        width={SCREEN_WIDTH}
        height={TAB_BAR_HEIGHT}
        style={{ position: 'absolute', top: 0 }}
      >
        <Path d={path} fill="#fff" stroke="#eee" strokeWidth="1" />
      </Svg>
    </View>
  )
}

export default function TabsLayout() {
  const navigation = useNavigation<NavigationProps>()
  const token = useSelector((state: any) => state.user.token)
  const dispatch = useDispatch()
  const insets = useSafeAreaInsets()

  // 路由鉴权：如果没有token，重定向到登录页
  // 同时检查 /me 接口，用户不存在时清空 token 并跳转登录页
  useEffect(() => {
    const checkUserExists = async () => {
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }]
        })
        return
      }

      try {
        await getUserMeReq()
        // 用户存在，正常进入应用
      } catch (error: any) {
        // 检查是否是"用户不存在"的错误，且 code 为 -1
        if (
          error.response?.data?.code === -1 &&
          error.response?.data?.message === '用户不存在'
        ) {
          // 清空 token
          dispatch(clearToken())
          // 跳转登录页
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }]
          })
        }
      }
    }

    checkUserExists()
  }, [token, navigation, dispatch])

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
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0
        },
        tabBarBackground: () => <CustomTabBarBackground />,
        tabBarLabelStyle: {
          fontSize: 12
        },
        animation: 'none'
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
            <LinearGradient
              // Theme gradient: Warm Red to Pink-Red (Matching app theme)
              colors={['#ff9a9e', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Platform.OS === 'ios' ? 0 : 35,
                marginTop: Platform.OS === 'ios' ? -35 : 0,
                // Refined shadow: centered, softer, less directional
                shadowColor: '#FF5E62',
                shadowOffset: {
                  width: 0,
                  height: 8 // Increased vertical offset for "floating" effect
                },
                shadowOpacity: 0.35, // Slightly reduced opacity
                shadowRadius: 10, // Increased radius for softer diffusion
                elevation: 10 // Increased elevation for Android
              }}
            >
              <AntDesign name="twitch" size={28} color="#fff" />
            </LinearGradient>
          ),
          tabBarLabelStyle: {
            marginTop: Platform.OS === 'ios' ? 0 : 35,
            fontSize: 12
          }
        }}
      />
      <Tab.Screen
        name="PartnerTab"
        component={NullComponent}
        listeners={{
          tabPress: e => {
            e.preventDefault()
            navigation.navigate('PartnerChat')
          }
        }}
        options={{
          title: '另一半',
          tabBarIcon: ({ color }) => (
            <AntDesign name="heart" size={24} color={color} />
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
