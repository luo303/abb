import request from '@/utils/request'
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
  try {
    // 使用 request 实例发送请求
    const response: any = await request.get('/api/community/list', {
      params: { page, pageSize }
    })

    // request.ts 的响应拦截器已经返回了 response.data
    if (response && response.code === 200) {
      return response
    } else {
      // 如果接口请求失败或没有数据，回退到本地 Mock 数据
      // 模拟分页逻辑
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const list = MOCK_POSTS.slice(start, end)

      return {
        code: 200,
        msg: 'success (fallback mock)',
        data: {
          list,
          total: MOCK_POSTS.length,
          page,
          pageSize
        }
      }
    }
  } catch (error) {
    console.error('getHomePosts error:', error)
    // 网络错误时也回退到 Mock 数据
    const list = MOCK_POSTS.slice(0, pageSize)
    return {
      code: 200,
      msg: 'Network Error (fallback mock)',
      data: {
        list,
        total: MOCK_POSTS.length,
        page,
        pageSize
      }
    }
  }
}
