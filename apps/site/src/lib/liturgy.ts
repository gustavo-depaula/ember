import {
  buildDoYear,
  type DoCalendarDay,
  type DoVersionId,
  doVersionNames,
  efVersion,
  parseRank,
  resolveDay,
} from '@ember/divinum-officium'
import {
  type DayCalendar,
  type DayObligations,
  getDayObligations,
  getLiturgicalDayName,
  getLiturgicalSeason,
  type LiturgicalSeason,
} from '@ember/liturgical'
import {
  assembleMass,
  buildOfYearCalendar,
  type Celebration,
  descriptionOf,
  type Lang,
  type Part,
  readingOf,
  resolveOfDay,
} from '@ember/missal'
import { QueryClient } from '@tanstack/react-query'
import type { Primitive } from '@/content/primitives'
import { getAlternativeGroup } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import {
  corpusMissal,
  loadMissalCalendar,
  regionsForJurisdiction,
  transfersForJurisdiction,
} from '@/lib/missal/loaders'
import { doHourSource } from '@/sources/divinum-officium/do-hour'
import { createCorpusDoLoader } from '@/sources/divinum-officium/loader'
import type { SourceFetchContext } from '@/sources/types'
import { isoDate, type OfficeHour, slugOf } from '~/routes'
import { ofTexts } from './config'
import { bootCorpus } from './corpus'
import { inLiturgyWindow, liturgyDates } from './dates'
import { jurisdiction, type Locale, translator, withLocale } from './locale'
import { renderPractice } from './practice'
import { addDays, today } from './today'

type Localized = Record<string, string | undefined>

export type CelebrationView = {
  ref: string
  title: string
  rank: string
  rankKey: string
  color?: string
  commemoration: boolean
  /** The Missal's notice of the celebration (shown only with OF texts enabled). */
  about?: string
}

export type ReadingCitation = { slot: 'first' | 'psalm' | 'second' | 'gospel'; citation: string }

export type OfDayView = {
  date: Date
  dayName: string
  season: LiturgicalSeason
  seasonName: string
  color?: string
  cycle: string
  celebrations: CelebrationView[]
  readings: ReadingCitation[]
  obligations: DayObligations
  holyDay: boolean
}

const ofYears = new Map<string, Promise<Map<string, DayCalendar>>>()

async function ofYear(year: number, locale: Locale): Promise<Map<string, DayCalendar>> {
  const key = `${year}:${locale}`
  let pending = ofYears.get(key)
  if (!pending) {
    pending = (async () => {
      await bootCorpus()
      const calendar = await loadMissalCalendar()
      if (!calendar) throw new Error('OF calendar missing from the corpus')
      return buildOfYearCalendar({
        year,
        calendar,
        regions: regionsForJurisdiction(jurisdiction[locale]),
      })
    })()
    ofYears.set(key, pending)
  }
  return pending
}

function rankKeyOf(c: Celebration): string {
  return c.rank.replace('-', '_')
}

export async function loadOfDay(date: Date, locale: Locale): Promise<OfDayView> {
  await bootCorpus()
  const t = translator(locale)
  const missal = await loadMissalCalendar()
  if (!missal) throw new Error('OF calendar missing from the corpus')
  const day = resolveOfDay(date, missal, { regions: regionsForJurisdiction(jurisdiction[locale]) })
  const calendar = await ofYear(date.getFullYear(), locale)
  return withLocale(locale, async () => {
    const transfers = transfersForJurisdiction(jurisdiction[locale])
    const dayName = getLiturgicalDayName(date, 'of', { t }, transfers)
    const lang = locale as Lang
    const principal = day.celebrations[0]
    const plan = principal
      ? await assembleMass(day, principal, principal.masses[0], corpusMissal)
      : undefined
    const celebrations = await Promise.all(
      day.celebrations.map(async (c): Promise<CelebrationView> => {
        const rankKey = rankKeyOf(c)
        const formulary =
          ofTexts && c.masses[0]?.formulary
            ? await corpusMissal.formulary(c.masses[0].formulary)
            : undefined
        return {
          ref: c.id,
          title: (c.title && localizeContent(c.title as Localized)) || dayName,
          rank: t(`calendar.rank.${rankKey}`, { defaultValue: '' }),
          rankKey,
          color: c.color,
          commemoration: c.commemoration === true,
          about: descriptionOf(formulary, lang) || undefined,
        }
      }),
    )
    const cite = (slot: ReadingCitation['slot'], part: Part) => {
      const citation = readingOf(plan?.parts[part]?.[0]?.items ?? [], lang).citation
      return citation ? [{ slot, citation }] : []
    }
    const obligations = getDayObligations(date, 'of', jurisdiction[locale], calendar, transfers)
    return {
      date,
      dayName,
      season: getLiturgicalSeason(date, 'of', transfers),
      seasonName: t(`home.seasonName.${getLiturgicalSeason(date, 'of', transfers)}`),
      color: celebrations[0]?.color,
      cycle: date.getDay() === 0 ? day.cycle : `${day.cycle} · ${day.weekdayCycle}`,
      celebrations,
      readings: [
        ...cite('first', 'firstReading'),
        ...cite('psalm', 'psalm'),
        ...cite('second', 'secondReading'),
        ...cite('gospel', 'gospel'),
      ],
      obligations,
      holyDay: obligations.holyDay,
    }
  })
}

