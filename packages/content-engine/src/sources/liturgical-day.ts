import {
  getLiturgicalDayName,
  type LiturgicalDayMap,
  resolveLiturgicalDay,
} from '@ember/liturgical'
import type { DataSource } from '../data-sources'
import type { RepeatEntry } from '../types'

function isLiturgicalDayMap(value: unknown): value is LiturgicalDayMap {
  if (!value || typeof value !== 'object') return false
  const map = value as Partial<LiturgicalDayMap>
  return (
    typeof map.temporal === 'object' &&
    map.temporal !== null &&
    typeof map.fixedDates === 'object' &&
    map.fixedDates !== null &&
    typeof map.feasts === 'object' &&
    map.feasts !== null &&
    typeof map.novenas === 'object' &&
    map.novenas !== null &&
    Array.isArray(map.reserves)
  )
}

/**
 * Resolves today's liturgical day from a per-practice liturgical-map data file.
 *
 * Args: `data` (the data declaration name, read via ctx.fetchOwnAsset) and
 * `calendar` ('ef' | 'of', default 'ef'). Binds
 * `{ liturgicalLabel, alternatives: RepeatEntry[] }` — the localized day name
 * and the matching map entries, one chapterId each.
 */
export const liturgicalDaySource: DataSource = {
  async load(args, ctx) {
    const { data, calendar } = args as { data?: string; calendar?: 'ef' | 'of' }
    if (!data) return undefined

    const map = await ctx.fetchOwnAsset(data)
    if (!isLiturgicalDayMap(map)) return undefined

    const date = ctx.now()
    const form = calendar ?? 'ef'

    const alternatives: RepeatEntry[] = resolveLiturgicalDay(date, map).map((e) => ({
      chapterId: e.id,
      category: e.category,
    }))

    const liturgicalLabel = getLiturgicalDayName(date, form, { t: ctx.t }, ctx.ofTransfers)

    return { liturgicalLabel, alternatives }
  },
}
