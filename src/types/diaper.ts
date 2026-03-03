export enum DiaperType {
  PEE = 'pee',
  POOP = 'poop',
  BOTH = 'both',
  DRY = 'dry'
}

export enum PeeColor {
  YELLOW = 'yellow',
  TRANSPARENT = 'transparent',
  DARK_YELLOW = 'dark_yellow',
  OTHER = 'other'
}

export enum PoopColor {
  YELLOW = 'yellow',
  GREEN = 'green',
  BROWN = 'brown',
  OTHER = 'other'
}

export enum PoopConsistency {
  NORMAL = 'normal',
  PASTE = 'paste',
  WATERY = 'watery',
  HARD = 'hard',
  FOAM = 'foam'
}

export interface DiaperItem {
  diaper_id: string
  baby_id: string
  diaper_type: DiaperType
  change_time: number
  pee_color?: PeeColor
  poop_color?: PoopColor
  poop_consistency?: PoopConsistency
  remark?: string
  summary_text?: string
}

export interface DiaperRecordRequest {
  diaper_type: DiaperType
  change_time: number
  pee_color?: PeeColor
  poop_color?: PoopColor
  poop_consistency?: PoopConsistency
  remark?: string
  summary_text?: string
}
