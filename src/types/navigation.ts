import { NavigationProp } from '@react-navigation/native'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
  AIAssistant: undefined
  PartnerChat: undefined
  DailyRecord: undefined
  VaccineRecord: undefined
  Album: undefined
  GrowthCurve: undefined
  Diary: undefined
  PostDetail: { post_id: string }
  AddPost: undefined
  AddBaby: undefined
  EditProfile: undefined
  VaccineDetail: { url: string; title: string }
  AddMilestone: undefined
}

export type NavigationProps = NavigationProp<RootStackParamList>
