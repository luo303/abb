/**
 * 聊天消息接口
 * @interface Message
 * @property {string} message - 消息内容文本
 * @property {'user' | 'assistant'} role - 消息发送者角色
 */
export interface Message {
  content: string //消息内容文本
  role: 'user' | 'assistant' //消息发送者角色
  images?: string[]
  timestamp: number
}

/**
 * 历史对话记录接口
 * @interface HistoryItem
 * @property {string} id - 对话记录唯一标识符
 * @property {string} title - 对话标题
 * @property {string} date - 对话日期字符串 (例如: "2024-05-20")
 */
export interface HistoryItem {
  session_id: string
  session_title: string
  session_date: string
}

/**
 * Redux Chat Store 状态接口
 * @interface ChatState
 * @property {Message[]} messages - 当前对话的消息列表
 * @property {HistoryItem[]} historyList - 历史对话列表
 * @property {string | null} currentConversationId - 当前选中的对话 ID (null 表示新对话)
 * @property {Record<string, Message[]>} conversations - 所有对话的消息记录 (key: conversationId, value: messages)
 */
export interface ChatState {
  messages: Message[]
  historyList: HistoryItem[]
  currentConversationId: string | null
  conversations: Record<string, Message[]>
  search_private: boolean
  search_public: boolean
}

//基本对话请求体
export interface aiReuset {
  session_id: string //前端生成的uuid，不可重复
  message: string
  images?: string[] //图片链接集合
  kb_config?: {
    enable: boolean //是否启用知识库，默认不开启
    search_private: boolean //是否查询私人空间，默认不开启
    search_public: boolean //是否查询公开空间，默认不开启
  }
}
