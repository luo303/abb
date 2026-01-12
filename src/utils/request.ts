import axios from 'axios'
import store from '../store'
import { clearToken } from '../store/modules/userStore'
//创建axios实例
const baseURL = 'https://m1.apifoxmock.com/m1/7571791-7309471-default' //云端mock地址
const request = axios.create({
  baseURL,
  timeout: 10000 //10s
})
//请求拦截器
request.interceptors.request.use((config: any) => {
  const token = store.getState().user.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
//响应拦截器
request.interceptors.response.use(
  (response: any) => {
    return response.data
  },
  (error: any) => {
    //处理网络错误或跨域报错
    if (!error.response) {
      const networkError = new Error('网络错误，请检查网络连接或跨域配置')
      ;(networkError as any).isNetworkError = true
      return Promise.reject(networkError)
    } else {
      let msg = ''
      const status = error.response.status
      switch (status) {
        case 401:
          msg = '登录失效'
          store.dispatch(clearToken())
          // 登录过期处理：这里应该通过Redux或其他全局状态管理来处理导航
          // 例如：dispatch(logout()) 然后在组件中监听状态变化进行导航
          console.log('登录过期，需要跳转到登录页')
          break
        default:
          msg = `${error.response.data.message}`
      }
      console.log(msg)
      return Promise.reject(error)
    }
  }
)
export default request
export { baseURL }
