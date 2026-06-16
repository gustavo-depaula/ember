// ============================================================
// LITURGICAL CALENDAR TYPES
// ============================================================

// ── Localization ──

type LocalizedText = {
  'en-US'?: string
  la?: string
  'pt-BR'?: string
}

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

// ── Entry ──
//
// A celebration as surfaced on the display calendar. The OF/EF year builders
// (`@ember/mass`'s buildOfYearCalendar / the app's buildDoYearCalendar) emit
// these as `ResolvedCelebration.entry`; only `id`/`name`/`category` are always
// set, with `description`/`holyDayOfObligation` populated when known.

type LiturgicalEntry = {
  id: string
  name: LocalizedText
  category: LiturgicalCategory
  description: LocalizedText
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

// ── Exports ──

export type {
  DayCalendar,
  LiturgicalAnchor,
  LiturgicalCategory,
  LiturgicalEntry,
  LocalizedText,
  RankEF,
  RankOF,
  ResolvedCelebration,
}
