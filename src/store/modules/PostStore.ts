import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  PostItem,
  PostListResponse,
  PostDetailResponse,
  ParsedContent
} from '../../types/home'
import { getPostDetail, getHomePosts } from '../../api/home'
import { getFollowingPosts } from '../../api/follow'

// 私有 Helper 函数：统一处理 content 字段的解析逻辑
const parsePostContent = (post: PostItem): PostItem => {
  if (post.content) {
    if (typeof post.content === 'string') {
      try {
        const parsedContent = JSON.parse(post.content) as ParsedContent
        if (parsedContent && typeof parsedContent === 'object') {
          return {
            ...post,
            content: parsedContent,
            images: parsedContent.images || []
          }
        } else {
          // 如果解析结果不是对象，使用默认显示方案
          return {
            ...post,
            content: { text: post.content, images: [] } as ParsedContent,
            images: []
          }
        }
      } catch (parseError) {
        // 如果解析失败，使用默认显示方案
        return {
          ...post,
          content: { text: post.content, images: [] } as ParsedContent,
          images: []
        }
      }
    } else if (
      typeof post.content === 'object' &&
      (post.content as ParsedContent).text
    ) {
      // content已经是对象，直接使用
      return {
        ...post,
        images: (post.content as ParsedContent).images || []
      }
    } else {
      // 其他情况，使用默认显示方案
      return {
        ...post,
        content: { text: String(post.content), images: [] } as ParsedContent,
        images: []
      }
    }
  } else {
    // 如果 content 为空，使用默认显示方案
    return {
      ...post,
      content: { text: '', images: [] } as ParsedContent,
      images: []
    }
  }
}

interface PostState {
  loading: boolean
  error: string | null
  postList: PostItem[]
  currentPost: PostItem | null
  // 关注列表相关状态
  followingPosts: PostItem[]
  followPage: number
  followHasMore: boolean
  isFollowLoading: boolean
  // 分页相关状态
  page: number
  hasMore: boolean
  isLoadingMore: boolean
}

const initialState: PostState = {
  loading: false,
  error: null,
  postList: [],
  currentPost: null,
  // 关注列表相关状态
  followingPosts: [],
  followPage: 1,
  followHasMore: true,
  isFollowLoading: false,
  // 分页相关状态
  page: 1,
  hasMore: true,
  isLoadingMore: false
}

