import { format } from 'date-fns'

import { getAllManifests } from '@/content/practices'
import { getDb } from './client'
import type { Tier, TimeBlock } from './schema'

// --- Practice icons ---

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

// --- Practices without manifests (simple toggle practices) ---

type SimplePracticeSeed = {
  id: string
  customName: string
  customIcon: string
  sortOrder: number
  tier: Tier
  timeBlock: TimeBlock
  schedule: string
  enabled: boolean
  customDesc: string
}

const simplePractices: SimplePracticeSeed[] = [
  {
    id: 'mental-prayer',
    customName: 'Mental Prayer',
    customIcon: 'prayer',
    sortOrder: 2,
    tier: 'essential',
    timeBlock: 'morning',
    schedule: '{"type":"daily"}',
    enabled: true,
    customDesc: '15-30 min of silent prayer or meditation on Scripture',
  },
  {
    id: 'examination-conscience',
    customName: 'Examination of Conscience',
    customIcon: 'candle',
    sortOrder: 5,
    tier: 'essential',
    timeBlock: 'evening',
    schedule: '{"type":"daily"}',
    enabled: true,
    customDesc: "Brief review of the day's actions and failings",
  },
  {
    id: 'night-prayer',
    customName: 'Night Prayer',
    customIcon: 'moon',
    sortOrder: 6,
    tier: 'essential',
    timeBlock: 'evening',
    schedule: '{"type":"daily"}',
    enabled: true,
    customDesc: 'Brief prayer before sleep',
  },
  {
    id: 'spiritual-reading',
    customName: 'Spiritual Reading',
    customIcon: 'reading',
    sortOrder: 8,
    tier: 'ideal',
    timeBlock: 'flexible',
    schedule: '{"type":"daily"}',
    enabled: true,
    customDesc: 'Reading from spiritual classics, saints, theology',
  },
  {
    id: 'confession',
    customName: 'Confession',
    customIcon: 'confession',
    sortOrder: 9,
    tier: 'ideal',
    timeBlock: 'flexible',
    schedule: '{"type":"days-of-week","days":[6]}',
    enabled: false,
    customDesc: 'Sacrament of Reconciliation',
  },
  {
    id: 'blessed-sacrament',
    customName: 'Visit to Blessed Sacrament',
    customIcon: 'monstrance',
    sortOrder: 10,
    tier: 'ideal',
    timeBlock: 'flexible',
    schedule: '{"type":"daily"}',
    enabled: false,
    customDesc: 'Time spent before the Blessed Sacrament',
  },
  {
    id: 'lectio-divina',
    customName: 'Lectio Divina',
    customIcon: 'scroll',
    sortOrder: 13,
    tier: 'extra',
    timeBlock: 'flexible',
    schedule: '{"type":"daily"}',
    enabled: false,
    customDesc: 'Prayerful reading and meditation on Scripture',
  },
  {
    id: 'three-oclock',
    customName: "Three O'Clock Prayer",
    customIcon: 'clock',
    sortOrder: 16,
    tier: 'extra',
    timeBlock: 'daytime',
    schedule: '{"type":"daily"}',
    enabled: false,
    customDesc: 'Brief prayer at the Hour of Mercy',
  },
  // Eastern Catholic practices
  {
    id: 'jesus-prayer',
    customName: 'Jesus Prayer',
    customIcon: 'rosary',
    sortOrder: 19,
    tier: 'essential',
    timeBlock: 'flexible',
    schedule: '{"type":"daily"}',
    enabled: false,
    customDesc: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner',
  },
  {
    id: 'akathist',
    customName: 'Akathist Hymn',
    customIcon: 'scroll',
    sortOrder: 20,
    tier: 'ideal',
    timeBlock: 'flexible',
    schedule: '{"type":"days-of-week","days":[6]}',
    enabled: false,
    customDesc: 'Standing hymn of praise to Christ or the Theotokos',
  },
  {
    id: 'trisagion',
    customName: 'Trisagion Prayers',
    customIcon: 'candle',
    sortOrder: 21,
    tier: 'ideal',
    timeBlock: 'morning',
    schedule: '{"type":"daily"}',
    enabled: false,
    customDesc: 'Holy God, Holy Mighty, Holy Immortal, have mercy on us',
  },
  {
    id: 'paraklesis',
    customName: 'Paraklesis',
    customIcon: 'mary',
    sortOrder: 22,
    tier: 'extra',
    timeBlock: 'flexible',
    schedule: '{"type":"daily"}',
    enabled: false,
    customDesc: 'Supplicatory canon to the Theotokos',
  },
  {
    id: 'prostrations',
    customName: 'Prostrations',
    customIcon: 'prayer',
    sortOrder: 23,
    tier: 'extra',
    timeBlock: 'morning',
    schedule: '{"type":"daily"}',
    enabled: false,
    customDesc: 'Prayer with metanias (bows)',
  },
]

