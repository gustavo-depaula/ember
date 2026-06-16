import type { Localized, Rank, Season } from '@ember/missal-schema'

export type CelebrationKind = 'temporal' | 'sanctoral'

/** How a celebration is observed when it isn't the principal Mass. */
export type CelebrationMode = 'full' | 'commemoration'

export interface OfCelebration {
  /** Formulary ref (also the corpus `mass-formulary/<ref>` id). */
  ref: string
  kind: CelebrationKind
  rank: Rank
  /** GIRM Table position; lower = higher precedence. */
  precedence: number
  mode: CelebrationMode
  title?: Localized
  /** Sanctoral structure (vigil-mass etc.); temporal celebrations carry it too. */
  structure?: string
}

export interface OfDay {
  date: Date
  season: Season | undefined
  /** The day's named temporal day (`christmas`, `ascension`, …), when it has one. */
  specialDay: string | undefined
  /** Sunday lectionary cycle for the liturgical year. */
  cycle: 'A' | 'B' | 'C'
  /** Weekday (ferial) lectionary cycle. */
  weekdayCycle: 'I' | 'II'
  /**
   * The day's temporal formulary ref, when there is one (absent Dec 26-28 where
   * the sanctoral takes over). Memorials draw their ferial readings from here.
   */
  temporalRef?: string
  /** Every celebration the day offers, ordered — principal first. */
  celebrations: OfCelebration[]
}
