import { createDrawerNavigator } from '@react-navigation/drawer'
import { TouchableOpacity } from 'react-native'
import { ArrowLeftSmall } from '@zappicon/react-native'
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
            <ArrowLeftSmall size={24} color="black" variant="regular" />
          </TouchableOpacity>
        )
      })}
    >
      <Drawer.Screen name="ChatMain" component={ChatScreen} />
    </Drawer.Navigator>
  )
}
