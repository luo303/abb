import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { TouchableOpacity } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import ChatScreen from '../../components/ai/ChatScreen'
import HistoryDrawerContent from '../../components/ai/HistoryDrawerContent'

const Drawer = createDrawerNavigator()

export default function AIAssistant() {
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
