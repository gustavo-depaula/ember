// The shapes of `content/missal/`, as written by `scripts/missal/build.py`.

export const langs = ['la', 'en-US', 'pt-BR', 'es', 'it', 'fr', 'de'] as const
export type Lang = (typeof langs)[number]

// `*` is text that is the same whatever language is asked for: a regional
// proper, which exists in one language only, and the few notes upstream sets
// once for all languages.
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
  // A pointer to another document of the missal; `to` is its id.
  | 'link'
  // The voices of the Passion.
  | 'narrator'
  | 'christ'
  | 'crowd'
  // Words said only on certain days: `when:easter-octave`, `when:pentecost`…
  | `when:${string}`

// A run of text: plain, or marked. Keys are short because the corpus holds
// hundreds of thousands of these.
export type Seg = string | { m: Mark; t: string; to?: string }
export type Line = Seg[]

export interface Block {
  // A paragraph, a heading level, or a rule.
  k: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'hr'
  lines: Line[]
  // The furniture around a reading: its title ("First Reading"), the one-line
  // summary, the announcement ("A reading from…") and the closing acclamation.
  role?: 'title' | 'summary' | 'announcement' | 'conclusion'
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
// stands in its rite.
export interface Item {
  // Upstream's slot number, kept to trace a passage back to its source.
  slot?: string
  part?: Part
  cycle?: Cycle
  role?: 'rubric' | 'people' | 'verse' | 'all'
  // One of several texts of which one is used. Items of a document that share
  // a `group` are alternatives; those that share an `option` go together.
  alt?: { group: number; option: number; label: 'or' | 'short' | 'long' }
  // The named stretches of a rite this passage belongs to: `penitential-act.2`,
  // `creed.nicene`, `sprinkling`, `reading.3`… The list is `sections` in
  // `scripts/missal/ids.py`.
  tags?: string[]
  // Borrowed from this reading of a common.
  from?: string
  // A position, not a passage: in the Order of Mass, where a proper part of
  // the day goes; in a formulary, where its readings stand.
  mark?: Part | 'readings'
  // For a `readings` mark: the tag of the one reading that stands here (the
  // Easter Vigil places each of its nine). Absent, the mark stands for all.
  at?: string
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
  // Number in the Table of Liturgical Days (Universal Norms 59); lower wins.
  precedence?: number
  // Set on a Sunday formulary that the weekdays after it also use: their number.
  weekdayPrecedence?: number
  // Its readings must be taken with it, even at the rank of a memorial.
  properReadings?: boolean
  // The line under the title: a celebration's rank as the Missal words it, or
  // which Mass of a common this is.
  subtitle?: Localized
  lectionary?: string
  prefaces?: string[]
  commons?: string[]
}

export interface Lectionary extends Doc {
  sequence?: { required: boolean }
  properReadings?: boolean
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
  weekdayPrecedence?: number
  lectionary?: string
  color?: LiturgicalColor
}

// What the calendar needs, in one blob: no formulary is loaded to resolve a day.
export interface MissalCalendar {
  sanctoral: SanctoralEntry[]
  movable: MovableEntry[]
  formularies: Record<string, FormularyIndexEntry>
  lectionary: Record<string, { title: Localized }>
}
