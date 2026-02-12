import { TabooItem } from '@/types/taboo'
import { Comment } from '../../types/post'
import { HistoryItem } from '../../types/AIchat'
import { Vaccine } from '@/types/vaccine'
import { PostItem } from '@/types/home'

// 默认回退图片
export const MOCK_FALLBACK_IMAGE = 'https://loremflickr.com/320/320/baby'

// 模拟当前登录用户（用于发帖回显）
export const MOCK_CURRENT_USER = {
  author_id: 'user_123456',
  author_avatar: require('../../assets/testAvatar.png'),
  author_name: 'user_123456',
  baby_age_text: '一名新手宝妈'
}

// 模拟疫苗数据
export const MOCK_VACCINES: Vaccine[] = [
  {
    id: '1',
    name: '乙肝疫苗',
    dose: '第1剂',
    description: '预防乙型肝炎病毒感染，保护肝脏健康。',
    status: 'completed',
    recommendedDate: new Date('2023-10-01').getTime(),
    vaccinationDate: new Date('2023-10-01').getTime(),
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  },
  {
    id: '2',
    name: '卡介苗',
    description: '预防结核病，特别是预防结核性脑膜炎和粟粒性结核病。',
    status: 'completed',
    recommendedDate: new Date('2023-10-02').getTime(),
    vaccinationDate: new Date('2023-10-02').getTime(),
    detail:
      'https://www.nhc.gov.cn/wjw/jbyfykz/201604/e73973a39ece42fdba98e3d8a001acd7.shtml'
  },
  {
    id: '3',
    name: '乙肝疫苗',
    dose: '第2剂',
    description: '加强免疫，确保抗体水平达标。',
    status: 'completed',
    recommendedDate: new Date('2023-11-01').getTime(),
    vaccinationDate: new Date('2023-11-01').getTime(),
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
    recommendedDate: new Date('2023-12-01').getTime(),
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  },
  {
    id: '5',
    name: '脊灰疫苗',
    dose: '第1剂',
    description: '预防脊髓灰质炎（小儿麻痹症）。',
    status: 'pending',
    recommendedDate: new Date('2023-12-01').getTime(),
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  },
  {
    id: '6',
    name: '肺炎疫苗',
    dose: '第1剂',
    description: '预防肺炎球菌引起的肺炎、脑膜炎等疾病。',
    status: 'pending',
    recommendedDate: new Date('2024-01-01').getTime(),
    detail:
      'https://baike.baidu.com/item/%E4%B9%99%E8%82%9D%E7%96%AB%E8%8B%97/5226072'
  }
]

// 模拟社区帖子数据
// 使用 let 允许在运行时添加新数据
export let MOCK_POSTS: PostItem[] = [
  {
    post_id: '1',
    author_id: 'user_1',
    author_avatar: require('../../assets/icon.png'),
    author_name: '有青春的猫咪脸JAP8',
    baby_age_text: '宝宝1岁8个月',
    content: '老婆辛苦了❤️\n母女平安，6斤5两\n浓眉大眼双眼皮，随我',
    images: [
      require('../../assets/icon.png'),
      require('../../assets/icon.png')
    ],
    tags: ['新生儿', '报喜'],
    ctime: 1715904000000,
    author_city: '周口',
    like_count: 11,
    dislike_count: 1,
    collect_count: 6,
    comment_count: 2
  },
  {
    post_id: '2',
    author_id: 'user_2',
    author_avatar: require('../../assets/icon.png'),
    author_name: '快乐的宝妈',
    baby_age_text: '宝宝6个月',
    content: '宝宝今天终于会翻身了！太激动了，记录一下这个里程碑时刻。',
    images: [require('../../assets/icon.png')],
    tags: ['大运动', '翻身'],
    ctime: 1715990400000,
    author_city: '北京',
    like_count: 56,
    dislike_count: 0,
    collect_count: 12,
    comment_count: 8
  },
  {
    post_id: '3',
    author_id: 'user_3',
    author_avatar: require('../../assets/icon.png'),
    author_name: '育儿专家',
    baby_age_text: '专业育儿顾问',
    content:
      '关于宝宝辅食添加的几个误区，新手爸妈一定要注意！\n1. 不要在奶瓶里加米粉\n2. 不要过早添加调味品',
    images: [],
    tags: ['辅食', '避坑指南'],
    ctime: 1716076800000,
    author_city: '上海',
    like_count: 128,
    dislike_count: 2,
    collect_count: 89,
    comment_count: 45
  }
]

