import { format } from 'date-fns'
import type { SQLiteDatabase } from 'expo-sqlite'

import { getAllManifests } from '@/content/registry'
import { deriveTimeBlock } from '@/features/plan-of-life/timeBlocks'
import { composeSlotKey } from '@/lib/slotKey'
import { getDb } from './client'
import type { Tier, TimeBlock } from './schema'

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
      const slotId = slotDef.slotId ?? slotDef.flowId
      const time =
        slotDef.time ??
        (flow?.timeBlock ? defaultTimes[flow.timeBlock as TimeBlock] : undefined) ??
        null
      await insertSlot(db, verb, manifest.id, slotId, {
        enabled: 0,
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
        enabled: 0,
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
