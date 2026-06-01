import type { DataSource, SourceContext } from '@ember/content-engine'
import { type OfDay, resolveOfDay } from '@ember/liturgical'
import { pickCycle } from './calendar'
import type { MassOfDataSource } from './dataSource'
import { prefaceBodyExcerpts } from './prefaceBodyExcerpt'
import { type CelebrationTitle, prettifyCelebrationTitle } from './prettifyCelebrationTitle'
import { transformFormularyReadings } from './transformReadings'
import type {
  Celebration,
  DayLiturgies,
  Formulary,
  OrdinaryParts,
  RankType,
  RiteType,
} from './types'

const ORDINARY_ID = 'of/ordinary/ordinario'

// A few ember-extra formularies share their localized title with the day Mass
// they accompany (only `fr`/`de` differ), so as separate picker chips they'd be
// indistinguishable. Give those a distinct label. The Pentecost Vigil is an
// `.a` variant of Pentecost Sunday with the identical en/pt/la title.
const titleOverrides: Record<string, CelebrationTitle> = {
  'tempore.easter.week-8.sunday.a': {
    'en-US': 'Pentecost — Vigil Mass',
    'pt-BR': 'Pentecostes — Missa da Vigília',
    la: 'Vigilia Pentecostes',
  },
}

// Above this position on the GIRM Table of Liturgical Days the day is "fixed":
// only the principal Mass is celebrated (a solemnity, feast, Feast of the Lord,
// privileged day, or Sunday). At or below it (memorials, ferias) the celebrant
// may choose between the saint(s) and the weekday, so those surface as options.
const FIXED_DAY_MAX_PRECEDENCE = 7

function massProperIdFor(formularyId: string): string | undefined {
  if (formularyId.startsWith('preface.')) return undefined
  if (formularyId.startsWith('eucharistic-prayer.')) return undefined
  if (formularyId.startsWith('ordinary.')) return undefined
  const [bucket, ...rest] = formularyId.split('.')
  if (!bucket || rest.length === 0) return undefined
  return `mass/of/${bucket}/${rest.join('/')}`
}

function prefaceIdFor(formularyId: string): string {
  // ember-extra prefaceRefs are usually fully qualified (e.g. `preface.pf016`);
  // some test fixtures use the bare form (`pf016`). Tolerate both — DON'T
  // blindly prepend `preface.` (would produce `preface.preface.pf016`, which
  // silently misses the file).
  const bare = formularyId.startsWith('preface.')
    ? formularyId.slice('preface.'.length)
    : formularyId
  return `of/preface/${bare}`
}

const PREFACE_TITLE_HEADER_RE = /^(?:PREF[ÁA]CIO\s+D[AOE]\s+|PREFACE\s+OF\s+|PRAEFATIO\s+DE\s+)/i
const PREFACE_TITLE_RE = /^(.+?)\s+(I{1,4}V?|IV|VI{0,4}|IX|X)\b\s*(.*)$/

/**
 * Strip "PREFÁCIO D[AOE] " / "PREFACE OF " etc. and the trailing subject
 * phrase from a preface title, leaving just "Season Roman" — e.g.
 *   "PREFÁCIO DA PÁSCOA I O mistério pascal" → "Páscoa I"
 *   "PREFACE OF EASTER II On the new life in Christ" → "Easter II"
 * Falls back to the original title (titlecased) when no roman numeral
 * is present.
 */
function abbreviatePrefaceTitle(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const cleaned = raw.replace(PREFACE_TITLE_HEADER_RE, '')
  const match = cleaned.match(PREFACE_TITLE_RE)
  if (!match) return titleCase(cleaned)
  return `${titleCase(match[1])} ${match[2]}`
}

/**
 * Pull the subtitle phrase that follows the Roman numeral in a preface
 * title — used as the card-style excerpt because the body's first line
 * ("Na verdade, é digno e justo...") is identical across most prefaces.
 *   "PREFÁCIO DA PÁSCOA I O mistério pascal" → "O mistério pascal"
 */
function prefaceTitleSubtitle(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const cleaned = raw.replace(PREFACE_TITLE_HEADER_RE, '')
  const match = cleaned.match(PREFACE_TITLE_RE)
  const subtitle = match?.[3]?.trim()
  return subtitle && subtitle.length > 0 ? subtitle : undefined
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|\s)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase())
}

