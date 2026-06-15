import type {
  DayCalendar,
  LiturgicalCategory,
  LocalizedText,
  RankOF,
  ResolvedCelebration,
} from '@ember/liturgical'
import type { Localized, OfCalendarStatics, Rank } from '@ember/missal-schema'
import { addDays, format } from 'date-fns'
import { isOfHolyDay } from './hdo'
import { resolveOfDay } from './resolve'
import type { Scope } from './sanctoral'
import { isNotableTemporal } from './temporal-notability'

/**
 * Build the OF *display* calendar for a whole year from the same authority the
 * Mass uses — `resolveOfDay` over the canonical MR statics — so the celebration
 * card and month grid show exactly what the Mass celebrates (Sacred Heart,
 * Corpus Christi, transferred Ascension, …) instead of a separately-curated and
 * drift-prone list.
 *
 * Output matches `@ember/liturgical`'s `buildYearCalendar` shape (the EF path is
 * untouched), so every existing consumer keeps working: a `ResolvedCelebration`
 * with a synthesized partial `LiturgicalEntry` (`id` = the formulary/temporal
 * ref, `holyDayOfObligation` from `hdo.ts`). Sanctoral celebrations carry their
 * title from the statics; **temporal celebrations carry no name** — the temporal
 * cycle has no title in the data, so the UI resolves it from the Mass formulary
 * (the single source of truth for titles + descriptions), with
 * `getLiturgicalDayName` as a fallback.
 *
 * Only *named* celebrations are surfaced: every sanctoral celebration, plus the
 * temporal solemnities/feasts of the Lord (via {@link isNotableTemporal}).
 * Ordinary Sundays and ferias are deliberately omitted (the season header
 * conveys them), preserving the prior display semantics.
 */
export type OfYearOptions = {
  year: number
  statics: OfCalendarStatics
  scope?: Scope
}

export function buildOfYearCalendar({
  year,
  statics,
  scope = 'universal',
}: OfYearOptions): Map<string, DayCalendar> {
  const map = new Map<string, DayCalendar>()
  const end = new Date(year, 11, 31)

  for (let date = new Date(year, 0, 1); date <= end; date = addDays(date, 1)) {
    const day = new Date(date)
    const resolved = resolveOfDay(day, statics, { scope })

    const celebrations: ResolvedCelebration[] = []
    let keptTemporal = false

    for (const c of resolved.celebrations) {
      if (c.kind === 'sanctoral') {
        celebrations.push(
          makeCelebration(
            c.ref,
            toLocalizedText(c.title),
            c.rank,
            day,
            'other',
            isOfHolyDay(c.ref, undefined),
          ),
        )
        continue
      }
      // Temporal: collapse multi-Mass variants (Christmas vigil/night/dawn/day)
      // to one entry and drop ordinary Sundays/ferias the display doesn't name.
      // The name is left empty — the UI resolves it from the Mass formulary.
      if (keptTemporal) continue
      if (!isNotableTemporal(c.ref, resolved.specialDay)) continue
      keptTemporal = true
      celebrations.push(
        makeCelebration(
          c.ref,
          {},
          c.rank,
          day,
          'solemnity_temporal',
          isOfHolyDay(c.ref, resolved.specialDay),
        ),
      )
    }

    if (celebrations.length === 0) continue
    map.set(format(day, 'yyyy-MM-dd'), { date: day, celebrations, principal: celebrations[0] })
  }

  return map
}

function makeCelebration(
  id: string,
  name: LocalizedText,
  rank: Rank,
  date: Date,
  category: LiturgicalCategory,
  holyDayOfObligation: boolean,
): ResolvedCelebration {
  return {
    entry: { id, name, category, description: {}, holyDayOfObligation },
    date,
    rank: normalizeRank(rank),
    form: 'of',
  }
}

/** `@ember/missal-schema` ranks are hyphenated; `RankOF` (and the i18n keys + rank colors) use underscores. */
function normalizeRank(rank: Rank): RankOF {
  if (rank === 'optional-memorial') return 'optional_memorial'
  if (rank === 'solemnity' || rank === 'feast' || rank === 'memorial') return rank
  // sunday/weekday never reach a surfaced celebration (filtered above).
  return 'memorial'
}

function toLocalizedText(title: Localized | undefined): LocalizedText {
  return { 'en-US': title?.['en-US'], la: title?.la, 'pt-BR': title?.['pt-BR'] }
}
