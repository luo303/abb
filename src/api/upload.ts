import { baseURL } from '@/utils/request'
import * as SecureStore from 'expo-secure-store'

//文件上传
export const uploadFile = async (uri: string) => {
  const formData = new FormData()
  const filename = uri.split('/').pop() || 'image.jpg'
  const match = /\.(\w+)$/.exec(filename)
  const type = match ? `image/${match[1]}` : 'image/jpeg'

  // @ts-ignore
  formData.append('file', {
    uri,
    name: filename,
    type
  })

  // 使用原生 fetch 上传
  // 直接从 SecureStore 获取 token
  const token = SecureStore.getItem('token')

  // 修复：Content-Type 不应手动设置 multipart/form-data，fetch 会自动设置并带上 boundary

  // 纯 Mock 模式：直接返回成功，不发起网络请求
  // 直接返回本地 URI，以便在首页显示用户选择的真实图片
  // console.log('Mock upload: using local uri', uri)
  return {
    code: 200,
    msg: 'Mock upload success',
    data: {
      url: uri
    }
  }

  /*
  let response
  try {
    // ... 原有的网络请求逻辑已注释 ...
  } catch (error: any) { ... }
  */
}
