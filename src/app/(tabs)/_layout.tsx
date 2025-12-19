import { Tabs } from 'expo-router'
import { AntDesign, FontAwesome } from '@expo/vector-icons'

export default function TabsLayout() {
  // 这里是路由鉴权，为了开发方便，功能完善了再加上吧
  // const token = useSelector((state: any) => state.auth.token);
  // useEffect(() => {
  //     if (!token) {
  //         router.push('login/login');
  //     }
  // }, [token]);
  return (
    <Tabs
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
      <Tabs.Screen
        name="index"
        options={{
          title: '首页',
          headerTitle: '首页',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="growthRecord"
        options={{
          title: '成长记录',
          headerTitle: '成长记录',
          tabBarIcon: ({ color }) => (
            <AntDesign name="folder-view" size={24} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="AIAssistant"
        options={{
          title: 'AI助手',
          headerTitle: 'AI助手',
          tabBarIcon: ({ color }) => (
            <AntDesign name="comment" size={24} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          headerTitle: '我的',
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={24} color={color} />
          )
        }}
      />
    </Tabs>
  )
}
