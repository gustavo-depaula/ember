import type { ProposedService } from '@ember/api/src/moderation'
import type { Service } from '@ember/api/src/schema'

// Reading and writing a schedule the way a moderator thinks of it (days and times) while the
// record keeps it as rrules.

export const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
export type Lang = 'en' | 'pt'

const words = {
  en: {
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
    ordinals: { '1': '1st', '2': '2nd', '3': '3rd', '4': '4th', '5': '5th', '-1': 'last' },
    everyDay: 'Every day',
    ofTheMonth: 'of the month',
  },
  pt: {
    days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
    months: 'jan fev mar abr mai jun jul ago set out nov dez'.split(' '),
    ordinals: { '1': '1º', '2': '2º', '3': '3º', '4': '4º', '5': '5º', '-1': 'último' },
    everyDay: 'Todos os dias',
    ofTheMonth: 'do mês',
  },
} satisfies Record<Lang, unknown>

export const serviceKinds = ['mass', 'confession', 'adoration'] as const
export const kindLabels: Record<string, string> = {
  mass: 'Mass',
  confession: 'Confession',
  adoration: 'Adoration',
}

// The rites a Mass can be tagged with, as a moderator reads them. An unknown value shows as it is.
export const riteLabels: Record<string, string> = {
  latin_novus_ordo: 'Novus Ordo',
  latin_tridentine: 'Tridentine',
  byzantine: 'Byzantine',
  maronite: 'Maronite',
  chaldean: 'Chaldean',
  syro_malabar: 'Syro-Malabar',
  melkite: 'Melkite',
  ukrainian_greek: 'Ukrainian Greek',
  ordinariate_divine_worship: 'Ordinariate',
}

export const serviceContent = [
  'kind',
  'rite',
  'language',
  'rrule',
  'startTime',
  'endTime',
  'exdate',
  'rdate',
  'locationNote',
  'note',
] as const

function ruleParts(rrule: string): Record<string, string> {
  return Object.fromEntries(rrule.split(';').map((part) => part.split('=') as [string, string]))
}

// The weekdays of a rule that is nothing more than "these days, every week", else undefined.
export function weeklyDays(rrule: string): number[] | undefined {
  const { FREQ, BYDAY, INTERVAL, ...rest } = ruleParts(rrule)
  if (Object.keys(rest).length > 0 || (INTERVAL && INTERVAL !== '1')) return undefined
  if (FREQ === 'DAILY' && !BYDAY) return [0, 1, 2, 3, 4, 5, 6]
  if (FREQ !== 'WEEKLY' || !BYDAY) return undefined
  const days = BYDAY.split(',').map((code) => dayCodes.indexOf(code))
  return days.every((day) => day >= 0) ? days.sort() : undefined
}

export function weeklyRule(days: number[]): string {
  return `FREQ=WEEKLY;BYDAY=${[...days]
    .sort()
    .map((day) => dayCodes[day])
    .join(',')}`
}

function dayList(days: number[], lang: Lang): string {
  const names = words[lang].days
  if (days.length === 7) return words[lang].everyDay
  const run = days.every((day, i) => i === 0 || day === days[i - 1] + 1)
  if (run && days.length > 2) return `${names[days[0]]}–${names[days[days.length - 1]]}`
  return days.map((day) => names[day]).join(', ')
}

// A rule in words, falling back to the rule itself for the patterns a parish rarely uses.
export function describeRule(rrule: string, lang: Lang = 'en'): string {
  const weekly = weeklyDays(rrule)
  if (weekly) return dayList(weekly, lang)

  const { FREQ, BYDAY, BYMONTH, ...rest } = ruleParts(rrule)
  if (Object.keys(rest).length > 0 || !BYDAY) return rrule
  const months = BYMONTH
    ? ` (${BYMONTH.split(',')
        .map((month) => words[lang].months[Number(month) - 1])
        .join(', ')})`
    : ''
  if (FREQ === 'WEEKLY') {
    const days = BYDAY.split(',').map((code) => dayCodes.indexOf(code))
    return days.every((day) => day >= 0) ? `${dayList(days.sort(), lang)}${months}` : rrule
  }
  if (FREQ === 'MONTHLY') {
    const ordinals: Record<string, string> = words[lang].ordinals
    const days = BYDAY.split(',').map((token) => {
      const match = /^([+-]?\d)([A-Z]{2})$/.exec(token)
      const day = match ? dayCodes.indexOf(match[2]) : -1
      return match && day >= 0 && ordinals[match[1]]
        ? `${ordinals[match[1]]} ${words[lang].days[day]}`
        : ''
    })
    return days.every(Boolean) ? `${days.join(', ')} ${words[lang].ofTheMonth}${months}` : rrule
  }
  return rrule
}

export function describeTime(service: Pick<Service, 'startTime' | 'endTime'>): string {
  return service.endTime ? `${service.startTime}–${service.endTime}` : service.startTime
}

export function describeService(service: ProposedService | Service, lang: Lang = 'en'): string {
  return `${describeRule(service.rrule, lang)} ${describeTime(service)}`
}

// A stored service as a draft entry: its content and the id that ties it back.
export function asProposed(service: Service): ProposedService {
  return Object.fromEntries(
    (['id', ...serviceContent] as const).flatMap((key) =>
      service[key] ? [[key, service[key]]] : [],
    ),
  ) as ProposedService
}

export function sameContent(a: ProposedService | Service, b: ProposedService | Service): boolean {
  return serviceContent.every((key) => (a[key] || undefined) === (b[key] || undefined))
}

export type ScheduleRow =
  | { state: 'same' | 'changed'; service: ProposedService; index: number; before: Service }
  | { state: 'added'; service: ProposedService; index: number }
  | { state: 'removed'; before: Service }

// The proposed schedule set against the stored one. `index` points into the proposed list.
export function diffSchedule(before: Service[], after: ProposedService[]): ScheduleRow[] {
  const rows: ScheduleRow[] = after.map((service, index) => {
    const prior = service.id ? before.find((candidate) => candidate.id === service.id) : undefined
    if (!prior) return { state: 'added', service, index }
    return {
      state: sameContent(prior, service) ? 'same' : 'changed',
      service,
      index,
      before: prior,
    }
  })
  const kept = new Set(after.map((service) => service.id))
  const removed: ScheduleRow[] = before
    .filter((service) => !kept.has(service.id))
    .map((service) => ({ state: 'removed', before: service }))
  const service = (row: ScheduleRow) => (row.state === 'removed' ? row.before : row.service)
  return [...rows, ...removed].sort((a, b) => bulletinOrder(service(a), service(b)))
}

// Bulletin order: by first weekday, then by the clock; the patterns a week can't hold go last.
export function bulletinOrder(a: ProposedService | Service, b: ProposedService | Service): number {
  const key = (service: ProposedService | Service) =>
    `${weeklyDays(service.rrule)?.[0] ?? 9}${service.startTime.padStart(5, '0')}`
  return key(a).localeCompare(key(b))
}
