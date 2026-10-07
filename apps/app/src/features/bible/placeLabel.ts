import type { TFunction } from 'i18next'

import { jewelTones } from '@/features/explore/bgColor'

/** A ribbon's tone on stamps and covers, in the order the drawer colours them. */
export const ribbonTones = [jewelTones.red, jewelTones.gold, jewelTones.green]

/** "today", "yesterday", or the day and month a place was last read. */
export function placeWhen(updatedAt: number, t: TFunction, language: string): string {
  const startOfToday = new Date().setHours(0, 0, 0, 0)
  if (updatedAt >= startOfToday) return t('bible.places.today')
  if (updatedAt >= startOfToday - 86_400_000) return t('bible.places.yesterday')
  return new Date(updatedAt).toLocaleDateString(language, { day: 'numeric', month: 'short' })
}
