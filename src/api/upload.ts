import store from '@/store'
import { baseURL } from '@/utils/request'
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
}
