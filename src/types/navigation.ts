import { NavigationProp } from '@react-navigation/native'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
  AIAssistant: undefined
  Taboo: undefined
  DailyRecord: undefined
  VaccineRecord: undefined
  BabyStories: undefined
  Album: undefined
  GrowthCurve: undefined
  Diary: undefined
  PostDetail: { id: string }
  AddPost: undefined
  AddBaby: undefined
}

export type NavigationProps = NavigationProp<RootStackParamList>
