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
  DARK_TEA = 'dark_tea'
}

export enum PoopColor {
  DARK_GREEN = 'dark_green',
  GREEN = 'green',
  YELLOW = 'yellow',
  BROWN = 'brown',
  RED = 'red',
  BLACK = 'black',
  GREY_WHITE = 'grey_white'
}

export enum PoopConsistency {
  NORMAL = 'normal',
  PASTE = 'paste',
  FOAM = 'foam',
  MILK_CLOT = 'milk_clot',
  FOOD_RESIDUE = 'food_residue',
  EGG_LIKE = 'egg_like',
  WATERY = 'watery',
  SHEEP_DUNG = 'sheep_dung',
  BLOODY = 'bloody'
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
