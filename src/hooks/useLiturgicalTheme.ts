import { addDays } from 'date-fns'

import {
  computeEaster,
  getFirstSundayOfAdvent,
  getLiturgicalSeason,
  type LiturgicalCalendarForm,
  type LiturgicalSeason,
  normalizeDate,
} from '@/lib/liturgical'
import { usePreferencesStore } from '@/stores/preferencesStore'

export type LiturgicalThemeName = LiturgicalSeason | 'rose'

export function useLiturgicalTheme(): {
  season: LiturgicalSeason
  themeName: LiturgicalThemeName
} {
  const form = usePreferencesStore((s) => s.liturgicalCalendar) as LiturgicalCalendarForm
  const now = new Date()
  const season = getLiturgicalSeason(now, form)

  const d = normalizeDate(now)
  const year = d.getFullYear()
  const easter = computeEaster(year)
  const advent1 = getFirstSundayOfAdvent(year)
  const gaudete = addDays(advent1, 14)
  const laetare = addDays(easter, -21)
  const time = d.getTime()

  const isRose =
    time === normalizeDate(gaudete).getTime() || time === normalizeDate(laetare).getTime()

  return { season, themeName: isRose ? 'rose' : season }
}