function localizedAbbreviate(
  title: Record<string, string> | undefined,
  fn: (raw: string | undefined) => string | undefined,
): { 'pt-BR'?: string; 'en-US'?: string; la?: string } {
  return {
    'pt-BR': fn(title?.['pt-BR']),
    'en-US': fn(title?.en),
    la: fn(title?.la),
  }
}

/**
 * Whether the Gloria is recited at this formulary's Mass. Gloria is sung on:
 * - Solemnities and feasts (always; suppressed sanctoral feasts never reach
 *   this path — the day resolver omits them upstream).
 * - Sundays outside Advent and Lent.
 * - Holy Thursday (both Chrism Mass and Mass of the Lord's Supper).
 * - Easter Vigil (rank=solemnity, covered above).
 * Otherwise omitted (weekday OT/Advent/Lent, memorials, optional memorials).
 */
function deriveIncludeGloria(formulary: Formulary): boolean {
  const rank = formulary.rank
  if (rank === 'solemnity' || rank === 'feast') return true

  const id = formulary.id
  if (id === 'tempore.holy-week.lords-supper' || id === 'tempore.holy-week.chrism-mass') {
    return true
  }

  const season = formulary.season as string | undefined
  if (
    (season === 'ordinary-time' || season === 'easter' || season === 'christmas') &&
    id.endsWith('.sunday')
  ) {
    return true
  }

  return false
}

/**
 * Build a `mass-of` DataSource against the supplied typed data accessor.
 *
 * The returned DataSource resolves today's Mass content from the corpus —
 * the host implements `MassOfDataSource` to translate stable kind-prefixed
 * ids into corpus reads (data originally sourced from the `ember-extra`
 * upstream submodule).
 *
 * Precedence is decided by `@ember/liturgical`'s `resolveOfDay`; this source
 * only builds the Mass(es) it selects. Returns DayLiturgies (one or more
 * self-contained celebrations + the Order of Mass parts + lectionary cycle).
 * The flow's top-level select offers the celebrant's legitimate choices (e.g.
 * saint vs weekday on a memorial day) and never mixes readings across Masses.
 */
