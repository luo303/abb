import React, { useEffect } from 'react'
import { View, Platform, Dimensions } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { House, Message, AddressCard, ChartLine } from '@zappicon/react-native'
import { AntDesign } from '@expo/vector-icons'

import HomeScreen from './HomeDrawer'
import GrowthRecordScreen from './growthRecord'
import ProfileScreen from './profile'
import { getUserMeReq } from '../../api/profile'
import { logoutAndClearAll } from '../../store/modules/userStore'
import { NavigationProps } from '../../types/navigation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { APP_COLORS } from '@/theme/paperTheme'

const Tab = createBottomTabNavigator()
const NullComponent = () => null
const AI_TAB_GRADIENT = ['#ff9a9e', '#ff5f7a', '#f43f5e'] as const
const AI_TAB_GLOW = '#f43f5e'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const CustomTabBarBackground = () => {
  const insets = useSafeAreaInsets()
  const tabBarHeight = Platform.OS === 'ios' ? 46 + insets.bottom : 56

  const centerWidth = 100
  const centerHeight = 28
  const startX = (SCREEN_WIDTH - centerWidth) / 2
  const endX = (SCREEN_WIDTH + centerWidth) / 2
  const centerX = SCREEN_WIDTH / 2

  const path = `
    M0,0
    L${startX},0
    C${startX + 35},0 ${centerX - 35},${centerHeight} ${centerX},${centerHeight}
    C${centerX + 35},${centerHeight} ${endX - 35},0 ${endX},0
    L${SCREEN_WIDTH},0
    L${SCREEN_WIDTH},${tabBarHeight + 50}
    L0,${tabBarHeight + 50}
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
        shadowColor: APP_COLORS.shadow,
        shadowOffset: {
          width: 0,
          height: -6
        },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
        backgroundColor: 'transparent'
      }}
    >
      <Svg
        width={SCREEN_WIDTH}
        height={tabBarHeight}
        style={{ position: 'absolute', top: 0 }}
      >
        <Path
          d={path}
          fill={APP_COLORS.surfaceStrong}
          stroke={APP_COLORS.outlineVariant}
          strokeWidth="1"
        />
      </Svg>
    </View>
  )
}

export default function TabsLayout() {
  const navigation = useNavigation<NavigationProps>()
  const dispatch = useAppDispatch()
  const token = useAppSelector(state => state.user.token)
  const totalUnreadCount = useAppSelector(state => {
    const groupUnreadCount = state.messenger.groups.items.reduce(
      (total, item) => total + item.unreadCount,
      0
    )

    return state.messenger.partner.unreadCount + groupUnreadCount
  })
  const insets = useSafeAreaInsets()

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
      } catch (error: any) {
        if (
          error.response?.data?.code === -1 &&
          error.response?.data?.message === '用户不存在'
        ) {
          await dispatch(logoutAndClearAll() as any)
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
          backgroundColor: APP_COLORS.surface
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: APP_COLORS.primaryStrong,
        tabBarInactiveTintColor: APP_COLORS.textMuted,
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
          fontSize: 12,
          fontWeight: '600'
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
            <House size={24} color={color} variant="filled" />
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
            <ChartLine size={24} color={color} variant="filled" />
          )
        }}
      />
      <Tab.Screen
        name="AIAssistantTab"
        component={NullComponent}
        listeners={{
          tabPress: e => {
            e.preventDefault()
            navigation.navigate('AIAssistant')
          }
        }}
        options={{
          title: 'AI助手',
          tabBarIcon: () => (
            <LinearGradient
              colors={AI_TAB_GRADIENT}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={{
                width: 62,
                height: 62,
                borderRadius: 31,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Platform.OS === 'ios' ? 2 : 35,
                marginTop: Platform.OS === 'ios' ? -40 : -2,
                shadowColor: AI_TAB_GLOW,
                shadowOffset: {
                  width: 0,
                  height: 14
                },
                shadowOpacity: 0.52,
                shadowRadius: 24,
                elevation: 20
              }}
            >
              <AntDesign name="twitch" size={30} color="#fff" />
            </LinearGradient>
          ),
          tabBarLabelStyle: {
            marginTop: Platform.OS === 'ios' ? 2 : 35,
            fontSize: 12,
            fontWeight: '700',
            color: AI_TAB_GLOW
          }
        }}
      />
      <Tab.Screen
        name="PartnerTab"
        component={NullComponent}
        listeners={{
          tabPress: e => {
            e.preventDefault()
            navigation.navigate('ChatHome')
          }
        }}
        options={{
          title: '社区',
          tabBarBadge:
            totalUnreadCount > 0
              ? totalUnreadCount > 99
                ? '99+'
                : totalUnreadCount
              : undefined,
          tabBarBadgeStyle: {
            backgroundColor: APP_COLORS.primaryStrong,
            color: '#fff'
          },
          tabBarIcon: ({ color }) => (
            <Message size={24} color={color} variant="filled" />
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
            <AddressCard size={24} color={color} variant="filled" />
          )
        }}
      />
    </Tab.Navigator>
  )
}