export async function loadOfMonth(year: number, month: number, locale: Locale) {
  const calendar = await ofYear(year, locale)
  const days: { date: Date; principal?: { name: string; rank: string } }[] = []
  const t = translator(locale)
  const count = new Date(year, month, 0).getDate()
  for (let d = 1; d <= count; d++) {
    const date = new Date(year, month - 1, d)
    const entry = calendar.get(isoDate(date))?.principal
    days.push({
      date,
      principal: entry && {
        name:
          withLocale(locale, () => localizeContent(entry.entry.name as Localized)) ||
          getLiturgicalDayName(date, 'of', { t }, transfersForJurisdiction(jurisdiction[locale])),
        rank: entry.rank,
      },
    })
  }
  return days
}

const doLoader = () => createCorpusDoLoader()
const efYears = new Map<number, Promise<Map<string, DoCalendarDay>>>()

/** The 1962 calendar's named days for a year, by `MM-DD`. Names are Latin, as the Kalendarium gives them. */
export function efYear(year: number): Promise<Map<string, DoCalendarDay>> {
  let pending = efYears.get(year)
  if (!pending) {
    pending = bootCorpus()
      .then(() => buildDoYear({ loader: doLoader(), year, version: efVersion }))
      .then((days) => new Map(days.map((d) => [`${d.month}-${d.day}`, d])))
    efYears.set(year, pending)
  }
  return pending
}

export type EfDayView = {
  name: string
  rankText: string
  commemoration?: string
  dayName: string
  seasonName: string
  holyDay: boolean
}

export async function loadEfDay(date: Date, locale: Locale): Promise<EfDayView> {
  await bootCorpus()
  const t = translator(locale)
  const office = await loadOfficeDay(date, 'rubrics-1960')
  // The year calendar's entry may be a saint the day only commemorates, so it
  // is asked for the holy day alone.
  const named = (await efYear(date.getFullYear())).get(`${date.getMonth() + 1}-${date.getDate()}`)
  return {
    name: office.name,
    rankText: office.rank,
    commemoration: office.also,
    dayName: getLiturgicalDayName(date, 'ef', { t }),
    seasonName: t(`home.seasonName.${getLiturgicalSeason(date, 'ef')}`),
    holyDay: named?.holyDayOfObligation ?? false,
  }
}

/** The Mass of the 1962 Missal for a date, Latin beside the vernacular. */
export async function loadEfMass(date: Date, locale: Locale): Promise<Primitive[]> {
  const rendered = await renderPractice('mass-vetus-ordo', locale, { date, parallelLatin: true })
  return rendered?.primitives ?? []
}

/** The Ordinary Form Mass of a date, when the site carries its texts. */
export async function loadOfMass(date: Date, locale: Locale): Promise<Primitive[] | undefined> {
  if (!ofTexts) return undefined
  const rendered = await renderPractice('mass', locale, { date, parallelLatin: true })
  return rendered?.primitives
}

/**
 * A breviary the Office can be prayed from: a set of rubrics, or a votive
 * office under one. They are the corpus's breviary practices, the same list
 * the app offers under Form.
 */
