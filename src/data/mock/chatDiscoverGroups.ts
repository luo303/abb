export type MockDiscoverGroup = {
  group_id: string
  name: string
  avatar: string
  description: string
  member_limit: number
  member_count: number
}

export const mockDiscoverGroups: MockDiscoverGroup[] = [
  {
    group_id: 'mock-group-baby-routine',
    name: '作息接龙小分队',
    avatar: '',
    description: '分享喂奶、睡眠和作息小技巧，适合新手爸妈。',
    member_limit: 30,
    member_count: 18
  },
  {
    group_id: 'mock-group-night-feed',
    name: '夜奶互助群',
    avatar: '',
    description: '凌晨在线互相打气，记录夜奶和哄睡经验。',
    member_limit: 50,
    member_count: 36
  },
  {
    group_id: 'mock-group-photo-share',
    name: '晒娃摄影角',
    avatar: '',
    description: '交流宝宝拍照灵感和家庭相册整理方法。',
    member_limit: 80,
    member_count: 52
  }
]
