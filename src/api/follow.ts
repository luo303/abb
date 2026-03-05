import request from '@/utils/request'
import { FollowStatus, FollowingPost } from '@/types/follow'

export const followUser = async (
  target_user_id: string
): Promise<FollowStatus> => {
  try {
    const res = (await request.post(
      `/user/follow/${target_user_id}`
    )) as FollowStatus

    if (res.code !== 0 && res.code !== 200) {
      throw new Error(res.message || '操作失败')
    }

    return res
  } catch (error: any) {
    console.error('关注操作失败:', error)
    throw new Error(
      error.response?.data?.message || error.message || '操作失败'
    )
  }
}

export const unfollowUser = async (
  target_user_id: string
): Promise<FollowStatus> => {
  try {
    const res = (await request.delete(
      `/user/follow/${target_user_id}`
    )) as FollowStatus

    if (res.code !== 0 && res.code !== 200) {
      throw new Error(res.message || '操作失败')
    }

    return res
  } catch (error: any) {
    console.error('取消关注操作失败:', error)
    throw new Error(
      error.response?.data?.message || error.message || '操作失败'
    )
  }
}

export const toggleFollow = async (
  target_user_id: string
): Promise<FollowStatus> => {
  return followUser(target_user_id)
}

/**
 * 获取关注的帖子列表
 * @param page 页码
 * @param page_size 每页数量
 * @returns 关注帖子列表
 */
export const getFollowingPosts = async (
  page: number = 1,
  page_size: number = 10
): Promise<{
  code: number
  message: string
  data: {
    page: number
    page_size: number
    has_more: boolean
    items: FollowingPost[]
  }
}> => {
  try {
    const res = (await request.get('/post/following', {
      params: {
        page,
        page_size
      }
    })) as {
      code: number
      message: string
      data: {
        page: number
        page_size: number
        has_more: boolean
        items: FollowingPost[]
      }
    }
    console.log('[follow] getFollowingPosts', res)

    // 处理后端返回的非成功状态码
    if (res.code !== 0 && res.code !== 200) {
      throw new Error(res.message || '获取关注帖子失败')
    }

    return res
  } catch (error) {
    console.error('获取关注帖子失败:', error)
    throw error
  }
}
