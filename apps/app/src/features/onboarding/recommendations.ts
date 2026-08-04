// Maps the light profiler answers to a recommended starter template and a
// default formation reading. Everyone can override — these only set sensible
// defaults so the first screen isn't a blank catalog.

export type PrayerStage = 'new' | 'some' | 'experienced'
export type FormationStage = 'new' | 'some' | 'formed'
export type TimeAvailable = 'short' | 'medium' | 'long'

export type ProfilerAnswers = {
  prayerStage?: PrayerStage
  formationStage?: FormationStage
  time?: TimeAvailable
}

export type TemplateRecommendation = {
  /** Bare template id pre-selected for the user (always offered; never forced). */
  primary: string
  /** A few other bare template ids worth a look, in priority order. */
  alsoConsider: string[]
}

const beginner = 'beginner-minimum'

/**
 * The beginner's minimum is the default for everyone new; the more a soul has an
 * established prayer life (and time), the richer the primary suggestion. The full
 * template browser is always one tap away regardless.
 */
export function recommendTemplates(a: ProfilerAnswers): TemplateRecommendation {
  const stage = a.prayerStage ?? 'new'

  if (stage === 'new') {
    return { primary: beginner, alsoConsider: ['salesian', 'little-way'] }
  }

  if (stage === 'some') {
    return {
      primary: 'salesian',
      alsoConsider: [beginner, 'little-way', a.time === 'long' ? 'ignatian' : 'sacred-heart'],
    }
  }

  // experienced
  const rich =
    a.time === 'long'
      ? ['opus-dei', 'carmelite', 'ignatian']
      : ['ignatian', 'sacred-heart', 'salesian']
  return { primary: rich[0], alsoConsider: [beginner, ...rich.slice(1)] }
}

// The formation reading options. Morrow + Compendium are real day-by-day programs;
// the catechisms are plain books (read at your own pace); the CCC is its own reader.
export type FormationOptionId =
  | 'catechetical-formation'
  | 'compendium'
  | 'ccc'
  | 'trent-catechism'
  | 'pius-x-catechism'
  | 'pius-x-greater-catechism'

export type FormationOption =
  // Seeded-disabled program practice — enroll = enable its slot.
  | { id: FormationOptionId; kind: 'program-enroll'; practiceId: string }
  // Program practice with no seeded slot — enroll = create practice + slot.
  | { id: FormationOptionId; kind: 'program-create'; practiceId: string }
  // Plain book — pin for offline; no day-by-day plan yet.
  | { id: FormationOptionId; kind: 'book'; bookId: string }
  // The Catechism reader — deep-link, no plan.
  | { id: FormationOptionId; kind: 'ccc' }

export const formationOptions: FormationOption[] = [
  { id: 'catechetical-formation', kind: 'program-enroll', practiceId: 'catechetical-formation' },
  { id: 'compendium', kind: 'program-create', practiceId: 'compendium' },
  { id: 'ccc', kind: 'ccc' },
  { id: 'pius-x-catechism', kind: 'book', bookId: 'book/pius-x-catechism' },
  { id: 'pius-x-greater-catechism', kind: 'book', bookId: 'book/pius-x-greater-catechism' },
  { id: 'trent-catechism', kind: 'book', bookId: 'book/trent-catechism' },
]

/** The default-nudged formation reading. Morrow for beginners; Compendium once formed. */
export function recommendFormation(a: ProfilerAnswers): FormationOptionId {
  if (a.formationStage === 'formed') return 'compendium'
  return 'catechetical-formation'
}
