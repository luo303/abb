//登陆之前的接口
import request from '../utils/request'
import { EmailLogin, AccountLogin } from './type'

export const apiLogin = (data: EmailLogin | AccountLogin) => {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}
