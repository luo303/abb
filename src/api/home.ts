import request from '@/utils/request'

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
    const response: any = await request.get('/api/community/list', {
      params: { page, pageSize }
    })

    // 适配逻辑：兼容有 code 的真实接口和没有 code 的 Mock 接口
    const isSuccess = response.code === 200 || response.list

    if (isSuccess) {
      // 如果数据直接在 response 里（Mock 情况），或者在 response.data 里（标准情况）
      const actualData = response.data || response

      return {
        code: 200,
        msg: 'success',
        data: {
          list: actualData.list || [],
          total: actualData.total || actualData.list?.length || 0,
          page,
          pageSize
        }
      }
    } else {
      throw new Error('Invalid structure')
    }
  } catch (error) {
    console.error('[getHomePosts] Error:', error)
    return {
      code: 500,
      msg: 'Network Error',
      data: { list: [], total: 0, page, pageSize }
    }
  }
}
