export type TabooStatus = 'ok' | 'caution' | 'avoid' | 'unknown'

export interface TabooItem {
  id: string
  name: string
  description: string
  image: any
  tags: string[]
  status: {
    pregnant: TabooStatus
    baby: TabooStatus
    breastfeeding: TabooStatus
    postpartum: TabooStatus
  }
}

export const STATUS_CONFIG: Record<
  TabooStatus,
  { color: string; icon: string; bgColor: string }
> = {
  ok: { color: '#4CAF50', icon: 'check', bgColor: '#E8F5E9' },
  caution: { color: '#FF9800', icon: 'exclamation', bgColor: '#FFF3E0' },
  avoid: { color: '#F44336', icon: 'close', bgColor: '#FFEBEE' },
  unknown: { color: '#9E9E9E', icon: 'lock', bgColor: '#F5F5F5' }
}

export const CATEGORY_LABELS = {
  pregnant: '孕妇',
  baby: '婴儿',
  breastfeeding: '哺乳',
  postpartum: '月子'
}
