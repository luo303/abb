//登陆之前的接口
import request from '../utils/request'
import {
  EmailLogin,
  AccountLogin,
  resLogin,
  Register,
  resRegister,
  resLoginCode
} from './type'
//登录
export const apiLogin = (
  data: EmailLogin | AccountLogin
): Promise<resLogin> => {
  return request.post('/user/login', data)
}
//邮箱登录验证码
export const apiLoginCode = (data: {
  email: string
}): Promise<resLoginCode> => {
  return request.post('/user/code/login', data)
}
//注册
export const apiRegister = (data: Register): Promise<resRegister> => {
  return request.post('/user/register', data)
}
//注册验证码
export const apiRegisterCode = (data: {
  email: string
}): Promise<resLoginCode> => {
  return request.post('/user/code/register', data)
}
//重置密码发送验证码
export const apiResetPasswordCode = (data: {
  email: string
}): Promise<resLoginCode> => {
  return request.post('/user/code/reset', data)
}
//重置密码
export const apiResetPassword = (data: {
  email: string
  code: string
  new_password: string
}): Promise<resRegister> => {
  return request.post('/user/resetPassword', data)
}
