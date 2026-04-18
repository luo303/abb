import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { GrowthAnalysisPayload } from '@/api/ai'
import type { PostMineListItem } from '@/types/post'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Password: undefined
  Tabs: undefined
  AIAssistant: undefined
  ChatHome: undefined
  ChatDetail: {
    conversationType: 'partner' | 'group'
    groupId?: string
  }
  BindPartner: undefined
  CreateGroup: undefined
  JoinGroup: undefined
  GroupInfo: {
    groupId: string
  }
  DailyRecord: undefined
  VaccineRecord: undefined
  Album: undefined
  MyFavorites: undefined
  GrowthCurve: undefined
  GrowthAnalysis: { growthAnalysis: GrowthAnalysisPayload }
  Diary: undefined
  PostDetail: { post_id: string }
  AddPost: undefined
  AddBaby: undefined
  EditProfile: undefined
  VaccineDetail: { url: string; title: string }
  AddMilestone: undefined
  MyPosts: undefined
  MyDrafts: undefined
  EditDraft: { draft: PostMineListItem }
  MilestoneList: undefined
  SleepRecord: { session_id?: string }
  FeedingRecord: { feeding_id?: string }
  DiaperForm: { diaper_id?: string }
  Search: undefined
}

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>
