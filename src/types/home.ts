// 定义解析后的 content 类型
export interface ParsedContent {
  text?: string
  images?: (string | any)[]
}

export type HomeFeedTabKey = 'recommend' | 'hot' | 'following'

export interface PostItem {
  post_id: string
  id?: string // 兼容某些接口可能返回 id 而不是 post_id
  author_id: string
  author_name: string
  author_avatar: string
  author_province: string
  author_city: string
  title: string
  content: string | ParsedContent
  content_preview?: string // 接口定义中无此字段
  status: string
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
  cover: string // 接口定义中为必填
  images?: (string | any)[] // 额外字段：用于轮播图
  imageUrls?: string[] // 额外字段：从 content 中提取的图片 URL 数组
  cleanedContent?: string // 额外字段：清洗后的纯文字内容
  location?: string // 额外字段：位置信息
  is_like?: boolean // 接口字段：是否点赞
  is_dislike?: boolean // 接口字段：是否不喜欢
  is_collect?: boolean // 接口字段：是否收藏
  is_follow?: boolean // 详情接口字段：是否关注作者
  is_followed?: boolean // 额外字段：是否关注作者
  is_liked?: boolean // 额外字段：是否点赞
  is_disliked?: boolean // 额外字段：是否踩
  is_collected?: boolean // 额外字段：是否收藏
  __isLocalAdded?: boolean // 额外字段：标记本地添加的帖子
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
