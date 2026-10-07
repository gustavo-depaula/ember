// The Ordinary Form day: which celebrations a date offers and in what order.
//
// Precedence is the Table of Liturgical Days (Universal Norms on the
// Liturgical Year and the Calendar, 59), whose numbers the corpus carries on
// every formulary. Lower wins.

import type { LiturgicalColor, Localized, MissalCalendar, SanctoralEntry } from '../types'
import {
  addDays,
  daysBetween,
  easterSunday,
  type MassRef,
  type Season,
  sameDay,
  sundayCycle,
  type TemporalDay,
  type Transfers,
  temporalDay,
  universalTransfers,
  weekdayCycle,
} from './temporal'

export type Rank = 'solemnity' | 'feast' | 'memorial' | 'optional-memorial' | 'sunday' | 'weekday'

export interface Celebration {
  // The formulary id; for a weekday of Ordinary Time, the day's lectionary id.
  id: string
  kind: 'tempore' | 'sanctoral'
  precedence: number
  rank: Rank
  title?: Localized
  color: LiturgicalColor
  // The default Mass first.
  masses: MassRef[]
  // Outranked by the day: it may be commemorated, not celebrated in full.
  commemoration?: boolean
  // Kept today because its own date is impeded.
  transferred?: boolean
}

export interface OfDay {
  date: Date
  season: Season
  week: number
  weekday: number
  // The day's named temporal celebration (`christmas`, `ascension`, …).
  key?: string
  cycle: 'A' | 'B' | 'C'
  weekdayCycle: 'I' | 'II'
  // The day of the temporal cycle, whether or not it is celebrated: a memorial
  // takes its readings and missing prayers from here.
  temporal: Celebration
  // What may be celebrated, the default first.
  celebrations: Celebration[]
  // A vigil Mass of tomorrow that may be said this evening.
  anticipated?: MassRef
}

// Every region's calendar at once, for surfaces that show any saint anywhere.
export const everyRegion = 'every-region'

export interface ResolveOptions {
  regions?: string[] | typeof everyRegion
  transfers?: Transfers
}

// Where each region keeps Epiphany, the Ascension and Corpus Christi. A region
// not listed follows the universal calendar.
export const regionTransfers: Record<string, Transfers> = {
  brazil: { epiphany: 'sunday', ascension: 'sunday', corpusChristi: 'thursday' },
  'united-states': { epiphany: 'sunday', ascension: 'sunday', corpusChristi: 'sunday' },
  spain: { epiphany: 'jan-6', ascension: 'sunday', corpusChristi: 'sunday' },
  argentina: { epiphany: 'sunday', ascension: 'sunday', corpusChristi: 'sunday' },
  france: { epiphany: 'sunday', ascension: 'thursday', corpusChristi: 'sunday' },
  'german-speaking': { epiphany: 'jan-6', ascension: 'thursday', corpusChristi: 'thursday' },
  italy: { epiphany: 'jan-6', ascension: 'sunday', corpusChristi: 'sunday' },
}

export function transfersFor(options: ResolveOptions): Transfers {
  if (options.transfers) return options.transfers
  if (!options.regions || options.regions === everyRegion) return universalTransfers
  const region = options.regions.find((r) => regionTransfers[r])
  return region ? regionTransfers[region] : universalTransfers
}

function inRegions(entry: { regions?: string[] }, regions: ResolveOptions['regions']): boolean {
  if (!entry.regions) return true
  if (regions === everyRegion) return true
  return (regions ?? []).some((r) => entry.regions?.includes(r))
}

// A Sunday formulary of Ordinary Time also serves the weekdays after it, at
// their own number.
function precedenceOn(
  entry: { precedence?: number; weekdayPrecedence?: number } | undefined,
  weekday: number,
): number {
  if (weekday !== 0 && entry?.weekdayPrecedence !== undefined) return entry.weekdayPrecedence
  return entry?.precedence ?? 13
}

const temporalSolemnities = new Set([
  'christmas',
  'mary-mother-of-god',
  'epiphany',
  'easter-sunday',
  'ascension',
  'pentecost',
  'trinity-sunday',
  'corpus-christi',
  'sacred-heart',
  'christ-the-king',
])

function rankOf(
  precedence: number,
  kind: Celebration['kind'],
  weekday: number,
  key?: string,
): Rank {
  if (kind === 'tempore') {
    if (key && temporalSolemnities.has(key)) return 'solemnity'
    if (key === 'baptism-of-the-lord' || key === 'holy-family') return 'feast'
    if (weekday === 0) return 'sunday'
    return 'weekday'
  }
  if (precedence <= 4) return 'solemnity'
  if (precedence <= 8) return 'feast'
  if (precedence <= 11) return 'memorial'
  return 'optional-memorial'
}

