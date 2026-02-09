import { MOCK_POSTS } from '@/data/mock/homePosts'

export interface CommunityPost {
  nickname: string // 用户昵称
  description: string // 用户信息描述（如：宝宝1岁8个月）
  publishTime: string // 帖子发布时间
  location: string // 地址
  content: string // 发布文字内容
  tags: string[] // 标签
  images: any[] // 发布图片
  stats: {
    likes: number // 点赞数量
    dislikes: number // 反对数量
    favorites: number // 收藏数量
    comments: number // 评论数量
  }
}
/**
 * 获取首页社区帖子列表
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getHomePosts = async (page = 1, pageSize = 10) => {
  // 纯 Mock 模式：直接返回本地数据
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = MOCK_POSTS.slice(start, end)

  return {
    code: 200,
    msg: 'success (local mock)',
    data: {
      list,
      total: MOCK_POSTS.length,
      page,
      pageSize
    }
  }

  /*
  try {
    // ... 原有的网络请求逻辑已注释 ...
  } catch (error) { ... }
  */
}
