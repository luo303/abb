//帖子相关的数据类型
export interface Comment {
  id: string
  avatar: any
  nickname: string
  content: string
  time: string
  location?: string
  likes: number
  isLiked?: boolean
  replies?: Comment[]
}

export interface CommentItemProps {
  comment: Comment
  onLike?: (id: string) => void
}