export function createMassOfSource(data: MassOfDataSource): DataSource {
  let calendarCache: Promise<Awaited<ReturnType<MassOfDataSource['fetchOfCalendar']>>> | undefined

  function loadOfCalendar() {
    if (!calendarCache) {
      calendarCache = data.fetchOfCalendar().catch(() => [])
    }
    return calendarCache
  }

  async function fetchFormulary(id: string): Promise<Formulary | undefined> {
    const massId = massProperIdFor(id)
    if (!massId) return undefined
    const body = (await data.fetchMassProper(massId)) as Formulary | undefined
    if (!body) return undefined
    return transformFormularyReadings(body)
  }

  async function fetchPrefaceBody(ref: string): Promise<Record<string, unknown> | undefined> {
    const id = prefaceIdFor(ref)
    return (await data.fetchPreface(id)) as Record<string, unknown> | undefined
  }

  /**
   * Hydrate `preface.prefaceRefs` into a single `alternatives[]` array on
   * `formulary.preface`. The Roman Missal allows the priest to pick from any
   * of these on a given day (e.g. on Easter weekdays all 5 paschal prefaces
   * are usable). Each entry carries a derived `label` (Roman numeral
   * extracted from the title) so the chip toggle reads "Páscoa I",
   * "Páscoa II", etc. rather than generic "Tmp I".
   */
  async function hydratePreface(formulary: Formulary): Promise<Formulary> {
    const preface = formulary.preface as { prefaceRefs?: string[] } | undefined
    const refs = preface?.prefaceRefs ?? []
    if (refs.length === 0) return formulary

    const hydrated: Record<string, unknown>[] = []
    for (const ref of refs) {
      const body = await fetchPrefaceBody(ref)
      if (!body) continue
      const title = body.title as Record<string, string> | undefined
      const bodyExcerpt = prefaceBodyExcerpts(body)
      // Prefer the prayed-words snippet; fall back to the title's subtitle
      // for prefaces whose body doesn't match the boilerplate-end heuristic.
      const excerpt = {
        'pt-BR': bodyExcerpt['pt-BR'] ?? prefaceTitleSubtitle(title?.['pt-BR']),
        'en-US': bodyExcerpt['en-US'] ?? prefaceTitleSubtitle(title?.en),
        la: bodyExcerpt.la ?? prefaceTitleSubtitle(title?.la),
      }
      hydrated.push({
        ...body,
        label: localizedAbbreviate(title, abbreviatePrefaceTitle),
        excerpt,
      })
    }
    if (hydrated.length === 0) return formulary

    return { ...formulary, preface: { alternatives: hydrated } }
  }

  async function buildCelebration(
    primaryId: string,
    alternateIds: string[],
  ): Promise<Celebration | undefined> {
    const primary = await fetchFormulary(primaryId)
    if (!primary) return undefined

    const prettyTitle =
      titleOverrides[primaryId] ??
      prettifyCelebrationTitle((primary.title as Record<string, string | undefined>) ?? {})
    const hydratedPrimary = await hydratePreface({
      ...primary,
      title: prettyTitle,
      includeGloria: deriveIncludeGloria(primary),
    })

    const alternates: Formulary[] = []
    for (const altId of alternateIds) {
      const alt = await fetchFormulary(altId)
      if (!alt) continue
      const altTitle = prettifyCelebrationTitle(
        (alt.title as Record<string, string | undefined>) ?? {},
      )
      alternates.push(
        await hydratePreface({
          ...alt,
          title: altTitle,
          includeGloria: deriveIncludeGloria(alt),
        }),
      )
    }

    return {
      id: primaryId,
      title: prettyTitle,
      rite: (primary.rite as RiteType | undefined) ?? 'mass',
      rank: (primary.rank as RankType | null | undefined) ?? null,
      primary: hydratedPrimary,
      alternates,
    }
  }

  return {
    async load(_args, ctx: SourceContext): Promise<DayLiturgies> {
      const date = ctx.now()
      const day = resolveOfDay(date, await loadOfCalendar())

      // The unified resolver decides precedence; we just build the Mass(es) it
      // selects. Each is self-contained (no cross-Mass alternates) — the flow's
      // top-level picker lets the celebrant choose between legitimate options
      // (e.g. saint vs weekday on a memorial day), never mixing readings.
      const celebrations: Celebration[] = []
      for (const id of celebrationFormularyIds(day)) {
        const c = await buildCelebration(id, [])
        if (c) celebrations.push(c)
      }

      const ordinary = ((await data.fetchOrdinary(ORDINARY_ID)) as OrdinaryParts | undefined) ?? {}

      return {
        celebrations,
        ordinary,
        cycle: pickCycle(date),
      }
    },
  }
}

/**
 * The Mass-formulary id(s) to celebrate, decided by the unified day resolver.
 *
 * - A "fixed" day (solemnity, feast, Feast of the Lord, privileged day, Sunday)
 *   celebrates only the principal — expanded to its multi-Mass formularies on
 *   Christmas (vigil/night/dawn/day) and Holy Thursday (chrism + Lord's Supper).
 *   A coinciding Feast or Solemnity that precedence suppressed (the Visitation
 *   under Trinity Sunday) is still offered as an alternate Mass to *view* —
 *   mirroring how multiple saints on a memorial day each get a chip. Lesser
 *   suppressed days (memorials, ferias, an outranked Sunday/weekday) stay hidden.
 * - A memorial / ferial day offers the celebrant's legitimate choices as
 *   separate top-level celebrations: the principal plus the ferial Mass and any
 *   sanctoral memorials.
 */
function celebrationFormularyIds(day: OfDay): string[] {
  const { principal, others } = day
  if (principal.precedence <= FIXED_DAY_MAX_PRECEDENCE) {
    const ids = [...(principal.formularyIds ?? [principal.id])]
    for (const c of others) {
      if (c.kind === 'sanctoral' && (c.rank === 'feast' || c.rank === 'solemnity')) {
        if (!ids.includes(c.id)) ids.push(c.id)
      }
    }
    return ids
  }
  const offered = [principal, ...others].filter(
    (c) => c.kind === 'temporal' || c.rank === 'memorial' || c.rank === 'optional_memorial',
  )
  const ids: string[] = []
  for (const c of offered) {
    const id = c.kind === 'temporal' ? (c.formularyIds?.[0] ?? c.id) : c.id
    if (!ids.includes(id)) ids.push(id)
  }
  return ids
}
