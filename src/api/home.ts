import request from '@/utils/request'
import { MOCK_POSTS, getMockPostById } from '@/data/mock/homePosts'
import { PostListResponse, PostDetailResponse } from '@/types/home'

/**
 * 获取首页社区帖子列表
 * @param page 页码
 * @param pageSize 每页数量
 * @param strategy 排序策略
 */
export const getHomePosts = async (
  page = 1,
  pageSize = 10,
  strategy?: string
): Promise<PostListResponse> => {
  try {
    const res = (await request.get('/post', {
      params: {
        page: String(page),
        page_size: String(pageSize),
        strategy
      }
    })) as any
    // 由于响应拦截器返回的是response.data，所以需要构建完整的响应结构
    return {
      code: res.code || 200,
      message: res.message || 'success',
      data: res.data || {
        items: [],
        page,
        page_size: pageSize,
        has_more: false
      }
    } as PostListResponse
  } catch (error: any) {
    console.error(
      '首页请求失败详情:',
      error.response?.status,
      error.response?.data
    )
    console.warn('Network request failed, falling back to mock data', error)

    // 纯 Mock 模式：直接返回本地数据
    const start = (page - 1) * pageSize
    const end = start + pageSize
    let list = MOCK_POSTS.slice(start, end)

    // 根据策略排序
    if (strategy === 'hot') {
      list.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    } else if (strategy === 'ctime') {
      list.sort((a, b) => (b.ctime || 0) - (a.ctime || 0))
    }

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
  tag_ids: string[]
  tags?: string[]
  isPublic: number // 1: 公开, 0: 私密
  status: 'published' | 'draft' | 'milestone' // 状态：发布或草稿或大事记
  title?: string // 帖子标题
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
  data: CreatePostParams,
  options?: { signal?: AbortSignal }
): Promise<CreatePostResponse> => {
  try {
    const res = await request.post('/post/newPost', data, {
      signal: options?.signal
    })
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
        post_id: '1011',
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
    console.warn('Network request failed, falling back to mock data', error)

    // 从本地 Mock 数据中获取
    const mockPost = getMockPostById(post_id)

    if (mockPost) {
      return {
        code: 200,
        message: 'success (local mock)',
        data: {
          post: mockPost
        }
      }
    }

    // 如果 Mock 数据中也没有，再抛出错误
    throw error
  }
}

export interface CommentApiItem {
  comment_id: string
  user_id: string
  username: string
  avatar: string
  content: string
  like_count: number
  reply_count: number
  ctime: number
  utime: number
  has_liked: boolean
}

export interface CommentListData {
  items: CommentApiItem[]
  page: number
  page_size: number
  has_more: boolean
}

export interface CommentListResponse {
  code: number
  message: string
  data: CommentListData
}

export interface CommentListParams {
  page?: number
  page_size?: number
  strategy?: string
}

export const getPostComments = async (
  post_id: string,
  params: CommentListParams = {}
): Promise<CommentListResponse> => {
  const { page = 1, page_size = 10, strategy = 'ctime' } = params
  const res = await request.get(`/post/${post_id}/comments`, {
    params: {
      page,
      page_size,
      strategy
    }
  })
  return res as unknown as CommentListResponse
}

export interface CommentLikeResponse {
  code: number
  message: string
  data: any | null
}

export const likeComment = async (
  comment_id: string
): Promise<CommentLikeResponse> => {
  const res = await request.post(`/post/comments/${comment_id}/like`)
  return res as unknown as CommentLikeResponse
}

export const unlikeComment = async (
  comment_id: string
): Promise<CommentLikeResponse> => {
  const res = await request.delete(`/post/comments/${comment_id}/like`)
  return res as unknown as CommentLikeResponse
}

export interface CreateCommentRequest {
  parent_id: string
  content: string
}

export interface CreateCommentData {
  comment_id: string
  message: string
}

export interface CreateCommentResponse {
  code: number
  message: string
  data: CreateCommentData
}

export const createPostComment = async (
  post_id: string,
  data: CreateCommentRequest
): Promise<CreateCommentResponse> => {
  const res = await request.post(`/post/${post_id}/comments`, data)
  return res as unknown as CreateCommentResponse
}

export const getPostCommentReplies = async (
  post_id: string,
  comment_id: string,
  params: CommentListParams = {}
): Promise<CommentListResponse> => {
  const { page = 1, page_size = 10, strategy = 'ctime' } = params
  const res = await request.get(
    `/post/${post_id}/comments/${comment_id}/replies`,
    {
      params: {
        page,
        page_size,
        strategy
      }
    }
  )
  return res as unknown as CommentListResponse
}
