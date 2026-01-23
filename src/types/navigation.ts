import { NavigationProp } from '@react-navigation/native'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
  AIAssistant: undefined
  Taboo: undefined
  PostDetail: { id: number }
}

export type NavigationProps = NavigationProp<RootStackParamList>
