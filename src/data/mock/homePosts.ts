import { TabooItem } from '@/types/taboo'
import { Comment } from '../../types/post'
import { HistoryItem } from '../../types/AIchat'
import { Vaccine } from '@/types/vaccine'

// 默认回退图片
export const MOCK_FALLBACK_IMAGE = 'https://loremflickr.com/320/320/baby'

// 模拟当前登录用户（用于发帖回显）
export const MOCK_CURRENT_USER = {
  avatar: require('../../assets/testAvatar.png'),
  nickname: 'user_123456',
  description: '一名新手宝妈'
}

// 模拟疫苗数据
export const MOCK_VACCINES: Vaccine[] = [
  {
    id: '1',
    name: '乙肝疫苗',
    dose: '第1剂',
    description: '预防乙型肝炎病毒感染，保护肝脏健康。',
    status: 'completed',
    recommendedDate: '2023-10-01',
    vaccinationDate: '2023-10-01',
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  },
  {
    id: '2',
    name: '卡介苗',
    description: '预防结核病，特别是预防结核性脑膜炎和粟粒性结核病。',
    status: 'completed',
    recommendedDate: '2023-10-02',
    vaccinationDate: '2023-10-02',
    detail:
      'https://www.nhc.gov.cn/wjw/jbyfykz/201604/e73973a39ece42fdba98e3d8a001acd7.shtml'
  },
  {
    id: '3',
    name: '乙肝疫苗',
    dose: '第2剂',
    description: '加强免疫，确保抗体水平达标。',
    status: 'completed',
    recommendedDate: '2023-11-01',
    vaccinationDate: '2023-11-01',
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  },
  {
    id: '4',
    name: '五联疫苗',
    dose: '第1剂',
    description:
      '预防白喉、破伤风、百日咳、脊髓灰质炎和b型流感嗜血杆菌引起的感染。',
    status: 'pending',
    recommendedDate: '2023-12-01',
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  },
  {
    id: '5',
    name: '脊灰疫苗',
    dose: '第1剂',
    description: '预防脊髓灰质炎（小儿麻痹症）。',
    status: 'pending',
    recommendedDate: '2023-12-01',
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  },
  {
    id: '6',
    name: '肺炎疫苗',
    dose: '第1剂',
    description: '预防肺炎球菌引起的肺炎、脑膜炎等疾病。',
    status: 'pending',
    recommendedDate: '2024-01-01',
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  }
]

// 模拟社区帖子数据
// 使用 let 允许在运行时添加新数据
export let MOCK_POSTS = [
  {
    id: '1',
    avatar: require('../../assets/icon.png'),
    nickname: '有青春的猫咪脸JAP8',
    description: '宝宝1岁8个月',
    content: '老婆辛苦了❤️\n母女平安，6斤5两\n浓眉大眼双眼皮，随我',
    images: [
      require('../../assets/icon.png'),
      require('../../assets/icon.png')
    ],
    tags: ['新生儿', '报喜'],
    publishTime: '2024-05-17',
    location: '周口',
    stats: {
      likes: 11,
      dislikes: 1,
      favorites: 6,
      comments: 2
    }
  },
  {
    id: '2',
    avatar: require('../../assets/icon.png'),
    nickname: '快乐的宝妈',
    description: '宝宝6个月',
    content: '宝宝今天终于会翻身了！太激动了，记录一下这个里程碑时刻。',
    images: [require('../../assets/icon.png')],
    tags: ['大运动', '翻身'],
    publishTime: '2024-05-18',
    location: '北京',
    stats: {
      likes: 56,
      dislikes: 0,
      favorites: 12,
      comments: 8
    }
  },
  {
    id: '3',
    avatar: require('../../assets/icon.png'),
    nickname: '育儿专家',
    description: '专业育儿顾问',
    content:
      '关于宝宝辅食添加的几个误区，新手爸妈一定要注意！\n1. 不要在奶瓶里加米粉\n2. 不要过早添加调味品',
    images: [],
    tags: ['辅食', '避坑指南'],
    publishTime: '2024-05-19',
    location: '上海',
    stats: {
      likes: 128,
      dislikes: 2,
      favorites: 89,
      comments: 45
    }
  }
]

