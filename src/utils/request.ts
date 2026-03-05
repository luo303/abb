import axios from 'axios'
// import store from '../store'
import * as SecureStore from 'expo-secure-store'
//创建axios实例
const baseURL = 'https://tayna-nonredemptible-dissipatedly.ngrok-free.dev/api' //云端mock地址
const request = axios.create({
  baseURL,
  timeout: 10000 //10s
})
//请求拦截器
request.interceptors.request.use(async (config: any) => {
  // 直接从 SecureStore 获取 token，避免循环引用
  try {
    const token = await SecureStore.getItemAsync('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.warn('Error getting token:', error)
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
      const status = error.response.status
      switch (status) {
        case 401:
          // 动态导入 store 和 clearToken 以处理 dispatch
          import('../store').then(({ default: store }) => {
            import('../store/modules/userStore').then(({ clearToken }) => {
              store.dispatch(clearToken())
            })
          })
          break
        default:
          // 可以在这里添加日志记录或其他处理
          break
      }
      return Promise.reject(error)
    }
  }
)
export default request
export { baseURL }
