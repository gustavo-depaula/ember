import { addDays, parseISO } from 'date-fns'

import type { LiturgicalSeason } from '@/lib/liturgical'

import type { Schedule } from './schedule'

/**
 * The rule written as prose — "às segundas, quartas e sextas", "at 6:30 am".
 * Written per language rather than through i18n keys: Portuguese takes a
 * different article per weekday (às sextas, aos sábados) and per ordinal
 * (na primeira sexta-feira, no primeiro sábado), which no key template holds.
 */
type Phrasing = {
  days: (schedule: Schedule) => string
  time: (time: string) => string
  times: (times: string[]) => string
  /** The word that closes a list: "e", "and". */
  and: string
  /** "às 15h" with no time set yet: the question the sentence ends on. */
  noTime: string
  /** The hour as a clock face shows it: "15:00", "3:00 pm". */
  clock: (time: string) => string
  /**
   * Where days held by another time already are: "sexta já está no horário
   * das 15h", or — when they are every day but this time's — "os outros dias
   * estão no horário das 7h".
   */
  taken: (days: number[], time: string | undefined, others: boolean) => string
}

export function phrasing(language: string): Phrasing {
  return language.startsWith('pt') ? pt : en
}

export function capitalize(s: string): string {
  return s.charAt(0).toLocaleUpperCase() + s.slice(1)
}

// Weekdays in the week's reading order, Monday first, so "de segunda a sexta"
// is a run and Sunday closes the week.
const weekOrder = [1, 2, 3, 4, 5, 6, 0]

/** Sorted in reading order, and whether the days form one unbroken run of 3+. */
function readDays(days: number[]): { ordered: number[]; run: boolean } {
  const ordered = weekOrder.filter((d) => days.includes(d))
  const positions = ordered.map((d) => weekOrder.indexOf(d))
  const run =
    ordered.length >= 3 && positions.every((p, i) => i === 0 || p === positions[i - 1] + 1)
  return { ordered, run }
}

function joinList(items: string[], and: string): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ${and} ${items.at(-1)}`
}

function hm(time: string): { h: number; m: number } {
  const [h, m] = time.split(':').map(Number)
  return { h: h || 0, m: m || 0 }
}

const ptWeekday = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const ptWeekdayFull = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]
const ptMasculine = (d: number) => d === 0 || d === 6
const ptOrdinal: Record<number, [string, string]> = {
  1: ['primeiro', 'primeira'],
  2: ['segundo', 'segunda'],
  3: ['terceiro', 'terceira'],
  4: ['quarto', 'quarta'],
  [-1]: ['último', 'última'],
}
const ptSeason: Partial<Record<LiturgicalSeason, string>> = {
  advent: 'no Advento',
  christmas: 'no Tempo do Natal',
  lent: 'na Quaresma',
  easter: 'no Tempo Pascal',
  ordinary: 'no Tempo Comum',
}

const ptMonth = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

// A program's span, its first and last day: the month is named once when
// both fall in it.
function programSpan(schedule: { totalDays: number; startDate: string }) {
  const first = parseISO(schedule.startDate)
  const last = addDays(first, schedule.totalDays - 1)
  return { first, last, sameMonth: first.getMonth() === last.getMonth() }
}

function ptDays(schedule: Schedule): string {
  const season = seasonSuffix(schedule, ptSeason, ' e ')
  switch (schedule.type) {
    case 'daily':
      return `todos os dias${season}`
    case 'fixed-program': {
      if (!schedule.startDate) return 'todos os dias'
      const { first, last, sameMonth } = programSpan(schedule)
      const from = sameMonth
        ? `${first.getDate()}`
        : `${first.getDate()} de ${ptMonth[first.getMonth()]}`
      return `de ${from} a ${last.getDate()} de ${ptMonth[last.getMonth()]}`
    }
    case 'days-of-week': {
      const { ordered, run } = readDays(schedule.days)
      if (ordered.length === 7) return `todos os dias${season}`
      if (ordered.length === 2 && ordered[0] === 6 && ordered[1] === 0) {
        return `aos fins de semana${season}`
      }
      if (run) return `de ${ptWeekday[ordered[0]]} a ${ptWeekday[ordered.at(-1) ?? 0]}${season}`
      // One article per change of gender: "às quartas, sextas e aos sábados".
      const items = ordered.map((d, i) => {
        const plural = `${ptWeekday[d]}s`
        const sameAsBefore = i > 0 && ptMasculine(ordered[i - 1]) === ptMasculine(d)
        if (sameAsBefore) return plural
        return `${ptMasculine(d) ? 'aos' : 'às'} ${plural}`
      })
      return `${joinList(items, 'e')}${season}`
    }
    case 'nth-weekday': {
      const g = ptMasculine(schedule.day) ? 0 : 1
      const article = g === 0 ? 'no' : 'na'
      const ordinals = [...schedule.n].sort((a, b) => (a === -1 ? 9 : a) - (b === -1 ? 9 : b))
      const named = ordinals.map(
        (n, i) => `${i === 0 ? '' : `${article} `}${ptOrdinal[n]?.[g] ?? n}`,
      )
      return `${article} ${joinList(named, 'e')} ${ptWeekdayFull[schedule.day]} do mês${season}`
    }
    case 'day-of-month': {
      const days = [...schedule.days].sort((a, b) => a - b)
      const which =
        days.length === 1 ? `no dia ${days[0]}` : `nos dias ${joinList(days.map(String), 'e')}`
      return `${which} de cada mês${season}`
    }
    case 'holy-days-of-obligation':
      return 'nos dias santos de guarda'
    case 'periodic-series':
      return ptDays({ ...schedule.rule, seasons: schedule.seasons } as Schedule)
  }
}

function ptTime(time: string): string {
  const { h, m } = hm(time)
  if (h === 12 && m === 0) return 'ao meio-dia'
  if (h === 0 && m === 0) return 'à meia-noite'
  const clock = m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
  return `${h === 1 ? 'à' : 'às'} ${clock}`
}

// "no horário das 15h", "do meio-dia", "da 1h".
function ptOfTime(time: string | undefined): string {
  if (!time) return 'em outro horário'
  const { h, m } = hm(time)
  if (h === 12 && m === 0) return 'no horário do meio-dia'
  if (h === 0 && m === 0) return 'no horário da meia-noite'
  const clock = m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`
  return `no horário ${h === 1 ? 'da' : 'das'} ${clock}`
}

