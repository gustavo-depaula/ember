import type { MissalCalendar, Transfers } from '@ember/missal'

/** A civil date in the user's time zone, `YYYY-MM-DD`. Days end at local midnight. */
export type IsoDate = string

export type CardId = string

export type MonthDay = { month: number; day: number }

export type Season = 'advent' | 'christmas' | 'lent' | 'easter' | 'ordinary1' | 'ordinary2'

export type EmberSeason = 'advent' | 'lent' | 'pentecost' | 'september'

/**
 * Something the user did that can win a card. The app derives these from its
 * records (practice completions, plan-of-life ticks, book progress); which
 * practices count as Mass or as the Office, and when a novena is finished, is
 * decided there, not here. A `prayedDay` is a day kept with the morning
 * offering, the rosary and the examination of conscience, all three.
 */
export type Act = { date: IsoDate } & (
  | { kind: 'mass' | 'office' | 'prayedDay' }
  | { kind: 'novenaFinished'; novena: string }
  | { kind: 'emberDaysFinished'; ember: EmberSeason }
  | { kind: 'bookFinished'; book: string }
)

/** One scheduled day of a practice the user chose, and whether it was kept. */
export type Occurrence = { practice: string; date: IsoDate; kept: boolean }

/**
 * The OF calendar the cards follow: the reader's own, and every other region's
 * for the saints only it keeps, so Mass on a Brazilian saint's day gives that
 * card in the United States too.
 */
export type Calendar = {
  statics: MissalCalendar
  // The reader's national calendar; absent, the General Calendar.
  regions?: string[]
  // Where the reader's calendar keeps the solemnities that may move to a
  // Sunday; absent, the General Calendar's dates.
  transfers?: Transfers
}

/**
 * The cards that exist (have art). A card missing here is never given: a door
 * whose card isn't drawn yet gives nothing, or the liturgical fallback at Mass.
 */
export type Catalog = {
  /**
   * Saints and feasts. `celebration` links a card to its formulary ref; while
   * that ref is on the user's calendar the card comes only through Mass on the
   * celebration's date. Otherwise it comes through the Office, or a prayed
   * day, on `day`.
   */
  saints: { id: CardId; celebration?: string; day?: MonthDay }[]
  /** Parts of the Mass, liturgical objects and vestments. */
  liturgical: CardId[]
  seasons: Partial<Record<Season, { sunday?: CardId; weekday?: CardId }>>
  triduum?: CardId
  gaudete?: CardId
  laetare?: CardId
  emberDays: Partial<Record<EmberSeason, CardId>>
  /** Novena practice id → the card it is prayed to; several to pick from for a novena to several saints. */
  novenas: Record<string, CardId[]>
  /** Book id → its saint. */
  books: Record<string, CardId>
  /** Practice id → the saints behind it, in order. */
  lineages: Record<string, CardId[]>
  starters: CardId[]
}

/** A redeemed card, stored for good: what won it (`door`, on `won`) and the day it was opened. */
export type Copy = { grant: string; card: CardId; door: Door; won: IsoDate; date: IsoDate }

type GrantBase = {
  /** Stable, derived from the act: the same act always yields the same id. */
  id: string
  /** The day the card was won. */
  date: IsoDate
  /** The cards to pick from, in display order. A single entry means no choice. */
  choice: CardId[]
  /**
   * The card is drawn from `choice` at redeem instead of picked: Mass on a date
   * without a carded saint gives a liturgical card.
   */
  drawn?: true
  /** Grants sharing a group give different cards: the second starter isn't the first. */
  group?: string
  /** Last day to redeem it (inclusive). Absent: no window. */
  deadline?: IsoDate
}

/** A won card waiting to be redeemed, with what won it. */
export type Grant = GrantBase &
  (
    | { door: 'mass' | 'office' | 'prayedDay' | 'triduum' | 'gaudete' | 'laetare' | 'starter' }
    | { door: 'seasonSunday' | 'seasonWeekday'; season: Season }
    | { door: 'emberDays'; ember: EmberSeason }
    | { door: 'novena'; novena: string }
    | { door: 'lineage'; practice: string }
    | { door: 'book'; book: string }
  )

export type Door = Grant['door']

export type EngineInput = {
  acts: Act[]
  occurrences: Occurrence[]
  calendar: Calendar
  catalog: Catalog
  /** The day the app was first opened; the starter cards date from it. */
  firstOpened?: IsoDate
}
