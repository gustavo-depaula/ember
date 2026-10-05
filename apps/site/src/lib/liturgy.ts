import {
  buildDoYear,
  type DoCalendarDay,
  doVersionNames,
  efVersion,
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
import { buildOfYearCalendar, type OfCelebration, resolveOfDay } from '@ember/mass'
import type { MassFormulary } from '@ember/missal-schema'
import { QueryClient } from '@tanstack/react-query'
import type { Primitive } from '@/content/primitives'
import { localizeContent } from '@/lib/i18n'
import { loadMassFormulary, loadOfCalendar, scopeForContentLang } from '@/lib/mass-of/loaders'
import { resolveReadingSet } from '@/lib/mass-of/readings'
import { doHourSource } from '@/sources/divinum-officium/do-hour'
import { createCorpusDoLoader } from '@/sources/divinum-officium/loader'
import type { SourceFetchContext } from '@/sources/types'
import { isoDate, type OfficeHour } from '~/routes'
import { ofTexts } from './config'
import { bootCorpus } from './corpus'
import { type Locale, translator, withLocale } from './locale'
import { renderPractice } from './practice'

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
      const statics = await loadOfCalendar()
      if (!statics) throw new Error('OF calendar missing from the corpus')
      return buildOfYearCalendar({ year, statics, scope: scopeForContentLang(locale) })
    })()
    ofYears.set(key, pending)
  }
  return pending
}

function rankKeyOf(c: OfCelebration): string {
  return c.rank.replace('-', '_')
}

export async function loadOfDay(date: Date, locale: Locale): Promise<OfDayView> {
  await bootCorpus()
  const t = translator(locale)
  const statics = await loadOfCalendar()
  if (!statics) throw new Error('OF calendar missing from the corpus')
  const day = resolveOfDay(date, statics, { scope: scopeForContentLang(locale) })
  const calendar = await ofYear(date.getFullYear(), locale)
  return withLocale(locale, async () => {
    const dayName = getLiturgicalDayName(date, 'of', { t })
    const formularies = new Map<string, MassFormulary | undefined>()
    for (const ref of [...day.celebrations.map((c) => c.ref), day.temporalRef]) {
      if (ref && !formularies.has(ref)) formularies.set(ref, await loadMassFormulary(ref))
    }
    const celebrations = day.celebrations.map((c): CelebrationView => {
      const formulary = formularies.get(c.ref)
      const rankKey = rankKeyOf(c)
      return {
        ref: c.ref,
        title:
          (c.title && localizeContent(c.title as Localized)) ||
          (formulary?.title && localizeContent(formulary.title as Localized)) ||
          dayName,
        rank: t(`calendar.rank.${rankKey}`, { defaultValue: '' }),
        rankKey,
        color: formulary?.color,
        commemoration: c.mode === 'commemoration',
        about:
          ofTexts && formulary?.description
            ? localizeContent(formulary.description as Localized) || undefined
            : undefined,
      }
    })
    const principal = day.celebrations[0]
    const formulary = principal && formularies.get(principal.ref)
    const set =
      formulary &&
      resolveReadingSet({
        formulary,
        temporal: day.temporalRef ? formularies.get(day.temporalRef) : undefined,
        cycle: day.cycle,
        weekdayCycle: day.weekdayCycle,
      })
    const cite = (slot: ReadingCitation['slot'], option: { citation?: Localized } | undefined) => {
      const citation =
        option?.citation &&
        (option.citation[locale] ?? option.citation['en-US'] ?? option.citation.la)
      return citation ? [{ slot, citation }] : []
    }
    const obligations = getDayObligations(date, 'of', locale === 'pt-BR' ? 'BR' : 'US', calendar)
    return {
      date,
      dayName,
      season: getLiturgicalSeason(date, 'of'),
      seasonName: t(`home.seasonName.${getLiturgicalSeason(date, 'of')}`),
      color: celebrations[0]?.color,
      cycle: date.getDay() === 0 ? day.cycle : `${day.cycle} · ${day.weekdayCycle}`,
      celebrations,
      readings: [
        ...cite('first', set?.firstReading?.options[0]),
        ...cite('psalm', set?.psalm?.options[0]),
        ...cite('second', set?.secondReading?.options[0]),
        ...cite('gospel', set?.gospel?.options[0]),
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
          getLiturgicalDayName(date, 'of', { t }),
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
  const day = await resolveDay({
    loader: doLoader(),
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    version: efVersion,
  })
  const named = (await efYear(date.getFullYear())).get(`${date.getMonth() + 1}-${date.getDate()}`)
  // dayname[1] is the office of the day as "Name\tRank". The year calendar's
  // entry may be a saint the day only commemorates, so it is asked for the
  // holy day alone.
  const [name, rank] = (day.dayname[1] ?? '').split('\t')
  return {
    name: name.trim(),
    rankText: rank?.trim() ?? '',
    commemoration: day.dayname[2]?.trim() || undefined,
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

/** One hour of the Roman Breviary (rubrics of 1960) for a date. */
export async function loadOfficeHour(
  date: Date,
  hour: OfficeHour,
  locale: Locale,
): Promise<Primitive[]> {
  await bootCorpus()
  const ctx = {
    params: { hour, version: 'rubrics-1960', date: isoDate(date) },
    prefs: { lang: locale, translation: 'DRB' },
    date,
    queryClient: new QueryClient(),
  } as unknown as SourceFetchContext
  return withLocale(locale, () => doHourSource.fetch(ctx))
}

export const breviaryName = doVersionNames['rubrics-1960']