// 模拟生长曲线数据
export const MOCK_GROWTH_DATA = {
  height: {
    standard: [
      { month: '0', value: 50 },
      { month: '1', value: 54 },
      { month: '2', value: 58 },
      { month: '3', value: 61 },
      { month: '4', value: 64 },
      { month: '5', value: 66 },
      { month: '6', value: 68 },
      { month: '7', value: 69 },
      { month: '8', value: 70 },
      { month: '9', value: 72 },
      { month: '10', value: 73 },
      { month: '11', value: 74 },
      { month: '12', value: 75 }
    ],
    baby: [
      { month: '0', value: 49 },
      { month: '1', value: 53 },
      { month: '2', value: 57 },
      { month: '3', value: 62 },
      { month: '4', value: 65 },
      { month: '5', value: 67 },
      { month: '6', value: 68 },
      { month: '7', value: 68.5 },
      { month: '8', value: 69 },
      { month: '9', value: 71.5 },
      { month: '10', value: 73.5 },
      { month: '11', value: 74.5 },
      { month: '12', value: 75 }
    ]
  },
  weight: {
    standard: [
      { month: '0', value: 3.3 },
      { month: '1', value: 4.5 },
      { month: '2', value: 5.6 },
      { month: '3', value: 6.4 },
      { month: '4', value: 7.0 },
      { month: '5', value: 7.5 },
      { month: '6', value: 7.9 },
      { month: '7', value: 8.3 },
      { month: '8', value: 8.6 },
      { month: '9', value: 8.9 },
      { month: '10', value: 9.2 },
      { month: '11', value: 9.4 },
      { month: '12', value: 9.6 }
    ],
    baby: [
      { month: '0', value: 3.1 },
      { month: '1', value: 4.2 },
      { month: '2', value: 5.4 },
      { month: '3', value: 6.6 },
      { month: '4', value: 7.2 },
      { month: '5', value: 7.8 },
      { month: '6', value: 8.1 },
      { month: '7', value: 8.3 },
      { month: '8', value: 8.5 },
      { month: '9', value: 8.8 },
      { month: '10', value: 9.1 },
      { month: '11', value: 9.4 },
      { month: '12', value: 9.5 }
    ]
  },
  head: {
    standard: [
      { month: '0', value: 34 },
      { month: '1', value: 37 },
      { month: '2', value: 39 },
      { month: '3', value: 40 },
      { month: '4', value: 41 },
      { month: '5', value: 42 },
      { month: '6', value: 43 },
      { month: '7', value: 43.5 },
      { month: '8', value: 44 },
      { month: '9', value: 44.5 },
      { month: '10', value: 45 },
      { month: '11', value: 45.5 },
      { month: '12', value: 46 }
    ],
    baby: [
      { month: '0', value: 33.5 },
      { month: '1', value: 36.5 },
      { month: '2', value: 38.8 },
      { month: '3', value: 40.2 },
      { month: '4', value: 41.5 },
      { month: '5', value: 42.8 },
      { month: '6', value: 43.2 },
      { month: '7', value: 43.5 },
      { month: '8', value: 44 },
      { month: '9', value: 44.2 },
      { month: '10', value: 44.8 },
      { month: '11', value: 45.4 },
      { month: '12', value: 45.8 }
    ]
  }
}

// 添加新帖子的辅助函数
export const addMockPost = (newPost: any) => {
  // 插入到头部
  MOCK_POSTS = [newPost, ...MOCK_POSTS]
}

// 更新帖子的辅助函数（用于点赞、收藏等同步）
export const updateMockPost = (id: string, updates: any) => {
  MOCK_POSTS = MOCK_POSTS.map(post => {
    if (post.id === id) {
      // 深度合并 stats
      const newStats = updates.stats
        ? { ...post.stats, ...updates.stats }
        : post.stats

      return { ...post, ...updates, stats: newStats }
    }
    return post
  })
}

