import { NavigationProp } from '@react-navigation/native'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
  PostDetail: { id: number }
}

export type NavigationProps = NavigationProp<RootStackParamList>
