import request from '@/utils/request'

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

  return request.post('/common/file/upload', formData)
}
