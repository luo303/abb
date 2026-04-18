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

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export type PostStatus = 'draft' | 'published' | 'milestone'

export interface DraftContent {
  text: string
  images: string[]
}

export interface PostMutationData {
  post_id: string
  status: string
  message: string
}

// 创建帖子请求参数
export interface CreatePostRequest {
  title: string
  content: string
  status: PostStatus
  tag_ids?: string[]
}

export interface UpdateDraftRequest {
  title: string
  content: DraftContent
  tag_ids: string[]
}

export type CreatePostResponse = ApiResponse<PostMutationData>

export type PublishPostResponse = ApiResponse<PostMutationData>

export type UpdateDraftResponse = ApiResponse<PostMutationData>

export type DeleteDraftResponse = ApiResponse<null>

export interface PagedListData<TItem> {
  items: TItem[]
  page: number
  page_size: number
  has_more: boolean
}

export interface PostMineListItem {
  post_id: string
  author_id: string
  author_name: string
  author_avatar: string
  author_province: string
  author_city: string
  title: string
  content: string
  content_preview: string
  status: PostStatus
  like_count: number
  dislike_count: number
  collect_count: number
  comment_count: number
  ctime: number
  utime: number
  tags: string[]
  baby_age_year: number
  baby_age_month: number
  baby_age_text: string
}

export type MyDraftListResponse = ApiResponse<PagedListData<PostMineListItem>>

export type MyPostListResponse = ApiResponse<PagedListData<PostMineListItem>>
