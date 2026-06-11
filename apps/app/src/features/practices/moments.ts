import type { PracticeManifest } from '@/content/types'

export type Moment = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'mass'

const moments: readonly Moment[] = ['morning', 'midday', 'afternoon', 'evening', 'night', 'mass']

export function isMoment(value: string | undefined): value is Moment {
  return !!value && (moments as readonly string[]).includes(value)
}

// Practices without a clean time hint get an explicit moment so common anchors
// surface where the user expects ("Antes da Missa" → Sunday Mass).
const overrides: Record<string, Moment> = {
  mass: 'mass',
  'mass-of-the-day': 'mass',
  angelus: 'midday',
  'regina-caeli': 'midday',
  'night-prayer': 'night',
  compline: 'night',
  'examination-of-conscience': 'evening',
  examen: 'evening',
  'morning-offering': 'morning',
  'morning-prayer': 'morning',
}

function bucketForHour(hour: number): Moment {
  if (hour >= 5 && hour < 10) return 'morning'
  if (hour >= 10 && hour < 13) return 'midday'
  if (hour >= 13 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

function parseHour(time: string | undefined): number | undefined {
  if (!time) return undefined
  const match = /^(\d{1,2})/.exec(time.trim())
  if (!match) return undefined
  const hour = Number.parseInt(match[1], 10)
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return undefined
  return hour
}

function bareId(id: string): string {
  const slash = id.indexOf('/')
  return slash < 0 ? id : id.slice(slash + 1)
}

/** Best-effort moment for a practice. `undefined` means the moment filter
 *  silently excludes it — that's correct for practices with no time affinity. */
export function momentForManifest(m: PracticeManifest): Moment | undefined {
  const override = overrides[bareId(m.id)]
  if (override) return override
  const hour = parseHour(m.defaults?.slots?.[0]?.time)
  if (hour !== undefined) return bucketForHour(hour)
  return undefined
}
