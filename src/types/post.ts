//帖子相关的数据类型
export interface Comment {
  id: string //评论id
  avatar: any //评论用户头像
  nickname: string //评论用户昵称
  content: string //评论内容
  time: string //评论时间
  location?: string //评论用户位置
  likes?: number //评论点赞数
  isLiked?: boolean //是否点赞
  replies: Comment[] //子评论列表
}

export interface CommentItemProps {
  comment: Comment
  onLike?: (id: string) => void
  onReply?: (comment: Comment) => void
}