function temporalColor(day: TemporalDay): LiturgicalColor {
  switch (day.key) {
    case 'palm-sunday':
    case 'good-friday':
    case 'pentecost':
      return 'red'
    case 'holy-thursday':
    case 'holy-saturday':
    case 'trinity-sunday':
    case 'corpus-christi':
    case 'sacred-heart':
    case 'christ-the-king':
      return 'white'
  }
  switch (day.season) {
    case 'advent':
      return day.week === 3 && day.weekday === 0 ? 'rose' : 'violet'
    case 'lent':
      return day.week === 4 && day.weekday === 0 ? 'rose' : 'violet'
    case 'holy-week':
      return 'violet'
    case 'christmas':
    case 'easter':
      return 'white'
    default:
      return 'green'
  }
}

function temporalCelebration(day: TemporalDay, calendar: MissalCalendar): Celebration {
  const mass = day.masses[0]
  const formulary = mass?.formulary ? calendar.formularies[mass.formulary] : undefined
  // 26-28 December have no temporal Mass; they rank as days within the octave.
  const precedence = mass ? precedenceOn(formulary, day.weekday) : 9
  return {
    id: mass?.lectionary ?? 'tempore.christmas.octave',
    kind: 'tempore',
    precedence,
    rank: rankOf(precedence, 'tempore', day.weekday, day.key),
    // A weekday that borrows the Sunday's formulary is named by its own
    // lectionary entry.
    title:
      mass && mass.formulary !== mass.lectionary
        ? (calendar.lectionary[mass.lectionary]?.title ?? formulary?.title)
        : formulary?.title,
    color: temporalColor(day),
    masses: day.masses,
  }
}

function sanctoralCelebration(
  entry: { id: string },
  calendar: MissalCalendar,
  weekday: number,
): Celebration | undefined {
  const formulary = calendar.formularies[entry.id]
  if (!formulary) return undefined
  const precedence = precedenceOn(formulary, weekday)
  const masses: MassRef[] = [
    { key: 'day', formulary: entry.id, lectionary: formulary.lectionary ?? entry.id },
  ]
  const vigil = `${entry.id}.vigil`
  if (calendar.formularies[vigil]) {
    masses.push({
      key: 'vigil',
      formulary: vigil,
      lectionary: calendar.formularies[vigil].lectionary ?? vigil,
    })
  }
  return {
    id: entry.id,
    kind: 'sanctoral',
    precedence,
    rank: rankOf(precedence, 'sanctoral', weekday),
    title: formulary.title,
    color: formulary.color ?? 'white',
    masses,
  }
}

const dayKey = (date: Date) => (date.getMonth() + 1) * 100 + date.getDate()

// A vigil formulary is a Mass of its day, not a celebration of its own.
const isVigil = (id: string) => id.endsWith('.vigil')

interface YearIndex {
  // Month·100+day -> the entries kept that day, solemnities already moved.
  byDay: Map<number, { entry: { id: string }; transferred: boolean; movable: boolean }[]>
}

const yearIndexes = new WeakMap<MissalCalendar, Map<string, YearIndex>>()

/**
 * Where a solemnity is kept when its own date is impeded (Universal Norms 60):
 * St Joseph in Holy Week goes back to the Saturday before Palm Sunday; anything
 * in Holy Week or the Easter octave goes to the Monday after the octave;
 * otherwise the next free day.
 */
function observedDate(natural: Date, id: string, isImpeded: (date: Date) => boolean): Date {
  if (!isImpeded(natural)) return natural
  const easter = easterSunday(natural.getFullYear())
  const fromEaster = daysBetween(easter, natural)
  if (fromEaster >= -7 && fromEaster <= 7) {
    if (id === 'sanctorale.03-19' && fromEaster < 0) return addDays(easter, -8)
    let day = addDays(easter, 8)
    while (isImpeded(day)) day = addDays(day, 1)
    return day
  }
  let day = addDays(natural, 1)
  while (isImpeded(day)) day = addDays(day, 1)
  return day
}

