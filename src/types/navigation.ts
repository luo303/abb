import { NavigationProp } from '@react-navigation/native'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
  AIAssistant: undefined
  PartnerChat: undefined
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
  EditProfile: undefined
  VaccineDetail: { url: string; title: string }
}

export type NavigationProps = NavigationProp<RootStackParamList>
