import type { Door, Grant } from '@ember/holy-cards'
import { addDays, format, parseISO } from 'date-fns'
import type { TFunction } from 'i18next'

import i18n from '@/lib/i18n'

// Intl rather than date-fns: its long date reads naturally in each language
// ("September 30, 2026", "30 de setembro de 2026"), where date-fns' `PPP` puts
// an ordinal in English.
function localDate(iso: string, month: 'long' | 'short') {
  return new Intl.DateTimeFormat(i18n.language || 'en-US', {
    day: 'numeric',
    month,
    year: 'numeric',
  }).format(parseISO(iso))
}

/** The day written on the envelope, under the saint's name. */
export function envelopeDate(grant: Grant) {
  return localDate(grant.date, 'long')
}

const namedDoors: readonly string[] = ['mass', 'office', 'starter', 'novena']

/** How a card was won, for its envelope or a copy's back: "Received at Mass · 4 Oct 2026". */
export function howWon({ door, date }: { door: Door; date: string }, t: TFunction) {
  const named = namedDoors.includes(door) ? door : 'other'
  return t(`saints.redeem.door.${named}`, { date: localDate(date, 'short') })
}

/** When the envelope must be opened by; undefined when it has no window. */
export function openBy(grant: Grant, today: Date, t: TFunction) {
  if (!grant.deadline) return undefined
  if (grant.deadline <= format(today, 'yyyy-MM-dd')) return t('saints.redeem.openBy.today')
  if (grant.deadline === format(addDays(today, 1), 'yyyy-MM-dd')) {
    return t('saints.redeem.openBy.tomorrow')
  }
  return t('saints.redeem.openBy.date', { date: localDate(grant.deadline, 'short') })
}
