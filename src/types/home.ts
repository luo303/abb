export interface PostItem {
  post_id: string
  id?: string // 兼容某些接口可能返回 id 而不是 post_id
  author_id: string
  author_name: string
  author_avatar: string | any
  author_province?: string
  author_city?: string
  title?: string
  content: string
  content_preview?: string
  status?: string
  like_count: number
  dislike_count: number
  collect_count: number
  comment_count: number
  cover?: string
  images?: (string | any)[] // Assuming images are still needed for the carousel
  ctime?: number
  utime?: number
  tags: string[]
  baby_age_year?: number
  baby_age_month?: number
  baby_age_text: string
  location?: string // Keep location for compatibility if needed
}

export interface PostListResponse {
  code: number
  message: string
  data: {
    items: PostItem[]
    page: number
    page_size: number
    has_more: boolean
  }
}

export interface PostDetailResponse {
  code: number
  message: string
  data: {
    post: PostItem
  }
}
