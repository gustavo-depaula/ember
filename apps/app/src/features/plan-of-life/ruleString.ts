import type { TFunction } from 'i18next'

import { dayKeys } from '@/config/constants'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import type { Tier } from '@/db/schema'

import { parseSchedule } from './schedule'

// The rule drawn as a string of beads: one bead per prayer time, in the day's
// order, coloured by the hour it falls in and sized by its tier.

export const beadRadius: Record<Tier, number> = { essential: 9, ideal: 7, extra: 5 }

// Dawn, day, dusk, night. The light theme's are deeper so they hold on white.
const hues = {
  dark: { dawn: '#E08A6E', day: '#E3B04B', dusk: '#B07FD0', night: '#6F95D8' },
  light: { dawn: '#C8664A', day: '#B8871F', dusk: '#8E5BB0', night: '#4A6FB5' },
}

export function hourHue(time: string | null, dark: boolean): string {
  const palette = dark ? hues.dark : hues.light
  if (!time) return palette.day
  const hour = Number.parseInt(time.slice(0, 2), 10)
  if (hour < 7) return palette.dawn
  if (hour < 17) return palette.day
  if (hour < 21) return palette.dusk
  return palette.night
}

/** A novena or other program runs its course; the string holds the lasting rule. */
export function isProgramSlot(slot: SlotState): boolean {
  return getManifest(slot.practice_id)?.program !== undefined
}

/**
 * The days a some-days time falls on, short: "sex", "ter–sex", "sáb · dom", or
 * the cadence word for a monthly or holy-day rule. Undefined for every day.
 */
export function slotDaysLabel(slot: SlotState, t: TFunction): string | undefined {
  const schedule = parseSchedule(slot.schedule)
  switch (schedule.type) {
    case 'daily':
      return undefined
    case 'days-of-week': {
      // Monday-first, so a Saturday–Sunday weekend reads as one run.
      const order = [1, 2, 3, 4, 5, 6, 0]
      const days = order.filter((d) => schedule.days.includes(d))
      if (days.length === 7) return undefined
      const name = (d: number) => t(`day.${dayKeys[d]}`).toLowerCase()
      const runs: number[][] = []
      for (const d of days) {
        const run = runs.at(-1)
        if (run && order.indexOf(d) === order.indexOf(run.at(-1) as number) + 1) run.push(d)
        else runs.push([d])
      }
      return runs
        .map((run) =>
          run.length > 2
            ? `${name(run[0])}–${name(run.at(-1) as number)}`
            : run.map(name).join(' · '),
        )
        .join(' · ')
    }
    case 'day-of-month':
    case 'nth-weekday':
      return t('frequency.monthly').toLowerCase()
    case 'holy-days-of-obligation':
      return t('frequency.holyDays').toLowerCase()
    case 'ember-days':
      return t('frequency.emberDays').toLowerCase()
    default:
      return t('timeBlock.flexible').toLowerCase()
  }
}

/** "07:30" as the locale says it: "7h30" in Portuguese, "7:30 AM" in English. */
export function formatSlotTime(time: string, locale: string): string {
  const [h, m] = time.split(':').map(Number)
  if (locale.startsWith('pt')) return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
  const d = new Date(2000, 0, 1, h || 0, m || 0)
  return d.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
}