function buildYearIndex(
  calendar: MissalCalendar,
  year: number,
  options: ResolveOptions,
): YearIndex {
  const transfers = transfersFor(options)
  const byDay: YearIndex['byDay'] = new Map()
  const add = (date: Date, entry: { id: string }, transferred: boolean, movable = false) => {
    if (date.getFullYear() !== year) return
    const key = dayKey(date)
    const list = byDay.get(key) ?? []
    if (!list.some((e) => e.entry.id === entry.id)) list.push({ entry, transferred, movable })
    byDay.set(key, list)
  }

  const temporalPrecedence = (date: Date) =>
    temporalCelebration(temporalDay(date, transfers), calendar).precedence
  const taken = new Set<number>()
  // A solemnity gives way to the days numbered 1-2 and to the solemnities of
  // the Lord in the temporal cycle, and to another solemnity already there.
  const isImpeded = (date: Date) => temporalPrecedence(date) <= 3 || taken.has(date.getTime())

  const fixed = calendar.sanctoral.filter(
    (e: SanctoralEntry) => inRegions(e, options.regions) && !isVigil(e.id),
  )
  const solemnities = fixed.filter((e) => (calendar.formularies[e.id]?.precedence ?? 13) <= 4)
  for (const entry of solemnities) {
    const natural = new Date(year, entry.month - 1, entry.day, 12)
    // All Souls is numbered with the solemnities but is never moved: on a
    // Sunday it simply takes the Sunday's place.
    const observed =
      entry.id === 'sanctorale.11-02' ? natural : observedDate(natural, entry.id, isImpeded)
    taken.add(observed.getTime())
    add(observed, entry, !sameDay(observed, natural))
  }
  for (const entry of fixed) {
    if (solemnities.includes(entry)) continue
    add(new Date(year, entry.month - 1, entry.day, 12), entry, false)
  }

  const easter = easterSunday(year)
  for (const entry of calendar.movable) {
    if (!inRegions(entry, options.regions)) continue
    if (entry.easter !== undefined) add(addDays(easter, entry.easter), entry, false, true)
    if (entry.weekdayOfMonth) {
      const [month, weekday, nth] = entry.weekdayOfMonth
      const first = new Date(year, month - 1, 1, 12)
      const offset = (weekday - first.getDay() + 7) % 7
      add(addDays(first, offset + 7 * (nth - 1)), entry, false, true)
    }
  }
  return { byDay }
}

function yearIndex(calendar: MissalCalendar, year: number, options: ResolveOptions): YearIndex {
  let byKey = yearIndexes.get(calendar)
  if (!byKey) {
    byKey = new Map()
    yearIndexes.set(calendar, byKey)
  }
  const regions = options.regions === everyRegion ? everyRegion : (options.regions ?? []).join(',')
  const key = `${year}|${regions}|${JSON.stringify(transfersFor(options))}`
  let index = byKey.get(key)
  if (!index) {
    index = buildYearIndex(calendar, year, options)
    byKey.set(key, index)
  }
  return index
}

/**
 * Every celebration that falls on `date`, in order of precedence, before any
 * is set aside: a memorial on a Sunday is still listed. These are "the saints
 * of the day" whether or not the day's Mass is theirs.
 */
export function celebrationsOn(
  date: Date,
  calendar: MissalCalendar,
  options: ResolveOptions = {},
): Celebration[] {
  const day = temporalDay(date, transfersFor(options))
  const temporal = temporalCelebration(day, calendar)
  const onDay = yearIndex(calendar, date.getFullYear(), options).byDay.get(dayKey(date)) ?? []
  // A movable memorial (Mary, Mother of the Church; the Immaculate Heart)
  // prevails over a saint's memorial of the same rank that falls on its day.
  const saints = [...onDay]
    .sort((a, b) => Number(b.movable) - Number(a.movable))
    .map(({ entry, transferred }) => {
      const c = sanctoralCelebration(entry, calendar, day.weekday)
      return c && transferred ? { ...c, transferred } : c
    })
    .filter((c): c is Celebration => c !== undefined)
  // On a tie the temporal day is listed first: a solemnity of the Lord keeps
  // its day, and the saint has already been moved off it.
  return [temporal, ...saints].sort((a, b) => a.precedence - b.precedence)
}

export function resolveOfDay(
  date: Date,
  calendar: MissalCalendar,
  options: ResolveOptions = {},
): OfDay {
  const day = temporalDay(date, transfersFor(options))
  const all = celebrationsOn(date, calendar, options)
  const temporal = all.find((c) => c.kind === 'tempore') as Celebration
  const principal = all[0]

  const celebrations = (() => {
    // A solemnity, feast or Sunday stands alone: lesser celebrations are
    // omitted that year.
    if (principal.precedence <= 8) return [principal]
    // The privileged weekdays (17-24 December, the Christmas octave, Lent):
    // memorials may only be commemorated.
    if (principal.precedence === 9) {
      return [
        principal,
        ...all.filter((c) => c !== principal).map((c) => ({ ...c, commemoration: true })),
      ]
    }
    // An obligatory memorial is the Mass of the day; where two coincide, the
    // one that prevails.
    if (principal.precedence < 12) return [principal]
    // Optional memorials and the weekday are all free choices.
    return all
  })()

  return {
    date,
    season: day.season,
    week: day.week,
    weekday: day.weekday,
    key: day.key,
    cycle: sundayCycle(date),
    weekdayCycle: weekdayCycle(date),
    temporal,
    // 26-28 December: the temporal cycle has no Mass to offer.
    celebrations: celebrations.filter((c) => c.masses.length > 0),
    ...(day.anticipated ? { anticipated: day.anticipated } : {}),
  }
}

/** The ids of every saint's day on the calendar of `regions`, vigils aside. */
export function sanctoralIds(
  calendar: MissalCalendar,
  regions: ResolveOptions['regions'],
): Set<string> {
  const ids = new Set<string>()
  for (const entry of [...calendar.sanctoral, ...calendar.movable]) {
    if (inRegions(entry, regions) && !isVigil(entry.id)) ids.add(entry.id)
  }
  return ids
}
