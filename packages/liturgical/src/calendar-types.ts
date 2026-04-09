// ============================================================
// LITURGICAL CALENDAR TYPES
// ============================================================

// ── Localization ──

type LocalizedText = {
  'en-US'?: string
  la?: string
  'pt-BR'?: string
}

// ── Date Modeling ──

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

type FixedDate = {
  type: 'fixed'
  month: Month
  day: number
}

type EasterRelativeDate = {
  type: 'easter_relative'
  offset: number
}

type AnchorRelativeDate = {
  type: 'anchor_relative'
  anchor: LiturgicalAnchor
  nthWeek?: number
  weekday?: DayOfWeek
  daysAfter?: number
}

type NthWeekdayOfMonth = {
  type: 'nth_weekday_of_month'
  month: Month
  weekday: DayOfWeek
  nth: number
}

type RelativeToFixedDate = {
  type: 'relative_to_fixed'
  referenceMonth: Month
  referenceDay: number
  weekday: DayOfWeek
  direction: 'after' | 'on_or_after' | 'before' | 'on_or_before' | 'nearest'
}

type LiturgicalDate =
  | FixedDate
  | EasterRelativeDate
  | AnchorRelativeDate
  | NthWeekdayOfMonth
  | RelativeToFixedDate

// ── Anchors ──

type LiturgicalAnchor =
  | 'easter'
  | 'pentecost'
  | 'ascension'
  | 'trinity_sunday'
  | 'corpus_christi'
  | 'sacred_heart'
  | 'advent_1'
  | 'advent_2'
  | 'advent_3'
  | 'advent_4'
  | 'lent_1'
  | 'lent_2'
  | 'lent_3'
  | 'lent_4'
  | 'lent_5'
  | 'palm_sunday'
  | 'holy_thursday'
  | 'good_friday'
  | 'holy_saturday'
  | 'septuagesima'
  | 'sexagesima'
  | 'quinquagesima'
  | 'ash_wednesday'
  | 'christ_the_king'
  | 'christmas'
  | 'epiphany'
  | 'baptism_of_the_lord'

// ── Ranks ──

type RankEF = 'I_class' | 'II_class' | 'III_class' | 'IV_class' | 'commemoration' | 'vigil'

type RankOF = 'solemnity' | 'feast' | 'memorial' | 'optional_memorial'

// ── Category ──

type LiturgicalCategory =
  | 'solemnity_temporal'
  | 'feast_of_the_lord'
  | 'blessed_virgin_mary'
  | 'apostle'
  | 'martyr'
  | 'pastor'
  | 'doctor_of_the_church'
  | 'virgin'
  | 'religious'
  | 'holy_man'
  | 'holy_woman'
  | 'angels'
  | 'dedication'
  | 'liturgical_season'
  | 'other'

// ── Jurisdiction Overrides ──

type JurisdictionOverride = {
  jurisdiction: string
  rankOF?: RankOF
  rankEF?: RankEF
  dateOF?: LiturgicalDate
  dateEF?: LiturgicalDate
  isProper?: boolean
  transferredToSunday?: boolean
  note?: string
}

// ── Entry ──

type LiturgicalEntry = {
  id: string
  name: LocalizedText
  category: LiturgicalCategory
  ef?: { rank: RankEF; date: LiturgicalDate }
  of?: { rank: RankOF; date: LiturgicalDate }
  overrides?: JurisdictionOverride[]
  description: LocalizedText
  canonizedYear?: number
  holyDayOfObligation?: boolean
}

// ── Resolved Output ──

type ResolvedCelebration = {
  entry: LiturgicalEntry
  date: Date
  rank: RankOF | RankEF
  form: 'of' | 'ef'
}

type DayCalendar = {
  date: Date
  celebrations: ResolvedCelebration[]
  principal: ResolvedCelebration | undefined
}

type CalendarOptions = {
  year: number
  form: 'of' | 'ef'
  entries: LiturgicalEntry[]
  jurisdiction?: string
}

// ── Exports ──

export type {
  AnchorRelativeDate,
  CalendarOptions,
  DayCalendar,
  DayOfWeek,
  EasterRelativeDate,
  FixedDate,
  JurisdictionOverride,
  LiturgicalAnchor,
  LiturgicalCategory,
  LiturgicalDate,
  LiturgicalEntry,
  LocalizedText,
  Month,
  NthWeekdayOfMonth,
  RankEF,
  RankOF,
  RelativeToFixedDate,
  ResolvedCelebration,
}
