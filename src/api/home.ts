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
    const res = await request.get('/post/list', {
      params: {
        page,
        page_size: pageSize
      }
    })
    return res as unknown as PostListResponse
  } catch (error) {
    console.warn('Network request failed, falling back to mock data')

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
 * 获取帖子详情
 * @param id 帖子ID
 */
export const getPostDetail = async (
  id: string
): Promise<PostDetailResponse> => {
  try {
    const res = await request.get(`/post/${id}`)
    return res as unknown as PostDetailResponse
  } catch (error) {
    console.warn('Network request failed, falling back to mock data')
    // 降级使用 Mock 数据
    const mockPost = MOCK_POSTS.find(p => p.post_id === id)
    if (mockPost) {
      return {
        code: 200,
        message: 'success (local mock)',
        data: {
          post: mockPost
        }
      }
    }
    throw error
  }
}
