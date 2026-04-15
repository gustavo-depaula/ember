import { getAllManifests } from '@/content/registry'
import { deriveTimeBlock } from '@/features/plan-of-life/timeBlocks'
import { composeSlotKey } from '@/lib/slotKey'

import { emitBatch, useEventStore } from './events'
import type { AppEvent } from './events/types'
import type { Tier } from './schema'

// --- Simple practices (no manifest) ---

type SimplePracticeSeed = {
  id: string
  customName: string
  customIcon: string
  customDesc: string
  slots: {
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
        sortOrder: 16,
        tier: 'extra',
        time: '15:00',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
  {
    id: 'jesus-prayer',
    customName: 'Jesus Prayer',
    customIcon: 'rosary',
    customDesc: 'Lord Jesus Christ, Son of God, have mercy on me, a sinner',
    slots: [
      {
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
        sortOrder: 23,
        tier: 'extra',
        time: '07:00',
        schedule: '{"type":"daily"}',
        enabled: false,
      },
    ],
  },
]

// --- Seed logic ---

function seedSlots(
  practiceId: string,
  slots: { tier?: string; time?: string; schedule: string; sortOrder: number }[],
  store: ReturnType<typeof useEventStore.getState>,
  events: AppEvent[],
) {
  for (let i = 0; i < slots.length; i++) {
    const def = slots[i]
    const slotKey = composeSlotKey(practiceId, String(i + 1))
    if (store.slots.has(slotKey)) continue
    const time = def.time ?? null
    events.push({
      type: 'SlotAdded',
      practiceId,
      slotKey,
      tier: (def.tier ?? 'essential') as Tier,
      time,
      timeBlock: deriveTimeBlock(time),
      schedule: def.schedule,
      sortOrder: def.sortOrder,
      enabled: 0,
    })
  }
}

function collectSeedEvents(): AppEvent[] {
  const store = useEventStore.getState()
  const events: AppEvent[] = []

  for (const manifest of getAllManifests()) {
    if (!manifest.defaults) continue
    const d = manifest.defaults

    if (!store.practices.has(manifest.id)) {
      events.push({ type: 'PracticeCreated', practiceId: manifest.id })
    }

    seedSlots(
      manifest.id,
      d.slots.map((s) => ({ ...s, schedule: JSON.stringify(s.schedule), sortOrder: d.sortOrder })),
      store,
      events,
    )
  }

  for (const p of simplePractices) {
    if (!store.practices.has(p.id)) {
      events.push({
        type: 'PracticeCreated',
        practiceId: p.id,
        customName: p.customName,
        customIcon: p.customIcon,
        customDesc: p.customDesc,
      })
    }

    seedSlots(p.id, p.slots, store, events)
  }

  return events
}

export async function seedPractices(): Promise<void> {
  const events = collectSeedEvents()
  if (events.length > 0) await emitBatch(events)
}

// --- Reading cursors ---

export async function seedCursors(): Promise<void> {
  const store = useEventStore.getState()
  const { format } = await import('date-fns')
  const { getToday } = await import('@/hooks/useToday')
  const today = format(getToday(), 'yyyy-MM-dd')

  const defaultCursors = [
    { id: 'divine-office/ot-readings', position: '{"index":0}' },
    { id: 'divine-office/nt-readings', position: '{"index":0}' },
    { id: 'divine-office/ccc-readings', position: '{"index":0}' },
  ] as const

  const events: AppEvent[] = []
  for (const cursor of defaultCursors) {
    if (!store.cursors.has(cursor.id)) {
      events.push({
        type: 'CursorSet',
        cursorId: cursor.id,
        position: cursor.position,
        startedAt: today,
      })
    }
  }

  if (events.length > 0) await emitBatch(events)
}
