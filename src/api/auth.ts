//登陆之前的接口
import request from '../utils/request'
import { EmailLogin, AccountLogin, resLogin } from './type'

export const apiLogin = (
  data: EmailLogin | AccountLogin
): Promise<resLogin> => {
  return request.post('/user/login?apifoxApiId=392864290', data) //要测试记得改成自己本地mock接口
}
