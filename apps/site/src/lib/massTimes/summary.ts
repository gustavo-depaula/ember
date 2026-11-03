// A church's week in one line, as a search result can show it: "dom 7h, 9h e 19h · seg a sex
// 18h30 · sáb 17h". Searchers look a church up to learn its times, so the description that carries
// them is the one they choose.
import type { Service, ServiceKind } from '@ember/api'
import { weeklySchedule } from '@/lib/mass-times/weekly'
import type { Locale } from '~/lib/locale'

const dayNames: Record<Locale, string[]> = {
  'pt-BR': ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'],
  'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}

function clock(time: string, locale: Locale) {
  const [h, m] = time.split(':').map(Number)
  if (locale === 'pt-BR') return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
  return `${h}:${String(m || 0).padStart(2, '0')}`
}

function list(items: string[], locale: Locale) {
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format(items)
}

/** The week's times for one kind of service, the days that share their times run together. */
export function weekLine(services: Service[], kind: ServiceKind, locale: Locale): string {
  const names = dayNames[locale]
  // Sunday leads: it is the Mass most searched for.
  const { days } = weeklySchedule(services, kind)
  const sunday = days.filter((d) => d.dow === 0)
  const week = days.filter((d) => d.dow !== 0)
  const runs: { from: number; to: number; times: string[] }[] = []
  for (const day of week) {
    const last = runs[runs.length - 1]
    if (last && last.to === day.dow - 1 && last.times.join() === day.times.join()) last.to = day.dow
    else runs.push({ from: day.dow, to: day.dow, times: day.times })
  }
  const through = locale === 'pt-BR' ? ' a ' : '–'
  return [...sunday.map((d) => ({ from: 0, to: 0, times: d.times })), ...runs]
    .map(({ from, to, times }) => {
      const label = (() => {
        if (from === to) return names[from]
        if (to === from + 1) return `${names[from]}, ${names[to]}`
        return `${names[from]}${through}${names[to]}`
      })()
      return `${label} ${list(
        times.map((t) => clock(t, locale)),
        locale,
      )}`
    })
    .join(' · ')
}
