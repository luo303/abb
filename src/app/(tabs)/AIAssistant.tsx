import React, { useEffect } from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useDispatch } from 'react-redux'
import ChatScreen from '../../components/ai/ChatScreen'
import HistoryDrawerContent from '../../components/ai/HistoryDrawerContent'
import { initChatSession } from '../../store/modules/ChatStore'

const Drawer = createDrawerNavigator()

export default function AIAssistant() {
  const dispatch = useDispatch()

  useEffect(() => {
    // @ts-ignore - Thunk action type issue
    dispatch(initChatSession())
  }, [dispatch])

  return (
    <Drawer.Navigator
      drawerContent={props => <HistoryDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        title: '',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#ffffff'
        },
        headerShadowVisible: false,
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: '#c6cbef',
          width: '70%'
        },
        headerLeft: () => (
          <TouchableOpacity
            style={{ paddingLeft: 26 }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        )
      })}
    >
      <Drawer.Screen name="ChatMain" component={ChatScreen} />
    </Drawer.Navigator>
  )
}
