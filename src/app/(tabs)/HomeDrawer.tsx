import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import HomeScreen from './home'
import HomeDrawerContent from '@/components/home/HomeDrawerContent'

const Drawer = createDrawerNavigator()

export default function HomeDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <HomeDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(17, 24, 39, 0.28)',
        swipeEdgeWidth: 60,
        drawerStyle: {
          width: '78%',
          backgroundColor: '#ffffff'
        },
        sceneStyle: {
          backgroundColor: '#ffffff'
        }
      }}
    >
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
    </Drawer.Navigator>
  )
}
