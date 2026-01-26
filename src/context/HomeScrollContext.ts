import { createContext } from 'react'

// 创建一个滚动上下文，用于点击 BannerItem 后滚动到指定区域
export const HomeScrollToContext = createContext({
  scrollToCommunity: () => {}
})