const pt: Phrasing = {
  days: ptDays,
  time: ptTime,
  and: 'e',
  times: (times) => joinList(times.map(ptTime), 'e'),
  noTime: 'a que horas?',
  clock: (time) => {
    const { h, m } = hm(time)
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  },
  taken: (days, time, others) => {
    if (others) return `os outros dias estão ${ptOfTime(time)}`
    const names = weekOrder.filter((d) => days.includes(d)).map((d) => ptWeekday[d])
    const verb = names.length > 1 ? 'já estão' : 'já está'
    return `${joinList(names, 'e')} ${verb} ${ptOfTime(time)}`
  },
}

const enWeekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const enOrdinal: Record<number, string> = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  [-1]: 'last',
}
const enSeason: Partial<Record<LiturgicalSeason, string>> = {
  advent: 'in Advent',
  christmas: 'at Christmastide',
  lent: 'in Lent',
  easter: 'in Eastertide',
  ordinary: 'in Ordinary Time',
}

const enMonth = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function enDays(schedule: Schedule): string {
  const season = seasonSuffix(schedule, enSeason, ' and ')
  switch (schedule.type) {
    case 'daily':
      return `every day${season}`
    case 'fixed-program': {
      if (!schedule.startDate) return 'every day'
      const { first, last, sameMonth } = programSpan(schedule)
      const from = `${enMonth[first.getMonth()]} ${first.getDate()}`
      const to = sameMonth ? `${last.getDate()}` : `${enMonth[last.getMonth()]} ${last.getDate()}`
      return `from ${from} to ${to}`
    }
    case 'days-of-week': {
      const { ordered, run } = readDays(schedule.days)
      if (ordered.length === 7) return `every day${season}`
      if (ordered.length === 2 && ordered[0] === 6 && ordered[1] === 0) {
        return `on weekends${season}`
      }
      if (run) return `${enWeekday[ordered[0]]} to ${enWeekday[ordered.at(-1) ?? 0]}${season}`
      return `on ${joinList(
        ordered.map((d) => `${enWeekday[d]}s`),
        'and',
      )}${season}`
    }
    case 'nth-weekday': {
      const ordinals = [...schedule.n].sort((a, b) => (a === -1 ? 9 : a) - (b === -1 ? 9 : b))
      const plural = ordinals.length > 1 ? 's' : ''
      return `on the ${joinList(
        ordinals.map((n) => enOrdinal[n] ?? String(n)),
        'and',
      )} ${enWeekday[schedule.day]}${plural} of the month${season}`
    }
    case 'day-of-month': {
      const days = [...schedule.days].sort((a, b) => a - b).map(enNth)
      return `on the ${joinList(days, 'and')} of each month${season}`
    }
    case 'holy-days-of-obligation':
      return 'on holy days of obligation'
    case 'periodic-series':
      return enDays({ ...schedule.rule, seasons: schedule.seasons } as Schedule)
  }
}

function enNth(n: number): string {
  const tail =
    n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th')
  return `${n}${tail}`
}

function enTime(time: string): string {
  const { h, m } = hm(time)
  if (h === 12 && m === 0) return 'at noon'
  if (h === 0 && m === 0) return 'at midnight'
  const hour = h % 12 === 0 ? 12 : h % 12
  const clock = m === 0 ? `${hour}` : `${hour}:${String(m).padStart(2, '0')}`
  return `at ${clock} ${h < 12 ? 'am' : 'pm'}`
}

const en: Phrasing = {
  days: enDays,
  time: enTime,
  and: 'and',
  times: (times) => joinList(times.map(enTime), 'and'),
  noTime: 'at what time?',
  clock: (time) => {
    const { h, m } = hm(time)
    return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
  },
  taken: (days, time, others) => {
    const at = time ? enTime(time) : 'at another time'
    if (others) return `the other days are ${at}`
    const names = weekOrder.filter((d) => days.includes(d)).map((d) => enWeekday[d])
    return `${joinList(names, 'and')} ${names.length > 1 ? 'are' : 'is'} already ${at}`
  },
}

function seasonSuffix(
  schedule: Schedule,
  names: Partial<Record<LiturgicalSeason, string>>,
  and: string,
): string {
  const named = (schedule.seasons ?? []).map((s) => names[s]).filter(Boolean) as string[]
  if (named.length === 0) return ''
  return ` ${joinList(named, and.trim())}`
}
