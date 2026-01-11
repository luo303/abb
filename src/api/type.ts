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
}
//注册响应数据
export interface resRegister {
  code: number
  message: string
  data: {
    message: string
  } | null
}
