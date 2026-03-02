export interface FollowingPost {
  post_id: string
  author_name: string
  author_avatar: string
  title: string
  content: {
    text: string
    images: string[]
  }
}

export interface FollowStatus {
  code: number
  message: string
  data: {
    message: string
  }
}
