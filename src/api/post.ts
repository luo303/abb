import request from '@/utils/request'
import { PostListResponse } from '@/types/home'
import {
  CreatePostRequest,
  CreatePostResponse,
  PublishPostResponse
} from '@/types/post'
import { ApiResponse } from './profile'

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
 * 获取当前用户帖子列表
 * @param page 页码
 * @param pageSize 每页数量
 * @param strategy 排序策略
 */
export const getMyPosts = async (
  page = 1,
  pageSize = 10,
  strategy?: string
): Promise<PostListResponse> => {
  const res = await request.get('/post/mine', {
    params: {
      page,
      page_size: pageSize,
      strategy
    }
  })
  return res as unknown as PostListResponse
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
  data: CreatePostRequest
): Promise<CreatePostResponse> => {
  const res = await request.post('/post/newPost', data)
  return res.data
}

/**
 * 发布草稿
 * @param postId 帖子ID
 */
export const publishPost = async (
  postId: string
): Promise<PublishPostResponse> => {
  const res = await request.post(`/post/${postId}/publish`)
  return res.data
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
