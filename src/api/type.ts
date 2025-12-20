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
