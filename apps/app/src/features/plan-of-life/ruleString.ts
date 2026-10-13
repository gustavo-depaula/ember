import type { TFunction } from 'i18next'

import { dayKeys } from '@/config/constants'
import { getManifest } from '@/content/resolver'
import type { SlotState } from '@/db/events'
import type { Tier } from '@/db/schema'

import { parseSchedule } from './schedule'
import { type DayPart, dayPartOfHour } from './timeBlocks'

// The rule drawn as a string of beads: one bead per prayer time, in the day's
// order, coloured by the hour it falls in and sized by its tier.

export const beadRadius: Record<Tier, number> = { essential: 9, ideal: 7, extra: 5 }

// The sun's day, one hue per part: rose at dawn, gold climbing to a pale noon,
// amber as it sinks, then violet and blue. The light theme's are deeper so
// they hold on white.
const hues: Record<'dark' | 'light', Record<Exclude<DayPart, 'flexible'>, string>> = {
  dark: {
    dawn: '#E2849A',
    morning: '#E3B04B',
    midday: '#F0DC8C',
    afternoon: '#DE8F48',
    evening: '#B07FD0',
    night: '#6F95D8',
  },
  light: {
    dawn: '#C2567A',
    morning: '#B8871F',
    midday: '#CDAA00',
    afternoon: '#C0651E',
    evening: '#8E5BB0',
    night: '#4A6FB5',
  },
}

export function hourHue(time: string | null, dark: boolean): string {
  const palette = dark ? hues.dark : hues.light
  if (!time) return palette.morning
  const part = dayPartOfHour(Number.parseInt(time.slice(0, 2), 10))
  return part === 'flexible' ? palette.morning : palette[part]
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