// 定义数据接口
interface BabyGrowthData {
  day: number // 天数（0-30）
  maleWeight: number // 男宝体重 (kg)
  femaleWeight: number // 女宝体重 (kg)
  maleHeadCircumference: number // 男宝头围 (cm)
  femaleHeadCircumference: number // 女宝头围 (cm)
  maleHeight: number // 男宝身高 (cm)
  femaleHeight: number // 女宝身高 (cm)
}

// 宝宝前30天生长模拟数据（含体重、头围、身高）
export const BABY_GROWTH_SIMULATION_DATA: BabyGrowthData[] = [
  {
    day: 0,
    maleWeight: 3.35,
    femaleWeight: 3.28,
    maleHeadCircumference: 34.5,
    femaleHeadCircumference: 34.0,
    maleHeight: 50.0,
    femaleHeight: 49.2
  },
  {
    day: 1,
    maleWeight: 3.37,
    femaleWeight: 3.29,
    maleHeadCircumference: 34.55,
    femaleHeadCircumference: 34.05,
    maleHeight: 50.2,
    femaleHeight: 49.4
  },
  {
    day: 2,
    maleWeight: 3.39,
    femaleWeight: 3.31,
    maleHeadCircumference: 34.58,
    femaleHeadCircumference: 34.08,
    maleHeight: 50.4,
    femaleHeight: 49.6
  },
  {
    day: 3,
    maleWeight: 3.41,
    femaleWeight: 3.33,
    maleHeadCircumference: 34.62,
    femaleHeadCircumference: 34.11,
    maleHeight: 50.6,
    femaleHeight: 49.8
  },
  {
    day: 4,
    maleWeight: 3.43,
    femaleWeight: 3.35,
    maleHeadCircumference: 34.65,
    femaleHeadCircumference: 34.14,
    maleHeight: 50.8,
    femaleHeight: 50.0
  },
  {
    day: 5,
    maleWeight: 3.45,
    femaleWeight: 3.37,
    maleHeadCircumference: 34.68,
    femaleHeadCircumference: 34.17,
    maleHeight: 51.0,
    femaleHeight: 50.2
  },
  {
    day: 6,
    maleWeight: 3.47,
    femaleWeight: 3.39,
    maleHeadCircumference: 34.71,
    femaleHeadCircumference: 34.2,
    maleHeight: 51.2,
    femaleHeight: 50.4
  },
  {
    day: 7,
    maleWeight: 3.49,
    femaleWeight: 3.41,
    maleHeadCircumference: 34.75,
    femaleHeadCircumference: 34.24,
    maleHeight: 51.4,
    femaleHeight: 50.6
  },
  {
    day: 8,
    maleWeight: 3.51,
    femaleWeight: 3.43,
    maleHeadCircumference: 34.78,
    femaleHeadCircumference: 34.27,
    maleHeight: 51.6,
    femaleHeight: 50.8
  },
  {
    day: 9,
    maleWeight: 3.53,
    femaleWeight: 3.45,
    maleHeadCircumference: 34.81,
    femaleHeadCircumference: 34.3,
    maleHeight: 51.8,
    femaleHeight: 51.0
  },
  {
    day: 10,
    maleWeight: 3.55,
    femaleWeight: 3.47,
    maleHeadCircumference: 34.84,
    femaleHeadCircumference: 34.33,
    maleHeight: 52.0,
    femaleHeight: 51.2
  },
  {
    day: 11,
    maleWeight: 3.57,
    femaleWeight: 3.49,
    maleHeadCircumference: 34.88,
    femaleHeadCircumference: 34.36,
    maleHeight: 52.2,
    femaleHeight: 51.4
  },
  {
    day: 12,
    maleWeight: 3.59,
    femaleWeight: 3.51,
    maleHeadCircumference: 34.91,
    femaleHeadCircumference: 34.39,
    maleHeight: 52.4,
    femaleHeight: 51.6
  },
  {
    day: 13,
    maleWeight: 3.61,
    femaleWeight: 3.53,
    maleHeadCircumference: 34.94,
    femaleHeadCircumference: 34.42,
    maleHeight: 52.6,
    femaleHeight: 51.8
  },
  {
    day: 14,
    maleWeight: 3.63,
    femaleWeight: 3.55,
    maleHeadCircumference: 34.97,
    femaleHeadCircumference: 34.45,
    maleHeight: 52.8,
    femaleHeight: 52.0
  },
  {
    day: 15,
    maleWeight: 3.65,
    femaleWeight: 3.57,
    maleHeadCircumference: 35.01,
    femaleHeadCircumference: 34.48,
    maleHeight: 53.0,
    femaleHeight: 52.2
  },
  {
    day: 16,
    maleWeight: 3.67,
    femaleWeight: 3.59,
    maleHeadCircumference: 35.04,
    femaleHeadCircumference: 34.51,
    maleHeight: 53.2,
    femaleHeight: 52.4
  },
  {
    day: 17,
    maleWeight: 3.69,
    femaleWeight: 3.61,
    maleHeadCircumference: 35.07,
    femaleHeadCircumference: 34.54,
    maleHeight: 53.4,
    femaleHeight: 52.6
  },
  {
    day: 18,
    maleWeight: 3.71,
    femaleWeight: 3.63,
    maleHeadCircumference: 35.1,
    femaleHeadCircumference: 34.57,
    maleHeight: 53.6,
    femaleHeight: 52.8
  },
  {
    day: 19,
    maleWeight: 3.73,
    femaleWeight: 3.65,
    maleHeadCircumference: 35.14,
    femaleHeadCircumference: 34.6,
    maleHeight: 53.8,
    femaleHeight: 53.0
  },
  {
    day: 20,
    maleWeight: 3.75,
    femaleWeight: 3.67,
    maleHeadCircumference: 35.17,
    femaleHeadCircumference: 34.64,
    maleHeight: 54.0,
    femaleHeight: 53.2
  },
  {
    day: 21,
    maleWeight: 3.77,
    femaleWeight: 3.69,
    maleHeadCircumference: 35.2,
    femaleHeadCircumference: 34.67,
    maleHeight: 54.2,
    femaleHeight: 53.4
  },
  {
    day: 22,
    maleWeight: 3.79,
    femaleWeight: 3.71,
    maleHeadCircumference: 35.23,
    femaleHeadCircumference: 34.7,
    maleHeight: 54.4,
    femaleHeight: 53.6
  },
  {
    day: 23,
    maleWeight: 3.81,
    femaleWeight: 3.73,
    maleHeadCircumference: 35.27,
    femaleHeadCircumference: 34.73,
    maleHeight: 54.6,
    femaleHeight: 53.8
  },
  {
    day: 24,
    maleWeight: 3.83,
    femaleWeight: 3.75,
    maleHeadCircumference: 35.3,
    femaleHeadCircumference: 34.76,
    maleHeight: 54.8,
    femaleHeight: 54.0
  },
  {
    day: 25,
    maleWeight: 3.85,
    femaleWeight: 3.77,
    maleHeadCircumference: 35.33,
    femaleHeadCircumference: 34.79,
    maleHeight: 55.0,
    femaleHeight: 54.2
  },
  {
    day: 26,
    maleWeight: 3.87,
    femaleWeight: 3.79,
    maleHeadCircumference: 35.36,
    femaleHeadCircumference: 34.82,
    maleHeight: 55.2,
    femaleHeight: 54.4
  },
  {
    day: 27,
    maleWeight: 3.89,
    femaleWeight: 3.81,
    maleHeadCircumference: 35.4,
    femaleHeadCircumference: 34.85,
    maleHeight: 55.4,
    femaleHeight: 54.6
  },
  {
    day: 28,
    maleWeight: 3.91,
    femaleWeight: 3.83,
    maleHeadCircumference: 35.43,
    femaleHeadCircumference: 34.88,
    maleHeight: 55.6,
    femaleHeight: 54.8
  },
  {
    day: 29,
    maleWeight: 3.93,
    femaleWeight: 3.85,
    maleHeadCircumference: 35.46,
    femaleHeadCircumference: 34.91,
    maleHeight: 55.8,
    femaleHeight: 55.0
  },
  {
    day: 30,
    maleWeight: 3.95,
    femaleWeight: 3.87,
    maleHeadCircumference: 35.49,
    femaleHeadCircumference: 34.94,
    maleHeight: 56.0,
    femaleHeight: 55.2
  }
]

// 添加新帖子的辅助函数
export const addMockPost = (newPost: PostItem) => {
  // 插入到头部
  MOCK_POSTS = [newPost, ...MOCK_POSTS]
}

// 更新帖子的辅助函数（用于点赞、收藏等同步）
export const updateMockPost = (id: string, updates: Partial<PostItem>) => {
  MOCK_POSTS = MOCK_POSTS.map(post => {
    if (post.post_id === id) {
      return { ...post, ...updates }
    }
    return post
  })
}

// 获取单个帖子详情（用于详情页加载）
export const getMockPostById = (id: string) => {
  return MOCK_POSTS.find(post => post.post_id === id)
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
