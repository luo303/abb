import store from '@/store'
import { baseURL } from '@/utils/request'
import { MOCK_FALLBACK_IMAGE } from '@/data/mock/homePosts'
//文件上传
export const uploadFile = async (uri: string) => {
  // 开发环境返回 mock 响应，避免调用真实 API
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data: {
          url: MOCK_FALLBACK_IMAGE
        }
      })
    }, 100)
  })

  // 以下是真实 API 调用代码，暂时注释掉
  /*
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
  const token = store.getState().user.token

  const response = await fetch(`${baseURL}/common/file/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  const json = await response.json()
  if (!response.ok) {
    throw new Error(json.message || 'Upload failed')
  }
  return json
  */
}
