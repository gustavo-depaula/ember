import { format } from 'date-fns'

import { getDb } from './client'
import type { Frequency, Tier, TimeBlock } from './schema'

type PracticeSeed = {
  id: string
  name: string
  icon: string
  sortOrder: number
  tier: Tier
  timeBlock: TimeBlock
  frequency: Frequency
  frequencyDays: number[]
  enabled: boolean
  description: string
  manifestId: string | null
}

const builtinPractices: PracticeSeed[] = [
  // Essential — enabled by default
  {
    id: 'morning-offering',
    name: 'Morning Offering',
    icon: 'sunrise',
    sortOrder: 1,
    tier: 'essential',
    timeBlock: 'morning',
    frequency: 'daily',
    frequencyDays: [],
    enabled: true,
    description: "Offering the day's work and sufferings to God",
    manifestId: 'morning-offering',
  },
  {
    id: 'mental-prayer',
    name: 'Mental Prayer',
    icon: 'prayer',
    sortOrder: 2,
    tier: 'essential',
    timeBlock: 'morning',
    frequency: 'daily',
    frequencyDays: [],
    enabled: true,
    description: '15-30 min of silent prayer or meditation on Scripture',
    manifestId: null,
  },
  {
    id: 'holy-mass',
    name: 'Holy Mass',
    icon: 'mass',
    sortOrder: 3,
    tier: 'essential',
    timeBlock: 'morning',
    frequency: 'weekly',
    frequencyDays: [0], // Sunday
    enabled: true,
    description: 'Attendance at Mass',
    manifestId: 'mass',
  },
  {
    id: 'rosary',
    name: 'Rosary',
    icon: 'rosary',
    sortOrder: 4,
    tier: 'essential',
    timeBlock: 'daytime',
    frequency: 'daily',
    frequencyDays: [],
    enabled: true,
    description: 'Five decades of the Rosary',
    manifestId: 'rosary',
  },
  {
    id: 'examination-conscience',
    name: 'Examination of Conscience',
    icon: 'candle',
    sortOrder: 5,
    tier: 'essential',
    timeBlock: 'evening',
    frequency: 'daily',
    frequencyDays: [],
    enabled: true,
    description: "Brief review of the day's actions and failings",
    manifestId: null,
  },
  {
    id: 'night-prayer',
    name: 'Night Prayer',
    icon: 'moon',
    sortOrder: 6,
    tier: 'essential',
    timeBlock: 'evening',
    frequency: 'daily',
    frequencyDays: [],
    enabled: true,
    description: 'Brief prayer before sleep',
    manifestId: null,
  },

  // Ideal — enabled by default
  {
    id: 'angelus',
    name: 'Angelus',
    icon: 'bell',
    sortOrder: 7,
    tier: 'ideal',
    timeBlock: 'daytime',
    frequency: 'daily',
    frequencyDays: [],
    enabled: true,
    description: 'Traditional prayer recited at noon',
    manifestId: 'angelus',
  },
  {
    id: 'spiritual-reading',
    name: 'Spiritual Reading',
    icon: 'reading',
    sortOrder: 8,
    tier: 'ideal',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: true,
    description: 'Reading from spiritual classics, saints, theology',
    manifestId: null,
  },
  {
    id: 'confession',
    name: 'Confession',
    icon: 'confession',
    sortOrder: 9,
    tier: 'ideal',
    timeBlock: 'flexible',
    frequency: 'weekly',
    frequencyDays: [6], // Saturday
    enabled: false,
    description: 'Sacrament of Reconciliation',
    manifestId: null,
  },
  {
    id: 'blessed-sacrament',
    name: 'Visit to Blessed Sacrament',
    icon: 'monstrance',
    sortOrder: 10,
    tier: 'ideal',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Time spent before the Blessed Sacrament',
    manifestId: null,
  },

  // Extra — disabled by default
  {
    id: 'divine-mercy',
    name: 'Divine Mercy Chaplet',
    icon: 'mercy',
    sortOrder: 11,
    tier: 'extra',
    timeBlock: 'daytime',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Chaplet of Divine Mercy at 3 PM',
    manifestId: 'divine-mercy',
  },
  {
    id: 'stations-cross',
    name: 'Stations of the Cross',
    icon: 'cross',
    sortOrder: 12,
    tier: 'extra',
    timeBlock: 'flexible',
    frequency: 'weekly',
    frequencyDays: [5], // Friday
    enabled: false,
    description: 'Meditations on the Passion of Christ',
    manifestId: 'stations-cross',
  },
  {
    id: 'lectio-divina',
    name: 'Lectio Divina',
    icon: 'scroll',
    sortOrder: 13,
    tier: 'extra',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Prayerful reading and meditation on Scripture',
    manifestId: null,
  },
  {
    id: 'guardian-angel',
    name: 'Guardian Angel Prayer',
    icon: 'angel',
    sortOrder: 14,
    tier: 'extra',
    timeBlock: 'morning',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Prayer to your Guardian Angel',
    manifestId: 'guardian-angel',
  },
  {
    id: 'memorare',
    name: 'Memorare',
    icon: 'mary',
    sortOrder: 15,
    tier: 'extra',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Traditional prayer to the Blessed Virgin Mary',
    manifestId: 'memorare',
  },
  {
    id: 'three-oclock',
    name: "Three O'Clock Prayer",
    icon: 'clock',
    sortOrder: 16,
    tier: 'extra',
    timeBlock: 'daytime',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Brief prayer at the Hour of Mercy',
    manifestId: null,
  },

  {
    id: 'divine-office',
    name: 'Divine Office',
    icon: 'prayer',
    sortOrder: 17,
    tier: 'essential',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Three daily hours with lectio continua through the Bible and Catechism',
    manifestId: 'divine-office',
  },

  {
    id: 'little-office-bvm',
    name: 'Little Office of the BVM',
    icon: 'mary',
    sortOrder: 18,
    tier: 'extra',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'A shortened Divine Office dedicated to the Blessed Virgin Mary',
    manifestId: 'little-office-bvm',
  },

  // Eastern Catholic practices — disabled by default
  {
    id: 'jesus-prayer',
    name: 'Jesus Prayer',
    icon: 'rosary',
    sortOrder: 19,
    tier: 'essential',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner',
    manifestId: null,
  },
  {
    id: 'akathist',
    name: 'Akathist Hymn',
    icon: 'scroll',
    sortOrder: 20,
    tier: 'ideal',
    timeBlock: 'flexible',
    frequency: 'weekly',
    frequencyDays: [6], // Saturday
    enabled: false,
    description: 'Standing hymn of praise to Christ or the Theotokos',
    manifestId: null,
  },
  {
    id: 'trisagion',
    name: 'Trisagion Prayers',
    icon: 'candle',
    sortOrder: 21,
    tier: 'ideal',
    timeBlock: 'morning',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Holy God, Holy Mighty, Holy Immortal, have mercy on us',
    manifestId: null,
  },
  {
    id: 'paraklesis',
    name: 'Paraklesis',
    icon: 'mary',
    sortOrder: 22,
    tier: 'extra',
    timeBlock: 'flexible',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Supplicatory canon to the Theotokos',
    manifestId: null,
  },
  {
    id: 'prostrations',
    name: 'Prostrations',
    icon: 'prayer',
    sortOrder: 23,
    tier: 'extra',
    timeBlock: 'morning',
    frequency: 'daily',
    frequencyDays: [],
    enabled: false,
    description: 'Prayer with metanias (bows)',
    manifestId: null,
  },
]

