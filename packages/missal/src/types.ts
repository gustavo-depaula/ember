// The shapes of `content/missal/`.

export const langs = ['la', 'en-US', 'pt-BR', 'es', 'it', 'fr', 'de'] as const
export type Lang = (typeof langs)[number]

// `*` is text that is the same whatever language is asked for: a regional
// proper, which exists in one language only, and the few notes set once for
// all languages.
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

// A named stretch of a rite, for the passages the app treats specially.
export type Tag =
  // In the Order of Mass
  | 'sprinkling'
  | 'sprinkling.outside-easter'
  | 'sprinkling.easter'
  | 'penitential-act.1'
  | 'penitential-act.2'
  | 'penitential-act.3'
  | 'gloria'
  | 'creed.nicene'
  | 'creed.apostles'
  | 'universal-prayer.index'
  // Where the Liturgy of the Eucharist begins.
  | 'liturgy-of-the-eucharist'
  | 'bishop-blessing'
  // In a Eucharistic Prayer: the preface it carries as its own.
  | 'preface'
  // In the Easter Vigil's lectionary entry: one of its readings.
  | `reading.${number}`
  | 'reading.gospel'

// One passage, the same in every language it exists in, tagged with where it
// stands in its rite.
export interface Item {
  part?: Part
  cycle?: Cycle
  role?: 'rubric' | 'people' | 'verse' | 'all'
  // One of several texts of which one is used. Items of a document that share
  // a `group` are alternatives; those that share an `option` go together.
  alt?: { group: number; option: number; label: 'or' | 'short' | 'long' }
  // The named stretches of a rite this passage belongs to.
  tags?: Tag[]
  // Borrowed from this reading of a common (a lectionary id).
  from?: string
  // A position, not a passage: in the Order of Mass, where a proper part of
  // the day goes; in a formulary, where its readings stand.
  mark?: Part | 'readings'
  // For a `readings` mark: the tag of the one reading that stands here (the
  // Easter Vigil places each of its nine). Absent, the mark stands for all.
  at?: Tag
  // Said only on these days, or on every day but these: the Roman Canon's
  // proper Communicantes, and the ordinary one they replace. The names are the
  // conditions `assembleMass` reports for a day.
  when?: string[]
  unless?: string[]
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
  // Its readings must be taken with it, even at the rank of a memorial.
  properReadings?: boolean
  // The line under the title: a celebration's rank as the Missal words it, or
  // which Mass of a common this is.
  subtitle?: Localized
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
  // Number in the Table of Liturgical Days (Universal Norms 59); lower wins.
  precedence?: number
  // Set on a Sunday formulary that the weekdays after it also use: their number.
  weekdayPrecedence?: number
  // The lectionary entry read with it, when that is not its own id.
  lectionary?: string
  color?: LiturgicalColor
}

// What the calendar needs, in one blob: no formulary is loaded to resolve a
// day. A celebration's precedence, colour and lectionary entry are stated here
// and nowhere else; only its title is also in its formulary.
export interface MissalCalendar {
  sanctoral: SanctoralEntry[]
  movable: MovableEntry[]
  formularies: Record<string, FormularyIndexEntry>
  lectionary: Record<string, { title: Localized }>
}
