import axios from 'axios'
import store from '../store'
import { clearToken } from '../store/modules/userStore'
import { router } from 'expo-router'
//创建axios实例
const baseURL = 'http://111.228.15.67:8080' //暂时没有服务器地址
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
          router.push('/login')
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