// 获取单个帖子详情（用于详情页加载）
export const getMockPostById = (id: string) => {
  return MOCK_POSTS.find(post => post.id === id)
}
//帖子评论
export const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    avatar: require('../../assets/icon.png'),
    nickname: '用户1',
    content: '具体时间发出来不好吧',
    time: '2025-10-28',
    location: '福建',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        avatar: require('../../assets/icon.png'),
        nickname: '用户2',
        content: '为什么',
        time: '2025-12-24',
        likes: 0,
        replies: [
          {
            id: '1-1-1',
            avatar: require('../../assets/icon.png'),
            nickname: '用户3',
            content: '因为是八字',
            time: '2025-12-25',
            likes: 0,
            replies: [
              {
                id: '1-1-2',
                avatar: require('../../assets/icon.png'),
                nickname: '用户4',
                content:
                  '现在好多都会把这个和出生证明发出来，但就看真不包含差值。',
                time: '2026-01-01',
                location: '广东',
                likes: 2,
                isLiked: false,
                replies: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    avatar: require('../../assets/icon.png'),
    nickname: '春暖花开的海盗SL72',
    content: '这个爸爸有点虎，生辰八字都给别人看',
    time: '2025-12-29',
    location: '四川',
    likes: 4,
    isLiked: false,
    replies: [
      {
        id: '2-1',
        avatar: require('../../assets/icon.png'),
        nickname: '用户5',
        content: '哈哈，确实有点莽',
        time: '2025-12-30',
        likes: 3,
        replies: [
          {
            id: '2-1-1',
            avatar: require('../../assets/icon.png'),
            nickname: '用户6',
            content: '可能新手爸爸太激动了',
            time: '2025-12-31',
            likes: 1,
            isLiked: false,
            replies: []
          }
        ]
      }
    ]
  },
  {
    id: '3',
    avatar: require('../../assets/icon.png'),
    nickname: '何必彷徨的人类之光0EVC',
    content: '现在好多都会把这个和出生证明发出来，但就看真不包含差值。',
    time: '2026-01-01',
    location: '广东',
    likes: 2,
    isLiked: false,
    replies: [
      {
        id: '3-1',
        avatar: require('../../assets/icon.png'),
        nickname: '用户7',
        content: '我觉得还好吧，图个喜庆',
        time: '2026-01-02',
        likes: 2,
        replies: [
          {
            id: '3-1-1',
            avatar: require('../../assets/icon.png'),
            nickname: '用户8',
            content: '主要是怕有心人利用',
            time: '2026-01-03',
            likes: 1,
            replies: [
              {
                id: '3-1-2',
                avatar: require('../../assets/icon.png'),
                nickname: '用户9',
                content: '现在信息泄露太严重了',
                time: '2026-01-04',
                likes: 1,
                isLiked: false,
                replies: []
              }
            ]
          }
        ]
      }
    ]
  }
]

// 模拟ai聊天历史数据
export const historyList: HistoryItem[] = []
//查忌口
export const MOCK_FOODS: TabooItem[] = [
  {
    id: '1',
    name: '螃蟹',
    description: '优质食物，可适量食用',
    image: require('../../assets/icon.png'), // Placeholder
    tags: ['海鲜', '螃蟹'],
    status: {
      pregnant: 'ok',
      baby: 'avoid',
      breastfeeding: 'avoid',
      postpartum: 'unknown'
    }
  },
  {
    id: '2',
    name: '西兰花',
    description: '富含维生素C及膳食纤维',
    image: require('../../assets/icon.png'),
    tags: ['蔬菜', '西兰花'],
    status: {
      pregnant: 'avoid',
      baby: 'ok',
      breastfeeding: 'ok',
      postpartum: 'unknown'
    }
  },
  {
    id: '3',
    name: '咖啡',
    description: '含有咖啡因，需适量',
    image: require('../../assets/icon.png'),
    tags: ['咖啡', '饮品'],
    status: {
      pregnant: 'avoid',
      baby: 'caution',
      breastfeeding: 'unknown',
      postpartum: 'unknown'
    }
  },
  {
    id: '4',
    name: '山药',
    description: '健脾养胃，老少皆宜',
    image: require('../../assets/icon.png'),
    tags: ['蔬菜', '山药'],
    status: {
      pregnant: 'ok',
      baby: 'ok',
      breastfeeding: 'ok',
      postpartum: 'ok'
    }
  },
  {
    id: '5',
    name: '西瓜',
    description: '寒性水果，不宜多吃',
    image: require('../../assets/icon.png'),
    tags: ['水果', '西瓜'],
    status: {
      pregnant: 'caution',
      baby: 'caution',
      breastfeeding: 'caution',
      postpartum: 'avoid'
    }
  }
]
