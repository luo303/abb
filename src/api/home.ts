import request from '@/utils/request'
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
  const res = await request.get('/post', {
    params: {
      page: String(page),
      page_size: String(pageSize),
      strategy
    }
  })
  console.log('raw post list:', res)

  return res as unknown as PostListResponse
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
  const title = data.title?.trim()
  if (!title) {
    throw new Error('title is required')
  }

  const content =
    typeof data.content === 'string'
      ? data.content
      : JSON.stringify(data.content)

  const payload: {
    title: string
    content: string
    status: CreatePostParams['status']
    tag_ids?: string[]
  } = {
    title,
    content,
    status: data.status
  }

  if (data.tag_ids && Array.isArray(data.tag_ids)) {
    payload.tag_ids = data.tag_ids
  }

  const res = await request.post('/post/newPost', payload, {
    signal: options?.signal
  })
  console.log('create post data:', data)
  console.log('create post res:', res)

  // 检查响应是否包含错误码（部分 Mock 服务即使 HTTP 200 也会返回业务错误码）
  const response = res as unknown as CreatePostResponse
  if (response && response.code !== 0 && response.code !== 200) {
    throw new Error(response.message || 'Business error')
  }
  return response
}

/**
 * 获取帖子详情
 * @param post_id 帖子ID
 */
export const getPostDetail = async (
  post_id: string
): Promise<PostDetailResponse> => {
  const res = await request.get(`/post/${post_id}`)
  const response = res as unknown as PostDetailResponse
  return response
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