export type OfficeForm = {
  /** The practice it is in the app. */
  practiceId: string
  /** Its place in the URL; the Roman Breviary of 1960 has none. */
  slug?: string
  family: 'roman' | 'monastic'
  familyName: string
  label: string
  description: string
  version: DoVersionId
  /** `Hodie` for the office of the day, else a Divinum Officium votive code. */
  votive: string
}

const defaultForm = 'breviary'
const families = [
  { id: 'breviary', family: 'roman' },
  { id: 'breviary-monastic', family: 'monastic' },
] as const

export async function officeForms(locale: Locale): Promise<OfficeForm[]> {
  await bootCorpus()
  return withLocale(locale, () =>
    families.flatMap(({ id, family }) => {
      const group = getAlternativeGroup(id)
      const idOf = (member: { manifest: { id: string } }) => slugOf(member.manifest.id)
      const familyName = localizeContent(
        group?.members.find((m) => idOf(m) === id)?.manifest.name ?? {},
      )
      return (group?.members ?? []).flatMap((member): OfficeForm[] => {
        const vars = member.manifest.vars
        if (!vars?.rubrics || !(vars.rubrics in doVersionNames)) return []
        return [
          {
            practiceId: idOf(member),
            slug: idOf(member) === defaultForm ? undefined : idOf(member).replace(/^breviary-/, ''),
            family,
            familyName,
            label: member.label,
            description: member.description,
            version: vars.rubrics as DoVersionId,
            votive: vars.votive ?? 'Hodie',
          },
        ]
      })
    }),
  )
}

// Every form is built for every hour of every day it covers, so only the
// breviary most people pray gets the long window. The others cover the days
// around the build, which the daily rebuild moves along; a reader a timezone
// away still finds their own yesterday or tomorrow.
function officeWindow(form: OfficeForm): { past: number; future: number } | undefined {
  if (!form.slug) return undefined
  return form.votive === 'Hodie' ? { past: 1, future: 3 } : { past: 1, future: 1 }
}

export function officeDates(form: OfficeForm): Date[] {
  const window = officeWindow(form)
  if (!window) return liturgyDates()
  const out: Date[] = []
  for (let offset = -window.past; offset <= window.future; offset++)
    out.push(addDays(today, offset))
  return out
}

export function hasOfficePage(form: OfficeForm, date: Date): boolean {
  const window = officeWindow(form)
  if (!window) return inLiturgyWindow(date)
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  return days >= -window.past && days <= window.future
}

export type OfficeDayView = {
  name: string
  rank: string
  /** The season's day or the saint the office only commemorates. */
  also?: string
}

/** The office of a day under a set of rubrics: what is kept, and at what rank. */
export async function loadOfficeDay(date: Date, version: DoVersionId): Promise<OfficeDayView> {
  await bootCorpus()
  const day = await resolveDay({
    loader: doLoader(),
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    version: doVersionNames[version],
  })
  const parsed = parseRank(day.winnerSections)
  const [headline, headlineRank] = (day.dayname[1] ?? '').split('\t')
  // The 1960 code ranks by class; the files keep the older names beside a number.
  const classes = /1960|^monastic$|barroux/.test(version)
  const byClass = (rank: number) =>
    rank >= 6
      ? 'I. classis'
      : rank >= 5
        ? 'II. classis'
        : rank >= 2
          ? 'III. classis'
          : 'IV. classis'
  const rankName = parsed?.rankName || headlineRank?.trim() || ''
  return {
    name: parsed?.title || headline.trim(),
    rank: classes && parsed && !/classis/i.test(rankName) ? byClass(parsed.rank) : rankName,
    also: day.dayname[2]?.trim() || undefined,
  }
}

/** One hour of a breviary for a date. */
export async function loadOfficeHour(
  date: Date,
  hour: OfficeHour,
  locale: Locale,
  form: Pick<OfficeForm, 'version' | 'votive'> = { version: 'rubrics-1960', votive: 'Hodie' },
): Promise<Primitive[]> {
  await bootCorpus()
  const ctx = {
    params: { hour, version: form.version, votive: form.votive, date: isoDate(date) },
    prefs: { lang: locale, translation: 'DRB', jurisdiction: jurisdiction[locale] },
    date,
    queryClient: new QueryClient(),
  } as unknown as SourceFetchContext
  return withLocale(locale, () => doHourSource.fetch(ctx))
}

export const breviaryName = doVersionNames['rubrics-1960']
