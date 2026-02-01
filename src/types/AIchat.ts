/**
 * 聊天消息接口
 * @interface Message
 * @property {string} id - 消息唯一标识符
 * @property {string} text - 消息内容文本
 * @property {boolean} isUser - 是否为用户发送的消息 (true: 用户, false: AI)
 */
export interface Message {
  title?: string //可选，AI根据用户第一次询问的信息返回标题
  content: string //消息内容文本
  isUser: boolean //是否为用户发送的消息 (true: 用户, false: AI)
}

/**
 * 历史对话记录接口
 * @interface HistoryItem
 * @property {string} id - 对话记录唯一标识符
 * @property {string} title - 对话标题
 * @property {string} date - 对话日期字符串 (例如: "2024-05-20")
 */
export interface HistoryItem {
  conversation_id: string
  conversation_title: string
  conversation_date: string
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
}
