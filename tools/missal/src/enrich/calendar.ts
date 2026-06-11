import type {
  DateRule,
  MassFormulary,
  OfCalendarStatics,
  SanctoralEntry,
  TemporalEntry,
  Weekday,
} from '@ember/missal-schema'

const weekdays = new Set(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])

/** Easter-relative sanctoral memorials the upstream stores by fixed slug. */
const easterRelativeSanctoral: Record<string, number> = {
  // Immaculate Heart of Mary — Saturday after the Second Sunday after Pentecost
  'sanctorale.immaculate-heart': 69,
  // Mary, Mother of the Church — Monday after Pentecost
  'sanctorale.mary-mother-of-the-church': 50,
}

function parseTemporalId(id: string): { season: string; week?: number; weekday?: Weekday; slug?: string } | undefined {
  // tempore.<season>.week-<n>.<weekday>
  let m = /^tempore\.([a-z-]+)\.week-(\d+)\.([a-z]+)$/.exec(id)
  if (m && weekdays.has(m[3])) return { season: m[1], week: Number(m[2]), weekday: m[3] as Weekday }
  // tempore.<season>.<slug>  (fixed-date or movable named day)
  m = /^tempore\.([a-z-]+)\.([a-z0-9-]+)$/.exec(id)
  if (m) return { season: m[1], slug: m[2] }
  return undefined
}

const fixedSlugDate: Record<string, { month: number; day: number }> = {
  'dec-17': { month: 12, day: 17 }, 'dec-18': { month: 12, day: 18 },
  'dec-19': { month: 12, day: 19 }, 'dec-20': { month: 12, day: 20 },
  'dec-21': { month: 12, day: 21 }, 'dec-22': { month: 12, day: 22 },
  'dec-23': { month: 12, day: 23 }, 'dec-24': { month: 12, day: 24 },
  'dec-29': { month: 12, day: 29 }, 'dec-30': { month: 12, day: 30 },
  'dec-31': { month: 12, day: 31 },
}

function temporalEntry(f: MassFormulary): TemporalEntry | undefined {
  const parsed = parseTemporalId(f.id)
  if (!parsed || !f.season) return undefined
  const entry: TemporalEntry = {
    formularyRef: f.id,
    season: f.season,
    structure: f.structure,
  }
  if (parsed.week !== undefined) entry.week = parsed.week
  if (parsed.weekday) entry.weekday = parsed.weekday
  if (parsed.slug) {
    const fixed = fixedSlugDate[parsed.slug]
    if (fixed) entry.fixedDate = fixed
    else entry.movableCode = parsed.slug // ascension, pentecost, holy-family, epiphany, …
  }
  return entry
}

function sanctoralEntry(f: MassFormulary, raw: Record<string, unknown> | undefined): SanctoralEntry | undefined {
  let dateRule: DateRule | undefined
  const offset = easterRelativeSanctoral[f.id]
  if (offset !== undefined) {
    dateRule = { type: 'easter-relative', offsetDays: offset }
  } else {
    const date = raw?.date as { month?: number; day?: number } | undefined
    // Fall back to parsing MM-DD out of the id (sanctorale.05-13[.scope]).
    const m = /sanctorale\.(\d{2})-(\d{2})/.exec(f.id)
    const month = date?.month ?? (m ? Number(m[1]) : undefined)
    const day = date?.day ?? (m ? Number(m[2]) : undefined)
    if (month && day) dateRule = { type: 'fixed', month, day }
  }
  if (!dateRule) return undefined

  const entry: SanctoralEntry = {
    formularyRef: f.id,
    dateRule,
    rank: f.rank ?? 'optional-memorial',
    scope: f.scope,
    title: f.title,
  }
  if (f.color) entry.color = f.color
  if (f.structure === 'vigil-mass') {
    // The day Mass shares the date; link by stripping a trailing .vigil if present.
    const dayRef = f.id.replace(/\.vigil$/, '')
    if (dayRef !== f.id) entry.vigilOf = dayRef
  }
  return entry
}

export function buildCalendarStatics(
  formularies: MassFormulary[],
  rawById: Map<string, Record<string, unknown>>,
): OfCalendarStatics {
  const temporal: TemporalEntry[] = []
  const sanctoral: SanctoralEntry[] = []
  for (const f of formularies) {
    if (f.kind === 'temporal') {
      const e = temporalEntry(f)
      if (e) temporal.push(e)
    } else if (f.kind === 'sanctoral') {
      const e = sanctoralEntry(f, rawById.get(f.id))
      if (e) sanctoral.push(e)
    }
  }
  return { temporal, sanctoral }
}