const practiceIcons: Record<string, string> = {
  sunrise: '\u{1F305}',
  prayer: '\u{1F64F}',
  mass: '\u26EA',
  reading: '\u{1F4D6}',
  bell: '\u{1F514}',
  rosary: '\u{1F4FF}',
  candle: '\u{1F56F}',
  moon: '\u{1F319}',
  confession: '\u{1F54A}',
  monstrance: '\u2728',
  mercy: '\u{1F9E1}',
  cross: '\u271D',
  scroll: '\u{1F4DC}',
  angel: '\u{1F47C}',
  mary: '\u{1F490}',
  clock: '\u{1F552}',
}

export function getPracticeIcon(key: string): string {
  return practiceIcons[key] ?? key
}

export const availableIconKeys = Object.keys(practiceIcons)

export async function seedPractices() {
  const db = getDb()
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) as total FROM practices',
  )
  if (result && result.total > 0) {
    // Update existing practices with new columns (idempotent)
    await backfillBuiltinPractices()
    return
  }

  await db.withTransactionAsync(async () => {
    for (const p of builtinPractices) {
      await db.runAsync(
        `INSERT INTO practices (id, name, icon, frequency, enabled, sort_order, tier, time_block, frequency_days, is_builtin, description, manifest_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          p.id,
          p.name,
          p.icon,
          p.frequency,
          p.enabled ? 1 : 0,
          p.sortOrder,
          p.tier,
          p.timeBlock,
          JSON.stringify(p.frequencyDays),
          p.description,
          p.manifestId,
        ],
      )
    }
  })
}

async function backfillBuiltinPractices() {
  const db = getDb()

  await db.withTransactionAsync(async () => {
    for (const p of builtinPractices) {
      await db.runAsync(
        `INSERT INTO practices (id, name, icon, frequency, enabled, sort_order, tier, time_block, frequency_days, is_builtin, description, manifest_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           tier = excluded.tier,
           time_block = excluded.time_block,
           frequency_days = excluded.frequency_days,
           is_builtin = 1,
           description = CASE WHEN description = '' THEN excluded.description ELSE description END,
           manifest_id = excluded.manifest_id`,
        [
          p.id,
          p.name,
          p.icon,
          p.frequency,
          p.enabled ? 1 : 0,
          p.sortOrder,
          p.tier,
          p.timeBlock,
          JSON.stringify(p.frequencyDays),
          p.description,
          p.manifestId,
        ],
      )
    }
  })
}

const defaultReadings = [
  { type: 'ot', book: 'genesis', chapter: 1 },
  { type: 'nt', book: 'matthew', chapter: 1 },
  { type: 'catechism', book: 'ccc', chapter: 1 },
] as const

const defaultPracticeTracks = [
  { track: 'ot-readings', practiceId: 'divine-office' },
  { track: 'nt-readings', practiceId: 'divine-office' },
  { track: 'ccc-readings', practiceId: 'divine-office' },
] as const

export async function seedReadingProgress() {
  const db = getDb()
  const today = format(new Date(), 'yyyy-MM-dd')

  // Seed legacy reading_progress (still needed during transition)
  const legacyResult = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) as total FROM reading_progress',
  )
  if (!legacyResult?.total) {
    for (const row of defaultReadings) {
      await db.runAsync(
        'INSERT INTO reading_progress (type, current_book, current_chapter, start_date) VALUES (?, ?, ?, ?)',
        [row.type, row.book, row.chapter, today],
      )
    }
  }

  // Seed legacy reading_tracks (migration copies existing data; this covers fresh installs)
  const tracksResult = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) as total FROM reading_tracks',
  )
  if (!tracksResult?.total) {
    for (const row of defaultReadings) {
      await db.runAsync(
        'INSERT INTO reading_tracks (id, type, current_book, current_chapter, start_date) VALUES (?, ?, ?, ?, ?)',
        [`default-${row.type}`, row.type, row.book, row.chapter, today],
      )
    }
  }

  // Seed practice reading tracks (new system)
  for (const row of defaultPracticeTracks) {
    await db.runAsync(
      'INSERT OR IGNORE INTO practice_reading_tracks (id, practice_id, track, current_index, start_date) VALUES (?, ?, ?, 0, ?)',
      [`${row.practiceId}/${row.track}`, row.practiceId, row.track, today],
    )
  }
}
