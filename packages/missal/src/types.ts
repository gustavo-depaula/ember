// The shapes of `content/missal/`, as written by `scripts/missal/build.py`.

export const langs = ['la', 'en-US', 'pt-BR', 'es', 'it', 'fr', 'de'] as const
export type Lang = (typeof langs)[number]

// Regional propers exist in one language only; the importer files that text
// under `*` so it shows whatever language is asked for.
export type TextKey = Lang | '*'
export type Localized = Partial<Record<TextKey, string>>

export type Mark =
  | 'rubric'
  | 'italic'
  | 'bold'
  | 'cross'
  | 'dropCap'
  | 'people'
  | 'litany'
  | 'link'
  | 'narrator'
  | 'christ'
  | 'crowd'
  | 'properReadings'
  // Words said only on certain days: `when:easter-octave`, `when:pentecost`…
  | `when:${string}`

export type Seg = string | { m: Mark; t: string; to?: string }
export type Line = Seg[]

export interface Block {
  // `p`, a heading level, or a rule.
  k: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'hr'
  lines: Line[]
  // Upstream's paragraph class, kept verbatim: `ReadingGospelTitle`,
  // `Areadingfrom`, `Summary`, `Incipit-oneline`, `TheWordoftheLord`…
  cls?: string
  // The scripture citation set against the right margin.
  cite?: string
}

export const parts = [
  'title',
  'entranceAntiphon',
  'gloria',
  'collect',
  'firstReading',
  'psalm',
  'secondReading',
  'sequence',
  'acclamation',
  'gospel',
  'creed',
  'beforeUniversalPrayer',
  'prayerOverOfferings',
  'preface',
  'eucharisticPrayer',
  'communionAntiphon',
  'postcommunion',
  'prayerOverPeople',
] as const
export type Part = (typeof parts)[number]

export type Cycle = 'A' | 'B' | 'C' | 'I' | 'II'

// One passage, the same in every language it exists in, tagged with where it
// sat in the upstream skeleton.
export interface Item {
  slot?: string
  part?: Part
  cycle?: Cycle
  role?: 'rubric' | 'people' | 'verse' | 'all'
  // One of several alternatives upstream shows one at a time.
  alt?: { group: string; id: string; label: 'or' | 'short' | 'long' }
  // Ids of the skeleton elements enclosing the item, outermost first.
  in?: string[]
  hidden?: boolean
  suggested?: boolean
  // Borrowed from this commons reading.
  from?: string
  ref?: string
  text?: Partial<Record<TextKey, Block[]>>
}

export interface Doc {
  id: string
  source: string
  items: Item[]
  title?: Localized
}

export type FormularyKind =
  | 'tempore'
  | 'sanctoral'
  | 'common'
  | 'votive'
  | 'various-needs'
  | 'for-the-dead'

export interface Formulary extends Doc {
  kind: FormularyKind
  // Number in the Table of Liturgical Days (Universal Norms 59). 66 is
  // upstream's code for "6 on a Sunday, 13 on a weekday".
  precedence?: number
  rankLabel?: Localized
  lectionary?: string
  prefaces?: string[]
  commons?: string[]
}

export interface Lectionary extends Doc {
  sequence?: { required: boolean }
}

export type LiturgicalColor = 'green' | 'white' | 'red' | 'violet' | 'rose' | 'black'

export interface SanctoralEntry {
  id: string
  month: number
  day: number
  // Absent: the General Roman Calendar.
  regions?: string[]
}

export interface MovableEntry {
  id: string
  // Days after Easter Sunday.
  easter?: number
  // [month, weekday (0 = Sunday), nth occurrence].
  weekdayOfMonth?: [number, number, number]
  regions?: string[]
}

export interface FormularyIndexEntry {
  kind: FormularyKind
  title: Localized
  precedence?: number
  lectionary?: string
  color?: LiturgicalColor
}

// What the calendar needs, in one blob: no formulary is loaded to resolve a day.
export interface MissalCalendar {
  sanctoral: SanctoralEntry[]
  movable: MovableEntry[]
  formularies: Record<string, FormularyIndexEntry>
  lectionary: string[]
}
