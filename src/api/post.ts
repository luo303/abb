import request from '@/utils/request'
import { MOCK_POSTS } from '@/data/mock/homePosts'
import { PostListResponse } from '@/types/home'

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
  try {
    const res = await request.get('/post/search', {
      params: {
        page,
        page_size: pageSize,
        keyword,
        tag_id: tagId,
        strategy
      }
    })
    // 确保返回的数据结构正确
    if (!res || typeof res !== 'object') {
      throw new Error('Invalid response format')
    }
    return res as unknown as PostListResponse
  } catch (error) {
    console.warn('Network request failed, falling back to mock data', error)

    // 纯 Mock 模式：直接返回本地数据
    const start = (page - 1) * pageSize
    const end = start + pageSize

    // 模拟搜索功能
    let filteredList = MOCK_POSTS.filter(post => {
      // 尝试解析 content 字段
      let contentText = ''
      try {
        if (typeof post.content === 'string') {
          const parsed = JSON.parse(post.content)
          if (parsed && typeof parsed === 'object' && parsed.text) {
            contentText = parsed.text
          }
        } else if (typeof post.content === 'object' && post.content.text) {
          contentText = post.content.text
        }
      } catch (e) {
        // 解析失败，使用原始内容
        contentText = typeof post.content === 'string' ? post.content : ''
      }

      // 搜索标题和内容
      return (
        (post.title && post.title.includes(keyword)) ||
        contentText.includes(keyword) ||
        (post.tags && post.tags.some(tag => tag.includes(keyword)))
      )
    })

    // 应用排序策略
    if (strategy === 'hot') {
      // 按热度排序（点赞数）
      filteredList.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
    } else if (strategy === 'time') {
      // 按时间降序排序
      filteredList.sort((a, b) => (b.ctime || 0) - (a.ctime || 0))
    }

    let list = filteredList.slice(start, end)

    // 确保返回的数据结构符合 API 文档要求
    const formattedList = list.map(post => ({
      post_id: post.post_id,
      author_id: post.author_id,
      author_name: post.author_name,
      author_avatar:
        typeof post.author_avatar === 'string' ? post.author_avatar : '',
      author_province: post.author_province || '',
      author_city: post.author_city || '',
      title: post.title || '',
      content:
        typeof post.content === 'string'
          ? post.content
          : JSON.stringify(post.content),
      content_preview:
        post.content_preview ||
        (typeof post.content === 'string'
          ? post.content.substring(0, 100)
          : ''),
      status: post.status || 'published',
      like_count: post.like_count || 0,
      dislike_count: post.dislike_count || 0,
      collect_count: post.collect_count || 0,
      comment_count: post.comment_count || 0,
      ctime: post.ctime || Date.now(),
      utime: post.utime || Date.now(),
      tags: post.tags || [],
      baby_age_year: post.baby_age_year || 0,
      baby_age_month: post.baby_age_month || 0,
      baby_age_text: post.baby_age_text
    }))

    return {
      code: 200,
      message: 'success (local mock)',
      data: {
        items: formattedList,
        page,
        page_size: pageSize,
        has_more: end < filteredList.length
      }
    }
  }
}
