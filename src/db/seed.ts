import { format } from 'date-fns'
import type { SQLiteDatabase } from 'expo-sqlite'

import { getAllManifests } from '@/content/practices'
import { deriveTimeBlock } from '@/features/plan-of-life/timeBlocks'
import { composeSlotKey } from '@/lib/slotKey'
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

// --- Default times by time block ---

const defaultTimes: Record<TimeBlock, string | undefined> = {
  morning: '07:00',
  daytime: '12:00',
  evening: '20:00',
  flexible: undefined,
}

// --- Simple practices (no manifest) ---

type SimplePracticeSeed = {
  id: string
  customName: string
  customIcon: string
  customDesc: string
  slots: {
    slotId: string
    sortOrder: number
    tier: Tier
    time?: string
    schedule: string
    enabled: boolean
  }[]
}

const simplePractices: SimplePracticeSeed[] = [
  {
    id: 'mental-prayer',
    customName: 'Mental Prayer',
    customIcon: 'prayer',
    customDesc: '15-30 min of silent prayer or meditation on Scripture',
    slots: [
      {
        slotId: 'default',
        sortOrder: 2,
        tier: 'essential',
        time: '07:00',
        schedule: '{"type":"daily"}',
        enabled: true,
      },
    ],
  },
  {
    id: 'examination-conscience',
    customName: 'Examination of Conscience',
    customIcon: 'candle',
    customDesc: "Brief review of the day's actions and failings",
    slots: [
      {
        slotId: 'default',
        sortOrder: 5,
        tier: 'essential',
        time: '21:00',
        schedule: '{"type":"daily"}',
        enabled: true,
      },
    ],
  },
  {
    id: 'night-prayer',
    customName: 'Night Prayer',
    customIcon: 'moon',
    customDesc: 'Brief prayer before sleep',
    slots: [
      {
        slotId: 'default',
        sortOrder: 6,
        tier: 'essential',
        time: '21:30',
        schedule: '{"type":"daily"}',
        enabled: true,
      },
    ],
  },
  {
    id: 'spiritual-reading',
    customName: 'Spiritual Reading',
    customIcon: 'reading',
    customDesc: 'Reading from spiritual classics, saints, theology',
    slots: [
      {
        slotId: 'default',
        sortOrder: 8,
        tier: 'ideal',
        schedule: '{"type":"daily"}',
        enabled: true,
      },
    ],
  },
  {
    id: 'confession',
    customName: 'Confession',
    customIcon: 'confession',
    customDesc: 'Sacrament of Reconciliation',
    slots: [
      {
        slotId: 'default',
        sortOrder: 9,
        tier: 'ideal',
        schedule: '{"type":"days-of-week","days":[6]}',
        enabled: false,
      },
    ],
  },
  {
    id: 'blessed-sacrament',
    customName: 'Visit to Blessed Sacrament',
    customIcon: 'monstrance',
    customDesc: 'Time spent before the Blessed Sacrament',
    slots: [
      {
        slotId: 'default',
        sortOrder: 10,
        tier: 'ideal',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
  {
    id: 'lectio-divina',
    customName: 'Lectio Divina',
    customIcon: 'scroll',
    customDesc: 'Prayerful reading and meditation on Scripture',
    slots: [
      {
        slotId: 'default',
        sortOrder: 13,
        tier: 'extra',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
  {
    id: 'three-oclock',
    customName: "Three O'Clock Prayer",
    customIcon: 'clock',
    customDesc: 'Brief prayer at the Hour of Mercy',
    slots: [
      {
        slotId: 'default',
        sortOrder: 16,
        tier: 'extra',
        time: '15:00',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
  // Eastern Catholic practices
  {
    id: 'jesus-prayer',
    customName: 'Jesus Prayer',
    customIcon: 'rosary',
    customDesc: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner',
    slots: [
      {
        slotId: 'default',
        sortOrder: 19,
        tier: 'essential',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
  {
    id: 'akathist',
    customName: 'Akathist Hymn',
    customIcon: 'scroll',
    customDesc: 'Standing hymn of praise to Christ or the Theotokos',
    slots: [
      {
        slotId: 'default',
        sortOrder: 20,
        tier: 'ideal',
        schedule: '{"type":"days-of-week","days":[6]}',
        enabled: false,
      },
    ],
  },
  {
    id: 'trisagion',
    customName: 'Trisagion Prayers',
    customIcon: 'candle',
    customDesc: 'Holy God, Holy Mighty, Holy Immortal, have mercy on us',
    slots: [
      {
        slotId: 'default',
        sortOrder: 21,
        tier: 'ideal',
        time: '07:00',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
  {
    id: 'paraklesis',
    customName: 'Paraklesis',
    customIcon: 'mary',
    customDesc: 'Supplicatory canon to the Theotokos',
    slots: [
      {
        slotId: 'default',
        sortOrder: 22,
        tier: 'extra',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
  {
    id: 'prostrations',
    customName: 'Prostrations',
    customIcon: 'prayer',
    customDesc: 'Prayer with metanias (bows)',
    slots: [
      {
        slotId: 'default',
        sortOrder: 23,
        tier: 'extra',
        time: '07:00',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
]

// --- Shared seed helpers ---

function insertSlot(
  db: SQLiteDatabase,
  verb: 'INSERT' | 'INSERT OR IGNORE',
  practiceId: string,
  slotId: string,
  fields: {
    enabled: number
    sortOrder: number
    tier: string
    time: string | null
    schedule: string
  },
) {
  const timeBlock = deriveTimeBlock(fields.time)
  return db.runAsync(
    `${verb} INTO user_practice_slots (id, practice_id, slot_id, enabled, sort_order, tier, time, time_block, schedule)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      composeSlotKey(practiceId, slotId),
      practiceId,
      slotId,
      fields.enabled,
      fields.sortOrder,
      fields.tier,
      fields.time,
      timeBlock,
      fields.schedule,
    ],
  )
}

async function seedAllPractices(db: SQLiteDatabase, verb: 'INSERT' | 'INSERT OR IGNORE') {
  for (const manifest of getAllManifests()) {
    if (!manifest.defaults) continue
    const d = manifest.defaults

    await db.runAsync(`${verb} INTO user_practices (practice_id) VALUES (?)`, [manifest.id])

    for (const slotDef of d.slots) {
      const flow = manifest.flows.find((f) => f.id === slotDef.flowId)
      const time =
        slotDef.time ??
        (flow?.timeBlock ? defaultTimes[flow.timeBlock as TimeBlock] : undefined) ??
        null
      await insertSlot(db, verb, manifest.id, slotDef.flowId, {
        enabled: slotDef.enabled !== false ? 1 : 0,
        sortOrder: d.sortOrder,
        tier: slotDef.tier ?? 'essential',
        time,
        schedule: JSON.stringify(slotDef.schedule),
      })
    }
  }

  for (const p of simplePractices) {
    await db.runAsync(
      `${verb} INTO user_practices (practice_id, custom_name, custom_icon, custom_desc) VALUES (?, ?, ?, ?)`,
      [p.id, p.customName, p.customIcon, p.customDesc],
    )

    for (const s of p.slots) {
      await insertSlot(db, verb, p.id, s.slotId, {
        enabled: s.enabled ? 1 : 0,
        sortOrder: s.sortOrder,
        tier: s.tier,
        time: s.time ?? null,
        schedule: s.schedule,
      })
    }
  }
}

// --- Seeding ---

export async function seedPractices() {
  const db = getDb()
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT count(*) as total FROM user_practices',
  )
  if (result && result.total > 0) {
    await seedAllPractices(db, 'INSERT OR IGNORE')
    return
  }

  await db.withTransactionAsync(() => seedAllPractices(db, 'INSERT'))
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
