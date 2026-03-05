// 通用的选项类型
export interface Option {
  id: string
  name: string
}

export enum DiaperType {
  PEE = 'pee',
  POOP = 'poop',
  BOTH = 'both',
  DRY = 'dry'
}

export enum PeeColor {
  MILKY_WHITE = 'milky_white',
  PINK = 'pink',
  NORMAL = 'normal',
  YELLOW = 'yellow',
  RED = 'red',
  DARK_TEA = 'tea'
}

export enum PoopColor {
  DARK_GREEN = 'dark_green',
  GREEN = 'green',
  YELLOW = 'yellow',
  BROWN = 'orange',
  RED = 'red',
  BLACK = 'black',
  GREY_WHITE = 'gray_white'
}

export enum PoopConsistency {
  PASTE = 'paste',
  FOAM = 'foamy',
  MILK_CLOT = 'milky',
  FOOD_RESIDUE = 'food_residue',
  EGG_LIKE = 'egg_flower',
  WATERY = 'watery',
  SHEEP = 'sheep',
  BLOODY = 'bloody'
}

export interface DiaperItem {
  diaper_id: string
  baby_id: string
  diaper_type: Option
  change_time: number
  pee_color?: Option | null
  poop_color?: Option | null
  poop_consistency?: Option | null
  remark?: string
  summary_text?: string
}

export interface DiaperRecordRequest {
  diaper_type: string
  change_time: number
  pee_color?: string
  poop_color?: string
  poop_consistency?: string
  remark?: string
  summary_text?: string
}
