// 生成临时ID的工具函数
export const generateTempId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`
}
