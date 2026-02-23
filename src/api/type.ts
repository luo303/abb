//接口数据类型

//邮箱登录
export interface EmailLogin {
  email: string
  code: string
  login_type: string
}
//账号密码登录
export interface AccountLogin {
  account: string
  password: string
  login_type: string
}
//登录响应数据
export interface resLogin {
  code: number
  message: string
  data: {
    token: string
    username: string
    avatar: string
  } | null
}
//邮箱登录验证码响应体
export interface resLoginCode {
  code: number
  message: string
  data: {
    [key: string]: any
  } | null
}
//注册
export interface Register {
  account: string
  password: string
  username: string
  email: string
  code: string
  gender: 'male' | 'female'
}
//注册响应数据
export interface resRegister {
  code: number
  message: string
  data: {
    message: string
  } | null
}

//首页获取帖子响应数据
export interface Response {
  code: number
  data: Data
  message: string
  [property: string]: any
}

export interface Data {
  has_more: boolean
  items: Item[]
  page: number
  page_size: number
  [property: string]: any
}

export interface Item {
  post_id: string
  images?: string[]
  author_id: string
  author_name: string
  author_avatar: string
  author_province: string
  author_city: string
  title: string
  content: string
  content_preview: string
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
  [property: string]: any
}
