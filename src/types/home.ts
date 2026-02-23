export interface PostItem {
  post_id: string
  id?: string // 兼容某些接口可能返回 id 而不是 post_id
  author_id: string
  author_name: string
  author_avatar: string | any
  author_province?: string
  author_city?: string
  title?: string
  content: string | { text: string; images: string[] }
  content_preview?: string
  status?: string
  like_count: number
  dislike_count: number
  collect_count: number
  comment_count: number
  cover?: string
  images?: (string | any)[] // Assuming images are still needed for the carousel
  imageUrls?: string[] // 从 content 中提取的图片 URL 数组
  cleanedContent?: string // 清洗后的纯文字内容
  ctime?: number
  utime?: number
  tags: string[]
  baby_age_year?: number
  baby_age_month?: number
  baby_age_text: string
  location?: string // Keep location for compatibility if needed
  is_followed?: boolean // 是否关注作者
}

// 首页获取帖子响应数据 - 使用Trae生成的类型结构
export interface PostListResponse {
  code: number
  message: string
  data: {
    has_more: boolean
    items: PostItem[]
    page: number
    page_size: number
    [property: string]: any
  }
  [property: string]: any
}

export interface PostDetailResponse {
  code: number
  message: string
  data: {
    post: PostItem
  }
}
