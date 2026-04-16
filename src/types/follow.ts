export interface FollowingPost {
  post_id: string
  author_id: string
  author_name: string
  author_avatar: string
  author_province?: string
  author_city?: string
  title: string
  content: {
    text: string
    images: string[]
  }
  content_preview?: string
  status?: string
  like_count: number
  dislike_count: number
  collect_count: number
  comment_count: number
  is_like?: boolean
  is_dislike?: boolean
  is_collect?: boolean
  ctime?: number
  utime?: number
  tags: string[]
  baby_age_text: string
}

export interface FollowStatus {
  code: number
  message: string
  data: {
    message: string
  }
}

export interface FollowUserItem {
  user_id: string
  username: string
  avatar: string
  follow_time: number
}

export interface FollowUserListResponse {
  code: number
  message: string
  data: {
    list: FollowUserItem[]
    has_more: boolean
  }
}
