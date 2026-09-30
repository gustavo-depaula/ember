import type { Grant } from '@ember/holy-cards'
import { addDays, format, parseISO } from 'date-fns'
import type { TFunction } from 'i18next'

import i18n from '@/lib/i18n'

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

/** How the card was won: "Received at Mass · 4 Oct 2026". */
export function howWon(grant: Grant, t: TFunction) {
  const date = localDate(grant.date, 'short')
  if (grant.door === 'mass' || grant.door === 'office' || grant.door === 'starter') {
    return t(`saints.redeem.door.${grant.door}`, { date })
  }
  return t('saints.redeem.door.other', { date })
}

/** When the envelope must be opened by; undefined when it has no window. */
export function openBy(grant: Grant, today: string, t: TFunction) {
  if (!grant.deadline) return undefined
  if (grant.deadline <= today) return t('saints.redeem.openBy.today')
  if (grant.deadline === format(addDays(parseISO(today), 1), 'yyyy-MM-dd')) {
    return t('saints.redeem.openBy.tomorrow')
  }
  return t('saints.redeem.openBy.date', { date: localDate(grant.deadline, 'short') })
}
