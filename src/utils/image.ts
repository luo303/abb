// 图片处理工具函数

/**
 * 图片信息接口
 */
export interface ImageInfo {
  uri: string
  width: number
  height: number
  fileSize?: number
  type?: string
}

/**
 * 准备图片上传的配置选项
 */
export interface PrepareImageOptions {
  maxSize: number // 最大文件大小（字节）
  quality: number // 压缩质量 (0-1)
  targetFormat: 'jpeg' | 'png' | 'webp' // 目标格式
}

/**
 * 准备图片上传
 * 模拟将图片统一压缩并转换为标准格式的逻辑
 * @param imageUri 图片 URI
 * @param options 配置选项
 * @returns 处理后的图片信息
 */
export const prepareImageForUpload = async (
  imageUri: string,
  options: Partial<PrepareImageOptions> = {}
): Promise<ImageInfo> => {
  const {
    maxSize = 2 * 1024 * 1024, // 默认 2MB
    targetFormat = 'jpeg' // 默认转换为 JPEG 格式
  } = options

  try {
    // 模拟获取图片信息
    // 在实际应用中，这里会使用 Image.getSize 或其他方法获取图片信息
    const imageInfo: ImageInfo = {
      uri: imageUri,
      width: 1920,
      height: 1080,
      fileSize: 3 * 1024 * 1024, // 模拟 3MB 大小
      type: 'image/heic' // 模拟 HEIC 格式
    }

    // 检查文件大小
    if (imageInfo.fileSize && imageInfo.fileSize > maxSize) {
      console.log('Image size exceeds limit, compressing...')

      // 模拟压缩逻辑
      // 在实际应用中，这里会使用 ImageManipulator 或其他库进行压缩
      const compressedUri = imageUri.replace('.heic', `.${targetFormat}`)

      return {
        ...imageInfo,
        uri: compressedUri,
        fileSize: maxSize * 0.8, // 模拟压缩后的大小
        type: `image/${targetFormat}`
      }
    }

    // 检查格式是否需要转换
    if (imageInfo.type === 'image/heic') {
      console.log('Converting HEIC to standard format...')

      // 模拟格式转换逻辑
      const convertedUri = imageUri.replace('.heic', `.${targetFormat}`)

      return {
        ...imageInfo,
        uri: convertedUri,
        type: `image/${targetFormat}`
      }
    }

    // 不需要处理的情况
    return imageInfo
  } catch (error) {
    console.error('Error preparing image for upload:', error)
    throw error
  }
}

/**
 * 批量处理图片上传
 * @param imageUris 图片 URI 数组
 * @param options 配置选项
 * @returns 处理后的图片信息数组
 */
export const prepareImagesForUpload = async (
  imageUris: string[],
  options: Partial<PrepareImageOptions> = {}
): Promise<ImageInfo[]> => {
  const processedImages = await Promise.all(
    imageUris.map(uri => prepareImageForUpload(uri, options))
  )

  return processedImages
}
