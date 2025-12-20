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
