import request from '@/utils/request'
import { PostListResponse } from '@/types/home'
import {
  CreatePostRequest,
  CreatePostResponse,
  DeleteDraftResponse,
  MyDraftListResponse,
  MyPostListResponse,
  PublishPostResponse,
  UpdateDraftRequest,
  UpdateDraftResponse
} from '@/types/post'
import { ApiResponse } from './profile'

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

const ensureBusinessSuccess = <T extends { code: number; message: string }>(
  response: T
): T => {
  if (response.code !== 0 && response.code !== 200) {
    throw new Error(response.message || 'Business error')
  }
  return response
}

export interface PostTagItem {
  tag_id: string
  name: string
  description: string
}

export interface PostTagListResponse {
  code: number
  message: string
  data: {
    items: PostTagItem[]
    page: number
    page_size: number
    has_more: boolean
  }
}

/**
 * 搜索帖子
 * @param keyword 搜索关键词
 * @param page 页码
 * @param pageSize 每页数量
 * @param tagId 标签ID
 * @param strategy 排序策略
 */
export const searchPosts = async (
  keyword: string,
  page = 1,
  pageSize = 10,
  tagId?: string,
  strategy?: string
): Promise<PostListResponse> => {
  const res = await request.get('/post/search', {
    params: {
      page: String(page),
      page_size: String(pageSize),
      keyword,
      tag_id: tagId,
      strategy
    }
  })
  // 确保返回的数据结构正确
  if (!res || typeof res !== 'object') {
    throw new Error('Invalid response format')
  }

  // 返回 API 响应，即使没有结果
  return res as unknown as PostListResponse
}

/**
 * 获取帖子话题列表
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getPostTags = async (
  page = 1,
  pageSize = 10
): Promise<PostTagListResponse> => {
  const res = await request.get('/post/tags', {
    params: {
      page,
      page_size: pageSize
    }
  })
  console.log('get tags res:', res)

  return res as unknown as PostTagListResponse
}

/**
 * 获取当前用户帖子列表
 * @param page 页码
 * @param pageSize 每页数量
 * @param strategy 排序策略
 */
export const getMyPosts = async (
  page = 1,
  pageSize = 10,
  strategy?: string,
  options?: { signal?: AbortSignal }
): Promise<MyPostListResponse> => {
  try {
    const res = await request.get('/post/mine', {
      params: {
        page,
        page_size: pageSize,
        strategy
      },
      signal: options?.signal
    })
    return ensureBusinessSuccess(res as unknown as MyPostListResponse)
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}

export const getMyDrafts = async (
  page = 1,
  pageSize = 10,
  options?: { signal?: AbortSignal }
): Promise<MyDraftListResponse> => {
  try {
    const res = await request.get('/post/mine/drafts', {
      params: {
        page,
        page_size: pageSize
      },
      signal: options?.signal
    })
    return ensureBusinessSuccess(res as unknown as MyDraftListResponse)
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * 获取用户收藏帖子列表
 * @param page 页码
 * @param pageSize 每页数量
 * @param strategy 排序策略
 */
export const getMyCollections = async (
  page = 1,
  pageSize = 10,
  strategy?: string
): Promise<PostListResponse> => {
  const res = await request.get('/post/mine/collections', {
    params: {
      page,
      page_size: pageSize,
      strategy
    }
  })
  return res as unknown as PostListResponse
}

/**
 * 获取用户大事记列表
 * @param page 页码
 * @param pageSize 每页数量
 * @param strategy 排序策略
 */
export const getMyMilestones = async (
  page = 1,
  pageSize = 10,
  strategy?: string
): Promise<PostListResponse> => {
  const res = await request.get('/post/mine/milestone', {
    params: {
      page,
      page_size: pageSize,
      strategy
    }
  })
  return res as unknown as PostListResponse
}

/**
 * 创建帖子/草稿/大事记
 * @param data 创建帖子的数据
 */
export const createPost = async (
  data: CreatePostRequest,
  options?: { signal?: AbortSignal }
): Promise<CreatePostResponse> => {
  try {
    const res = await request.post('/post/newPost', data, {
      signal: options?.signal
    })
    console.log('create post res:', res)

    return ensureBusinessSuccess(res as unknown as CreatePostResponse)
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}

/**
 * 发布草稿
 * @param postId 帖子ID
 */
export const publishPost = async (
  postId: string,
  options?: { signal?: AbortSignal }
): Promise<PublishPostResponse> => {
  try {
    const res = await request.post(`/post/${postId}/publish`, undefined, {
      signal: options?.signal
    })
    return ensureBusinessSuccess(res as unknown as PublishPostResponse)
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}

export const createPostDraft = async (
  payload: CreatePostRequest,
  options?: { signal?: AbortSignal }
): Promise<CreatePostResponse> => {
  return createPost(payload, options)
}

export const publishDraft = async (
  postId: string,
  options?: { signal?: AbortSignal }
): Promise<PublishPostResponse> => {
  return publishPost(postId, options)
}

export const updateDraft = async (
  postId: string,
  payload: UpdateDraftRequest,
  options?: { signal?: AbortSignal }
): Promise<UpdateDraftResponse> => {
  try {
    const res = await request.post(`/post/${postId}`, payload, {
      signal: options?.signal
    })
    return ensureBusinessSuccess(res as unknown as UpdateDraftResponse)
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}

export const deleteDraft = async (
  postId: string,
  options?: { signal?: AbortSignal }
): Promise<DeleteDraftResponse> => {
  try {
    const res = await request.delete(`/post/${postId}`, {
      signal: options?.signal
    })
    return ensureBusinessSuccess(res as unknown as DeleteDraftResponse)
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error))
  }
}

export const likePost = async (postId: string): Promise<ApiResponse<null>> => {
  const res = await request.post(`/post/${postId}/like`)
  return res as unknown as ApiResponse<null>
}

export const unlikePost = async (
  postId: string
): Promise<ApiResponse<null>> => {
  const res = await request.delete(`/post/${postId}/like`)
  return res as unknown as ApiResponse<null>
}

export interface CollectResponseData {
  collection_id: string
  message: string
}

export const collectPost = async (
  postId: string
): Promise<ApiResponse<CollectResponseData>> => {
  const res = await request.post(`/post/${postId}/collect`)
  return res as unknown as ApiResponse<CollectResponseData>
}

export const uncollectPost = async (
  postId: string
): Promise<ApiResponse<CollectResponseData>> => {
  const res = await request.delete(`/post/${postId}/collect`)
  return res as unknown as ApiResponse<CollectResponseData>
}
