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
