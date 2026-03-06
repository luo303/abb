// 生成临时ID的工具函数
import { v4 as uuidv4 } from 'uuid'

export const generateTempId = (prefix: string): string => {
  // 使用uuid库生成UUID v4格式的ID
  return uuidv4()
}
