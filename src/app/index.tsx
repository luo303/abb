import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Provider } from 'react-redux'
import store from '../store'

// 导入页面组件
import LoginScreen from './login'
import RegisterScreen from './register'
import PasswordScreen from './password'
import TabsLayout from './(tabs)/TabsLayout'
import PostDetail from './post/PostDetail'
import TabooScreen from './Taboo'
// 导入弹框组件
import { MessageProvider } from '../components/Message'
import AIAssistant from './(tabs)/AIAssistant'

const Stack = createStackNavigator()

export default function Layout() {
  return (
    <Provider store={store}>
      <MessageProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={'Tabs'}
            screenOptions={{
              title: '', //默认标题为空
              headerTitleAlign: 'center', //安卓系统标题居中
              headerShadowVisible: false, //隐藏标题栏阴影
              animation: 'slide_from_right',
              headerTintColor: '#1f99b0',
              headerTitleStyle: {
                fontSize: 16,
                fontWeight: '400',
                color: '#2A2929'
              },
              headerBackButtonDisplayMode: 'minimal' //设置返回按钮只显示箭头，不显示文字
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
              name="PostDetail"
              component={PostDetail}
              options={{ title: '帖子详情' }}
            />
            <Stack.Screen
              name="Taboo"
              component={TabooScreen}
              options={{ title: '查忌口' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </MessageProvider>
    </Provider>
  )
}
