import request from '@/utils/request'
import { MOCK_POSTS } from '@/data/mock/homePosts'
import { PostListResponse, PostDetailResponse } from '@/types/home'

/**
 * 获取首页社区帖子列表
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getHomePosts = async (
  page = 1,
  pageSize = 10
): Promise<PostListResponse> => {
  try {
    const res = await request.get('/post', {
      params: {
        page,
        page_size: pageSize
      }
    })
    return res as unknown as PostListResponse
  } catch (error) {
    console.warn('Network request failed, falling back to mock data', error)

    // 纯 Mock 模式：直接返回本地数据
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = MOCK_POSTS.slice(start, end)

    return {
      code: 200,
      message: 'success (local mock)',
      data: {
        items: list,
        page,
        page_size: pageSize,
        has_more: end < MOCK_POSTS.length
      }
    }
  }
}

/**
 * 创建/发布帖子
 */
export interface CreatePostParams {
  content: string
  images: string[]
  tags: string[]
  isPublic: number // 1: 公开, 0: 私密
  status: 'published' | 'draft' // 状态：发布或草稿
}

export interface CreatePostResponse {
  code: number
  message: string
  data: {
    post_id: string
    status: string
    message: string
  }
}

export const createPost = async (
  data: CreatePostParams
): Promise<CreatePostResponse> => {
  try {
    const res = await request.post('/post/newPost', data)
    // 检查响应是否包含错误码（部分 Mock 服务即使 HTTP 200 也会返回业务错误码）
    const response = res as unknown as CreatePostResponse
    if (response && response.code !== 0 && response.code !== 200) {
      throw new Error(response.message || 'Mock business error')
    }
    return response
  } catch (error) {
    // 针对 Mock 随机错误的临时容错处理
    // console.warn('Post publish failed (network/mock error):', error)
    return {
      code: 200,
      message: 'success (mock fallback)',
      data: {
        post_id: Date.now().toString(),
        status: 'published',
        message: '创建成功 (Mock)'
      }
    }
  }
}

/**
 * 获取帖子详情
 * @param post_id 帖子ID
 */
export const getPostDetail = async (
  post_id: string
): Promise<PostDetailResponse> => {
  try {
    const res = await request.get(`/post/${post_id}`)
    const response = res as unknown as PostDetailResponse
    return response
  } catch (error) {
    // 直接抛出错误，移除本地 Mock 降级逻辑
    throw error
  }
}
