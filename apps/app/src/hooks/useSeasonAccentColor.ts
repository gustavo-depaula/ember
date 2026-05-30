import { addDays } from 'date-fns'
import { useThemeName } from 'tamagui'
import { seasonalAccent } from '@/config/themes'
import {
  computeEaster,
  getFirstSundayOfAdvent,
  type LiturgicalSeason,
  normalizeDate,
} from '@/lib/liturgical'

// The home LiturgicalHeader's Fraktur season hero is the one element still
// tinted by the liturgical season. Given the displayed date and its season,
// resolve the accent color — rose on Gaudete / Laetare, the season's color
// otherwise — for the active light/dark scheme.
export function useSeasonAccentColor(season: LiturgicalSeason, date: Date): string {
  const isDark = useThemeName().startsWith('dark')

  const d = normalizeDate(date)
  const year = date.getFullYear()
  const gaudete = addDays(getFirstSundayOfAdvent(year), 14)
  const laetare = addDays(computeEaster(year), -21)
  const isRose =
    d.getTime() === normalizeDate(gaudete).getTime() ||
    d.getTime() === normalizeDate(laetare).getTime()

  const key = isRose ? 'rose' : season
  return seasonalAccent[key][isDark ? 'dark' : 'light']
}
