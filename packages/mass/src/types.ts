/**
 * A formulary is one ember-extra Mass JSON file. Source = which liturgical
 * "book" of the missal it lives in (proper of time / proper of saints / etc.).
 * The remaining fields are the proper sections themselves (entranceAntiphon,
 * collect, readings, preface, postcommunion, parts, ...) — not enumerated
 * here because we treat the slot data opaquely; the engine's choice-rich-text
 * primitive walks the typed segments at render time.
 */
export type FormularySource = 'tempore' | 'sanctoral' | 'common' | 'ritual' | 'votive'

export type Formulary = {
  id: string
  source: FormularySource
  scope?: string
  rite?: RiteType
  rank?: RankType
  // Derived at load time from rank/season/id — true on days the Gloria
  // is recited (solemnities, feasts, Sundays outside Advent/Lent, Holy
  // Thursday, Easter Vigil). Bound by the flow as
  // `celebration.primary.includeGloria` to gate the Gloria collapsible's
  // default-open state.
  includeGloria?: boolean
  // Plus all ember-extra Mass fields (entranceAntiphon, collect, readings, ...)
  [field: string]: unknown
}

export type RiteType =
  | 'mass'
  | 'easter-vigil'
  | 'celebration-of-the-passion'
  | 'lords-supper'
  | 'chrism-mass'
  | 'mass-with-procession'

export type RankType = 'solemnity' | 'feast' | 'memorial' | 'optional-memorial'

/**
 * A celebration is one liturgy that may be prayed today. Most days have one
 * celebration; Holy Thursday has two (chrism + lords-supper); Christmas has
 * four (vigil/midnight/dawn/day); memorial days have two (tempore + saint),
 * regional sanctoral overlap surfaces multiple sanctoral entries.
 *
 * `primary` is the formulary used as the default for every variable slot.
 * `alternates` are other formularies whose slots can be substituted in via
 * the per-slot picker (e.g. saint's collect with the day's readings).
 */
export type Celebration = {
  id: string
  title: { 'en-US'?: string; 'pt-BR'?: string; la?: string }
  rite: RiteType
  rank: RankType | null
  primary: Formulary
  alternates: Formulary[]
}

/**
 * The Order of Mass parts that don't vary by day (Kyrie, Gloria, Credo,
 * Sanctus, Agnus Dei, Mystery of Faith, etc.). One per language.
 */
export type OrdinaryParts = Record<string, unknown>

export type CycleId = 'A' | 'B' | 'C' | 'I' | 'II' | 'default'

export type DayLiturgies = {
  celebrations: Celebration[]
  ordinary: OrdinaryParts
  cycle: CycleId
}