// --- Seeding ---

export async function seedPractices() {
  const db = getDb()
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) as total FROM user_practices',
  )
  if (result && result.total > 0) {
    await backfillNewPractices()
    return
  }

  await db.withTransactionAsync(async () => {
    // Seed manifest-based practices from their defaults
    for (const manifest of getAllManifests()) {
      if (!manifest.defaults) continue
      const d = manifest.defaults
      await db.runAsync(
        `INSERT INTO user_practices (practice_id, enabled, sort_order, tier, time_block, schedule)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          manifest.id,
          d.enabled ? 1 : 0,
          d.sortOrder,
          d.tier,
          d.timeBlock,
          JSON.stringify(d.schedule),
        ],
      )
    }

    // Seed simple practices (no manifest)
    for (const p of simplePractices) {
      await db.runAsync(
        `INSERT INTO user_practices (practice_id, enabled, sort_order, tier, time_block, schedule, custom_name, custom_icon, custom_desc)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.enabled ? 1 : 0,
          p.sortOrder,
          p.tier,
          p.timeBlock,
          p.schedule,
          p.customName,
          p.customIcon,
          p.customDesc,
        ],
      )
    }
  })
}

async function backfillNewPractices() {
  const db = getDb()

  // Backfill any new manifest-based practices
  for (const manifest of getAllManifests()) {
    if (!manifest.defaults) continue
    const d = manifest.defaults
    await db.runAsync(
      `INSERT OR IGNORE INTO user_practices (practice_id, enabled, sort_order, tier, time_block, schedule)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        manifest.id,
        d.enabled ? 1 : 0,
        d.sortOrder,
        d.tier,
        d.timeBlock,
        JSON.stringify(d.schedule),
      ],
    )
  }

  // Backfill any new simple practices
  for (const p of simplePractices) {
    await db.runAsync(
      `INSERT OR IGNORE INTO user_practices (practice_id, enabled, sort_order, tier, time_block, schedule, custom_name, custom_icon, custom_desc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.enabled ? 1 : 0,
        p.sortOrder,
        p.tier,
        p.timeBlock,
        p.schedule,
        p.customName,
        p.customIcon,
        p.customDesc,
      ],
    )
  }
}

// --- Reading cursors ---

const defaultCursors = [
  { id: 'divine-office/ot-readings', position: '{"index":0}' },
  { id: 'divine-office/nt-readings', position: '{"index":0}' },
  { id: 'divine-office/ccc-readings', position: '{"index":0}' },
] as const

export async function seedCursors() {
  const db = getDb()
  const today = format(new Date(), 'yyyy-MM-dd')

  for (const cursor of defaultCursors) {
    await db.runAsync('INSERT OR IGNORE INTO cursors (id, position, started_at) VALUES (?, ?, ?)', [
      cursor.id,
      cursor.position,
      today,
    ])
  }
}
