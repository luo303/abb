import { Stack } from 'expo-router'
import { Provider } from 'react-redux'
import store from '../store'

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          title: '', //默认标题为空
          headerTitleAlign: 'center', //安卓系统标题居中
          animation: 'slide_from_right', //安卓系统从右向左滑动
          headerTintColor: '#1f99b0',
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '400',
            color: '#2A2929'
          },
          headerBackButtonDisplayMode: 'minimal' //设置返回按钮只显示箭头，不显示文字
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="register"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>
    </Provider>
  )
}
