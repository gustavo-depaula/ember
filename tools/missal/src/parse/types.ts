/**
 * Parse-stage types: a faithful structural read of the upstream HTML
 * (padre/hijo alignment + estructura slots), before any domain reshaping.
 * The enrich stage consumes these and produces @ember/missal-schema shapes.
 */

export const sourceLangs = ['latin', 'cast', 'engl', 'port', 'ital', 'fran', 'germ'] as const
export type SourceLang = (typeof sourceLangs)[number]

export const alignedCategories = [
  'ordinario',
  'tiempos',
  'santos',
  'comunes_votivas',
  'lecturas',
  'prefacios',
  'plegarias_euc',
] as const
export type Category = (typeof alignedCategories)[number]

/** Inline span classes the upstream uses, mapped to semantic segment kinds. */
export type RawSegment =
  | { type: 'text'; value: string }
  | { type: 'break' }
  | { type: 'paragraph_start' }
  | { type: 'paragraph_end' }
  | { type: 'heading'; level: number; text: string }
  | { type: RawInlineType; text: string }

export type RawInlineType =
  | 'italic'
  | 'bold'
  | 'rubric'
  | 'capital'
  | 'cross'
  | 'reference'
  | 'people'
  | 'reading_title'
  | 'reading_summary'
  | 'reading_from'
  | 'reading_incipit'
  | 'reading_acclamation'
  | 'verse'
  | 'psalm_verse'

/** One hijo_N block from a per-language HTML file. */
export interface RawBlock {
  n: number
  text: string
  segments: RawSegment[]
}

export type CycleClass = 'cicloA' | 'cicloB' | 'cicloC' | 'cicloI' | 'cicloII'

export const slotTypes = [
  'x_titulo',
  'x_ant_ent',
  'x_acto_penit',
  'x_gloria',
  'x_colecta',
  'x_prim_lect',
  'x_salmo',
  'x_seg_lect',
  'x_aleluya',
  'x_evangelio',
  'x_credo',
  'x_or_ofrend',
  'x_prefacio',
  'x_ant_com',
  'x_post_com',
  'x_or_pueblo',
] as const
export type SlotType = (typeof slotTypes)[number] | 'generic'

export interface SlotGroup {
  group: string
  padre: number
}

export type StructPart =
  | {
      kind: 'slot'
      type: SlotType
      id?: string
      padres: number[]
      groups: SlotGroup[]
      classes?: string[]
      padreClasses?: Record<string, string[]>
    }
  | { kind: 'cycle_start'; cycle: CycleClass }
  | { kind: 'cycle_end'; cycle: CycleClass }

export interface StructDay {
  id?: string
  languages: SourceLang[]
  parts: StructPart[]
}

/** Merged per-day payload: estructura slots filled with per-language content. */
export interface DayItem {
  role: string // 'main' or an agrupado group name (ant/post/ante…)
  padre: number
  content: Partial<Record<SourceLang, { text: string; segments: RawSegment[] }>>
}

export type DayPart =
  | {
      kind: 'slot'
      type: SlotType
      id?: string
      classes?: string[]
      padreClasses?: Record<string, string[]>
      items: DayItem[]
    }
  | { kind: 'cycle_start'; cycle: CycleClass }
  | { kind: 'cycle_end'; cycle: CycleClass }

export interface ParsedDay {
  id?: string
  category: Category
  basename: string
  estructuraLanguages: SourceLang[]
  languagesWithContent: SourceLang[]
  parts: DayPart[]
}

export interface ParsedFile {
  category: Category
  basename: string
  languages: SourceLang[]
  blockCounts: Partial<Record<SourceLang, number>>
  hasStructure: boolean
  days: ParsedDay[]
}

export interface ParsedCorpus {
  files: ParsedFile[]
}
