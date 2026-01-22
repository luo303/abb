import { Comment } from '../../types/post'
// 模拟社区帖子数据
export const MOCK_POSTS = [
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
export const historyList = [
  { id: '1', title: '关于宝宝辅食的建议', date: '2024-05-20' },
  { id: '2', title: '如何处理宝宝红屁股', date: '2024-05-18' },
  { id: '3', title: '新生儿疫苗接种时间表', date: '2024-05-15' },
  { id: '4', title: '关于宝宝辅食的建议', date: '2024-05-20' },
  { id: '5', title: '如何处理宝宝红屁股', date: '2024-05-18' },
  { id: '6', title: '新生儿疫苗接种时间表', date: '2024-05-15' },
  { id: '7', title: '关于宝宝辅食的建议', date: '2024-05-20' },
  { id: '8', title: '如何处理宝宝红屁股', date: '2024-05-18' },
  { id: '9', title: '新生儿疫苗接种时间表', date: '2024-05-15' },
  { id: '10', title: '关于宝宝辅食的建议', date: '2024-05-20' },
  { id: '11', title: '如何处理宝宝红屁股', date: '2024-05-18' },
  { id: '12', title: '新生儿疫苗接种时间表', date: '2024-05-15' },
  { id: '13', title: '关于宝宝辅食的建议', date: '2024-05-20' },
  { id: '14', title: '如何处理宝宝红屁股', date: '2024-05-18' },
  { id: '15', title: '新生儿疫苗接种时间表', date: '2024-05-15' }
]
