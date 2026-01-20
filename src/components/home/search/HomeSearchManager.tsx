import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import HomeSearchBar from './HomeSearchBar'
import HomeCommunityCard from '../HomeCommunityCard'

interface HomeSearchManagerProps {
  posts: any[]
  onSearchStateChange: (isSearching: boolean) => void
}

export default function HomeSearchManager({
  posts,
  onSearchStateChange
}: HomeSearchManagerProps) {
  const [searchText, setSearchText] = useState('')

  // 是否正在搜索（有输入内容）
  const isSearching = searchText.trim().length > 0

  // 通知父组件搜索状态变化
  useEffect(() => {
    onSearchStateChange(isSearching)
  }, [isSearching, onSearchStateChange])

  // 过滤帖子逻辑
  const filteredPosts = posts.filter(post => {
    if (!searchText.trim()) return true
    const searchContent = searchText.toLowerCase()
    return (
      post.content.toLowerCase().includes(searchContent) ||
      post.nickname.toLowerCase().includes(searchContent) ||
      post.location.toLowerCase().includes(searchContent)
    )
  })

  return (
    <View>
      <HomeSearchBar onSearch={setSearchText} />
      {/* 仅在搜索状态下显示结果列表 */}
      {isSearching && (
        <View style={{ marginTop: 15 }}>
          {filteredPosts.map(post => (
            <HomeCommunityCard key={post.id} data={post} />
          ))}
        </View>
      )}
    </View>
  )
}