// 获取帖子详情
export const fetchPostDetail = createAsyncThunk<PostDetailResponse, string>(
  'post/fetchPostDetail',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await getPostDetail(postId)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 获取帖子列表
export const fetchPostList = createAsyncThunk<
  PostListResponse,
  { page?: number; pageSize?: number; strategy?: string }
>(
  'post/fetchPostList',
  async ({ page = 1, pageSize = 10, strategy }, { rejectWithValue }) => {
    try {
      const response = await getHomePosts(page, pageSize, strategy)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 加载更多帖子
export const loadMorePosts = createAsyncThunk<
  PostListResponse,
  { page: number; pageSize?: number; strategy?: string }
>(
  'post/loadMorePosts',
  async ({ page, pageSize = 10, strategy }, { rejectWithValue }) => {
    try {
      const response = await getHomePosts(page, pageSize, strategy)
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 获取关注列表
export const fetchFollowingPosts = createAsyncThunk<
  PostListResponse,
  { page?: number; pageSize?: number }
>(
  'post/fetchFollowingPosts',
  async ({ page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await getFollowingPosts(page, pageSize)
      // 类型断言，确保返回类型与 PostListResponse 匹配
      return response as unknown as PostListResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// 加载更多关注帖子
export const loadMoreFollowingPosts = createAsyncThunk<
  PostListResponse,
  { page: number; pageSize?: number }
>(
  'post/loadMoreFollowingPosts',
  async ({ page, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await getFollowingPosts(page, pageSize)
      // 类型断言，确保返回类型与 PostListResponse 匹配
      return response as unknown as PostListResponse
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    resetPostState: (state: PostState) => {
      state.loading = false
      state.error = null
    },
    clearCurrentPost: (state: PostState) => {
      state.currentPost = null
    },
    updatePostStats: (
      state: PostState,
      action: PayloadAction<{
        postId: string
        stats: Partial<{
          like_count: number
          dislike_count: number
          collect_count: number
          is_collected?: boolean
          comment_count: number
          is_liked?: boolean
          is_disliked?: boolean
        }>
      }>
    ) => {
      const { postId, stats } = action.payload
      const stringPostId = String(postId)

      // 更新详情页数据
      if (
        state.currentPost &&
        String(state.currentPost.post_id) === stringPostId
      ) {
        state.currentPost = { ...state.currentPost, ...stats }
      }

      // 更新列表页数据
      state.postList = state.postList.map((post: PostItem) => {
        if (String(post.post_id) === stringPostId) {
          console.log('已同步更新首页列表中的点赞数，ID: ' + stringPostId)
          return { ...post, ...stats }
        }
        return post
      })
    },
    toggleFollow: (state: PostState, action: PayloadAction<string>) => {
      const authorId = action.payload

      // 检查当前帖子是否属于该作者，并且状态将变为已关注
      const currentPost = state.currentPost
      const willBeFollowed =
        currentPost &&
        currentPost.author_id === authorId &&
        !currentPost.is_followed

      // 更新列表页中的关注状态
      state.postList = state.postList.map((post: PostItem) => {
        if (post.author_id === authorId) {
          return { ...post, is_followed: !post.is_followed }
        }
        return post
      })

      // 更新详情页中的关注状态
      if (currentPost && currentPost.author_id === authorId) {
        state.currentPost = {
          ...currentPost,
          is_followed: !currentPost.is_followed
        }
      }

      // 如果状态变为已关注，且当前有帖子，自动将该帖子添加到关注列表
      if (willBeFollowed && currentPost) {
        // 确保content已被正确解析
        const post = parsePostContent(currentPost)

        // 检查关注列表中是否已存在该帖子，避免重复
        const existingIndex = state.followingPosts.findIndex(
          p => p.post_id === post.post_id
        )
        if (existingIndex === -1) {
          // 将帖子插入到关注列表首位
          state.followingPosts.unshift(post)
        }
      }
    },
    syncPostDetailToList: (state: PostState, action: PayloadAction<any>) => {
      const postId = String(action.payload.post_id)
      const index = state.postList.findIndex(p => String(p.post_id) === postId)
      if (index !== -1) {
        state.postList[index] = { ...state.postList[index], ...action.payload }
      }
    },
    addNewPost: (state: PostState, action: PayloadAction<PostItem>) => {
      // 确保content已被正确解析
      const newPost = { ...action.payload }
      if (newPost.content) {
        if (typeof newPost.content === 'string') {
          try {
            const parsedContent = JSON.parse(newPost.content) as ParsedContent
            if (parsedContent) {
              newPost.content = parsedContent
              newPost.images = parsedContent.images || newPost.images
            }
          } catch (parseError) {
            // 如果解析失败，保持原content不变
          }
        } else if (
          typeof newPost.content === 'object' &&
          (newPost.content as ParsedContent).text
        ) {
          // content已经是对象，直接使用
          newPost.images =
            (newPost.content as ParsedContent).images || newPost.images
        }
      }
      // 检查是否已存在，避免重复添加
      const existingPostIndex = state.postList.findIndex(
        p => p.post_id === newPost.post_id
      )
      if (existingPostIndex === -1) {
        // 将新帖子插入到列表首位
        state.postList.unshift(newPost)
      }
    },
    // 乐观更新：当关注作者时，将该作者的帖子插入到关注列表
    addAuthorPostToFollowing: (
      state: PostState,
      action: PayloadAction<PostItem>
    ) => {
      // 确保content已被正确解析
      const post = parsePostContent(action.payload)

      // 检查关注列表中是否已存在该帖子，避免重复
      const existingIndex = state.followingPosts.findIndex(
        p => p.post_id === post.post_id
      )
      if (existingIndex === -1) {
        // 为本地添加的帖子添加标记
        const postWithLocalMark = {
          ...post,
          __isLocalAdded: true
        }
        // 将帖子插入到关注列表首位
        state.followingPosts.unshift(postWithLocalMark)
      }
    },
    // 从关注列表中移除帖子
    removeAuthorPostFromFollowing: (
      state: PostState,
      action: PayloadAction<string>
    ) => {
      const postId = action.payload
      state.followingPosts = state.followingPosts.filter(
        post => post.post_id !== postId
      )
    }
  },
  extraReducers: (builder: any) => {
    builder
      // 获取帖子列表
      .addCase(fetchPostList.pending, (state: PostState) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPostList.fulfilled, (state: PostState, action: any) => {
        state.loading = false
        if (action.payload?.code === 0 || action.payload?.code === 200) {
          // 统一对 content 字段进行 JSON.parse 解析
          const parsedPostList =
            action.payload.data?.items?.map((post: PostItem) =>
              parsePostContent(post)
            ) || []
          state.postList = parsedPostList
          state.page = 1
          // 强制数据量判定：如果返回的数据量不满一页，说明后面没货了
          const pageSize = 10
          const finalHasMore =
            parsedPostList.length === pageSize &&
            (action.payload.data?.has_more ?? false)
          state.hasMore = finalHasMore
        } else {
          state.error = action.payload?.message || '未知错误'
        }
      })
      .addCase(fetchPostList.rejected, (state: PostState, action: any) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 加载更多帖子
      .addCase(loadMorePosts.pending, (state: PostState) => {
        state.isLoadingMore = true
        state.error = null
      })
      .addCase(loadMorePosts.fulfilled, (state: PostState, action: any) => {
        state.isLoadingMore = false
        if (action.payload?.code === 0 || action.payload?.code === 200) {
          // 统一对 content 字段进行 JSON.parse 解析
          const parsedPostList =
            action.payload.data?.items?.map((post: PostItem) =>
              parsePostContent(post)
            ) || []

          // 过滤重复数据
          const existingIds = new Set(
            state.postList.map((p: PostItem) => p.post_id)
          )
          const uniqueNewItems = parsedPostList.filter(
            (p: PostItem) => !existingIds.has(p.post_id)
          )

          if (uniqueNewItems.length > 0) {
            state.postList = [...state.postList, ...uniqueNewItems]
            state.page += 1
            // 强制数据量判定：如果返回的数据量不满一页，说明后面没货了
            const pageSize = 10
            // 针对 Mock 环境限流：增加页码上限
            const finalHasMore =
              uniqueNewItems.length === pageSize &&
              (action.payload.data?.has_more ?? false) &&
              state.page < 5
            state.hasMore = finalHasMore
          } else {
            state.hasMore = false
          }
        } else {
          state.error = action.payload?.message || '未知错误'
        }
      })
      .addCase(loadMorePosts.rejected, (state: PostState, action: any) => {
        state.isLoadingMore = false
        state.error = action.payload as string
      })
      // 获取帖子详情
      .addCase(fetchPostDetail.pending, (state: PostState) => {
        state.loading = true
        state.error = null
        // 清空旧的详情数据，防止“先看到上一条”的闪烁现象
        state.currentPost = null
      })
      .addCase(fetchPostDetail.fulfilled, (state: PostState, action: any) => {
        state.loading = false
        if (action.payload?.code === 0 || action.payload?.code === 200) {
          let postData = action.payload.data?.post
          if (postData) {
            // 检查本地是否已关注该作者
            const authorId = postData.author_id
            const existingPostInList = state.postList.find(
              p => p.author_id === authorId
            )
            const existingPostInFollowing = state.followingPosts.find(
              p => p.author_id === authorId
            )
            const isFollowedLocally =
              existingPostInList?.is_followed ||
              existingPostInFollowing?.is_followed ||
              false

            // 统一对 content 字段进行 JSON.parse 解析
            postData = parsePostContent(postData)

            // 确保接口返回的 is_followed: false 不会覆盖本地已关注的状态
            if (isFollowedLocally) {
              postData.is_followed = true
            }

            state.currentPost = postData
            // 同步详情页数据到首页列表
            const postId = String(postData.post_id)
            const index = state.postList.findIndex(
              p => String(p.post_id) === postId
            )
            if (index !== -1) {
              state.postList[index] = { ...state.postList[index], ...postData }
            }
          }
        } else {
          state.error = action.payload?.message || '未知错误'
        }
      })
      .addCase(fetchPostDetail.rejected, (state: PostState, action: any) => {
        state.loading = false
        state.error = action.payload as string
      })
      // 获取关注列表
      .addCase(fetchFollowingPosts.pending, (state: PostState) => {
        state.isFollowLoading = true
        state.error = null
      })
      .addCase(
        fetchFollowingPosts.fulfilled,
        (state: PostState, action: any) => {
          state.isFollowLoading = false
          if (action.payload?.code === 0 || action.payload?.code === 200) {
            // 统一对 content 字段进行 JSON.parse 解析
            const parsedPostList =
              action.payload.data?.items?.map((post: PostItem) =>
                parsePostContent(post)
              ) || []

            // 合并本地添加的帖子，确保关注的帖子不会丢失
            const existingIds = new Set(
              parsedPostList.map((p: PostItem) => p.post_id)
            )
            const localAddedPosts = state.followingPosts
              .filter((p: PostItem) => !existingIds.has(p.post_id))
              // 移除本地添加的标记
              .map((p: PostItem) => {
                const { __isLocalAdded, ...postWithoutLocalMark } = p
                return postWithoutLocalMark
              })

            // 合并并去重，保持本地添加的帖子在前面
            state.followingPosts = [...localAddedPosts, ...parsedPostList]
            state.followPage = 1
            state.followHasMore = action.payload.data?.has_more ?? false
          } else {
            state.error = action.payload?.message || '未知错误'
          }
        }
      )
      .addCase(
        fetchFollowingPosts.rejected,
        (state: PostState, action: any) => {
          state.isFollowLoading = false
          state.error = action.payload as string
        }
      )
      // 加载更多关注帖子
      .addCase(loadMoreFollowingPosts.pending, (state: PostState) => {
        state.isFollowLoading = true
        state.error = null
      })
      .addCase(
        loadMoreFollowingPosts.fulfilled,
        (state: PostState, action: any) => {
          state.isFollowLoading = false
          if (action.payload?.code === 0 || action.payload?.code === 200) {
            // 统一对 content 字段进行 JSON.parse 解析
            const parsedPostList =
              action.payload.data?.items?.map((post: PostItem) =>
                parsePostContent(post)
              ) || []

            // 过滤重复数据
            const existingIds = new Set(
              state.followingPosts.map((p: PostItem) => p.post_id)
            )
            const uniqueNewItems = parsedPostList.filter(
              (p: PostItem) => !existingIds.has(p.post_id)
            )

            if (uniqueNewItems.length > 0) {
              state.followingPosts = [
                ...state.followingPosts,
                ...uniqueNewItems
              ]
              state.followPage += 1
              state.followHasMore = action.payload.data?.has_more ?? false
            } else {
              state.followHasMore = false
            }
          } else {
            state.error = action.payload?.message || '未知错误'
          }
        }
      )
      .addCase(
        loadMoreFollowingPosts.rejected,
        (state: PostState, action: any) => {
          state.isFollowLoading = false
          state.error = action.payload as string
        }
      )
  }
})

export const {
  resetPostState,
  clearCurrentPost,
  updatePostStats,
  toggleFollow,
  syncPostDetailToList,
  addNewPost,
  addAuthorPostToFollowing,
  removeAuthorPostFromFollowing
} = postSlice.actions
export default postSlice.reducer
