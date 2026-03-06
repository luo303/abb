//帖子相关的数据类型
export interface Comment {
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
  replies: Comment[]
}

export interface CommentItemProps {
  comment: Comment
  onLike?: (id: string) => void
  onReply?: (comment: Comment) => void
}

// 创建帖子请求参数
export interface CreatePostRequest {
  title: string
  content: string
  status: string
  tag_ids?: string[]
}

// 发布草稿响应
export interface PublishPostResponse {
  code: number
  message: string
  data: {
    post_id: string
    status: string
    message: string
  }
}

// 创建帖子响应
export interface CreatePostResponse {
  code: number
  message: string
  data: {
    post_id: string
    status: string
    message: string
  }
}
