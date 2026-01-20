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
