import type { DataSource, SourceContext } from '@ember/content-engine'
import { format } from 'date-fns'
import { enumerateCelebrations, formularyPath, pickCycle } from './calendar'
import type {
  Celebration,
  DayLiturgies,
  Formulary,
  OrdinaryParts,
  RankType,
  RiteType,
} from './types'

// ember-extra's data tree is vendored into the base library under `of/`.
// Reading via fetchAsset('base', 'of/...') keeps the mass-of source fully
// offline and avoids requiring users to install a separate library.
const HOST_LIBRARY = 'base'
const PATH_PREFIX = 'of/'

type SanctoralIndex = { count: number; ids: string[] }
let sanctoralIndexCache: Promise<SanctoralIndex | undefined> | undefined

async function loadSanctoralIndex(ctx: SourceContext): Promise<SanctoralIndex | undefined> {
  if (!sanctoralIndexCache) {
    sanctoralIndexCache = ctx
      .fetchAsset(HOST_LIBRARY, `${PATH_PREFIX}calendar/sanctorale/_index.json`)
      .then((data) => data as SanctoralIndex | undefined)
      .catch(() => undefined)
  }
  return sanctoralIndexCache
}

/**
 * Find sanctoral formulary IDs assigned to the given calendar date. Most
 * days have 0–1 entries; some have multiple due to optional memorials or
 * regional variants (e.g. May 13 → universal Our Lady of Fatima + Brazil).
 *
 * For now we surface universal (non-scoped) IDs. Region-scoped IDs (those
 * containing a "." after the date) are filtered out — region selection
 * requires a user preference that is not yet wired.
 */
async function sanctoralIdsForDate(ctx: SourceContext, date: Date): Promise<string[]> {
  const index = await loadSanctoralIndex(ctx)
  if (!index) return []
  const mmdd = format(date, 'MM-dd')
  const prefix = `sanctorale.${mmdd}`
  const exactPrefix = `${prefix}.`
  const out: string[] = []
  for (const id of index.ids) {
    if (id === prefix) {
      out.push(id)
    } else if (id.startsWith(exactPrefix)) {
      // Skip region-scoped variants (e.g. "sanctorale.05-13.brazil") for now.
      const tail = id.slice(exactPrefix.length)
      // Some IDs use a non-region disambiguator like "sebastian" — keep
      // those, drop the region-named ones (united-states, france, brazil...).
      if (!REGION_SCOPES.has(tail)) out.push(id)
    }
  }
  return out
}

const REGION_SCOPES = new Set([
  'africa',
  'argentina',
  'australia',
  'austria',
  'brazil',
  'canada',
  'chile',
  'colombia',
  'cuba',
  'dominican-republic',
  'ecuador',
  'el-salvador',
  'england-and-wales',
  'france',
  'german-speaking',
  'guatemala',
  'haiti',
  'honduras',
  'ireland',
  'italy',
  'mexico',
  'nicaragua',
  'nigeria',
  'panama',
  'paraguay',
  'peru',
  'philippines',
  'portugal',
  'puerto-rico',
  'scotland',
  'spain',
  'switzerland',
  'united-states',
  'uruguay',
  'venezuela',
])

async function fetchFormulary(ctx: SourceContext, id: string): Promise<Formulary | undefined> {
  const path = `${PATH_PREFIX}${formularyPath(id)}`
  const data = (await ctx.fetchAsset(HOST_LIBRARY, path)) as Formulary | undefined
  if (!data) return undefined
  return data
}

async function fetchPreface(
  ctx: SourceContext,
  ref: string,
): Promise<Record<string, unknown> | undefined> {
  // ember-extra prefaceRefs are usually fully qualified (e.g.
  // `"preface.pf016"`); some test fixtures use the bare form (`"pf016"`).
  // Tolerate both — DON'T blindly prepend `preface.` (would produce
  // `preface.preface.pf016`, which silently misses the file).
  const fullId = ref.startsWith('preface.') ? ref : `preface.${ref}`
  const refPath = `${PATH_PREFIX}${formularyPath(fullId)}`
  return (await ctx.fetchAsset(HOST_LIBRARY, refPath)) as Record<string, unknown> | undefined
}

/**
 * Hydrate a celebration's preface ref AND its alternativeRefs into a single
 * `alternatives[]` array on `formulary.preface`. The Roman Missal allows
 * the priest to pick from any of these on a given day (e.g. on Easter
 * weekdays, all 5 paschal prefaces are usable). Each entry carries a
 * `label` (Roman numeral extracted from the title) so the chip toggle in
 * the UI shows "Páscoa I", "Páscoa II", etc. rather than generic "Tmp I".
 */
async function hydratePreface(ctx: SourceContext, formulary: Formulary): Promise<Formulary> {
  const preface = formulary.preface as
    | {
        prefaceRef?: string
        alternativeRefs?: string[]
        label?: { 'pt-BR'?: string; 'en-US'?: string; en?: string }
      }
    | undefined
  if (!preface?.prefaceRef) return formulary

  const refs = [preface.prefaceRef, ...(preface.alternativeRefs ?? [])]
  const hydrated: Record<string, unknown>[] = []
  for (const ref of refs) {
    const data = await fetchPreface(ctx, ref)
    if (!data) continue
    const titlePtBR = (data.title as Record<string, string> | undefined)?.['pt-BR']
    const titleEn = (data.title as Record<string, string> | undefined)?.en
    const titleLa = (data.title as Record<string, string> | undefined)?.la
    hydrated.push({
      ...data,
      label: {
        'pt-BR': abbreviatePrefaceTitle(titlePtBR),
        'en-US': abbreviatePrefaceTitle(titleEn),
        la: abbreviatePrefaceTitle(titleLa),
      },
    })
  }
  if (hydrated.length === 0) return formulary

  return { ...formulary, preface: { alternatives: hydrated } }
}

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
  // Match "<header> <season> <roman> <subject>" where header is
  // "PREFÁCIO D[AOE]" / "PREFACE OF" / "PRAEFATIO DE" or empty.
  const cleaned = raw
    .replace(/^PREF[ÁA]CIO\s+D[AOE]\s+/i, '')
    .replace(/^PREFACE\s+OF\s+/i, '')
    .replace(/^PRAEFATIO\s+DE\s+/i, '')
  const match = cleaned.match(/^(.+?)\s+(I{1,4}V?|IV|VI{0,4}|IX|X)\b/)
  if (!match) {
    // No roman numeral — return the cleaned title in title case.
    return titleCase(cleaned)
  }
  return `${titleCase(match[1])} ${match[2]}`
}

function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|\s)([\p{L}])/gu, (_, sep, ch) => sep + ch.toUpperCase())
}

async function buildCelebration(
  ctx: SourceContext,
  primaryId: string,
  alternateIds: string[],
): Promise<Celebration | undefined> {
  const primary = await fetchFormulary(ctx, primaryId)
  if (!primary) return undefined

  const hydratedPrimary = await hydratePreface(ctx, primary)

  const alternates: Formulary[] = []
  for (const altId of alternateIds) {
    const alt = await fetchFormulary(ctx, altId)
    if (!alt) continue
    alternates.push(await hydratePreface(ctx, alt))
  }

  return {
    id: primaryId,
    title: (primary.title as Celebration['title']) ?? {},
    rite: (primary.rite as RiteType | undefined) ?? 'mass',
    rank: (primary.rank as RankType | null | undefined) ?? null,
    primary: hydratedPrimary,
    alternates,
  }
}

/**
 * `mass-of` DataSource — resolves today's Mass content from the bundled
 * `ember-extra` library.
 *
 * Returns DayLiturgies (one or more celebrations + the Order of Mass parts +
 * lectionary cycle). The flow's top-level select renders the celebration
 * picker over `day.celebrations`; per-slot pickers (choice-rich-text) draw
 * options from each celebration's primary + alternates.
 */
/**
 * Liturgical precedence: tempore IDs that suppress sanctoral celebrations
 * entirely (Holy Week, Easter Octave, Christmas Day, etc.). On these days
 * the saint's feast is omitted regardless of rank.
 */
function tempoireSuppressesSanctoral(temporeIds: string[]): boolean {
  return temporeIds.some(
    (id) =>
      id.startsWith('tempore.holy-week.') ||
      // Easter Octave (Mon–Sat after Easter Sunday) — all solemnity-rank in
      // the universal calendar; ember-extra tags them rank=null, so we
      // suppress sanctoral here explicitly.
      id.startsWith('tempore.easter.week-1.') ||
      id.startsWith('tempore.christmas.nativity-') ||
      id.startsWith('tempore.christmas.day-117') ||
      id.startsWith('tempore.christmas.day-118') ||
      id.startsWith('tempore.christmas.day-119') ||
      id === 'tempore.christmas.epiphany',
  )
}

export const massOfSource: DataSource = {
  async load(_args, ctx): Promise<DayLiturgies> {
    const date = ctx.now()
    const enumerated = enumerateCelebrations(date)
    const temporeIdList = enumerated.map((e) => e.primaryId)
    const sanctoralIds = tempoireSuppressesSanctoral(temporeIdList)
      ? []
      : await sanctoralIdsForDate(ctx, date)

    // Memorial-day fold-in: when a sanctoral entry exists for today, expose
    // both the tempore Mass (with the saint as alternate) and the saint's
    // Mass (with the tempore as alternate). Users pick the celebration in
    // the top-level chip, then mix slots inside via Tmp/Snt chips.
    const expanded: { primaryId: string; alternateIds: string[] }[] = []
    if (sanctoralIds.length === 0) {
      expanded.push(...enumerated)
    } else {
      // 1) Tempore celebrations carry sanctoral ids as alternates.
      for (const e of enumerated) {
        expanded.push({
          primaryId: e.primaryId,
          alternateIds: [...e.alternateIds, ...sanctoralIds],
        })
      }
      // 2) Each sanctoral celebration gets the tempore ids as alternates.
      const temporeIds = enumerated.map((e) => e.primaryId)
      for (const sanctoralId of sanctoralIds) {
        expanded.push({
          primaryId: sanctoralId,
          alternateIds: temporeIds,
        })
      }
    }

    const celebrations: Celebration[] = []
    for (const e of expanded) {
      const c = await buildCelebration(ctx, e.primaryId, e.alternateIds)
      if (c) celebrations.push(c)
    }

    const filtered = applyPrecedence(celebrations, temporeIdList)

    const ordinary =
      ((await ctx.fetchAsset(HOST_LIBRARY, `${PATH_PREFIX}library/ordinary/ordinario.json`)) as
        | OrdinaryParts
        | undefined) ?? {}

    return {
      celebrations: filtered,
      ordinary,
      cycle: pickCycle(date),
    }
  },
}

/**
 * Apply liturgical precedence to the celebration picker.
 *
 * Rules (simplified from GIRM/UNLY):
 * - Sanctoral solemnity always takes precedence — the tempore Mass is
 *   removed from the picker (still available inside the saint's Mass as an
 *   alternate).
 * - Sanctoral feast on a weekday in OT suppresses the tempore weekday.
 * - Sanctoral feast on a Sunday loses to the Sunday.
 * - Sanctoral memorial / optional memorial on a Sunday is fully suppressed
 *   (saint's Mass not celebrated, not even as an alternate).
 * - Memorial / optional memorial on a weekday: both surface as alternates.
 *
 * We don't override Advent/Lent/Easter Sunday rules at this layer — Holy
 * Week and Christmas Octave already suppress sanctoral entirely upstream.
 */
function applyPrecedence(celebrations: Celebration[], temporeIds: string[]): Celebration[] {
  const sanctoralSolemnity = celebrations.find(
    (c) => c.id.startsWith('sanctorale.') && c.rank === 'solemnity',
  )
  if (sanctoralSolemnity) {
    return celebrations.filter((c) => !c.id.startsWith('tempore.'))
  }

  const sundayInTempore = temporeIds.some((id) => id.endsWith('.sunday'))

  const sanctoralFeast = celebrations.find(
    (c) => c.id.startsWith('sanctorale.') && c.rank === 'feast',
  )
  if (sanctoralFeast && !sundayInTempore) {
    return celebrations.filter((c) => !c.id.startsWith('tempore.'))
  }

  // On Sundays, memorials and optional memorials are entirely suppressed.
  // The Sunday Mass is celebrated; the saint is omitted as a top-level
  // celebration AND removed from the alternates of remaining tempore
  // celebrations (no Tmp/Snt chip toggle for memorials on Sundays).
  if (sundayInTempore) {
    return celebrations
      .filter(
        (c) => !c.id.startsWith('sanctorale.') || c.rank === 'feast' || c.rank === 'solemnity',
      )
      .map((c) => ({
        ...c,
        alternates: c.alternates.filter(
          (alt) =>
            !(alt as { id?: string; rank?: string }).id?.startsWith?.('sanctorale.') ||
            (alt as { rank?: string }).rank === 'feast' ||
            (alt as { rank?: string }).rank === 'solemnity',
        ),
      }))
  }

  return celebrations
}
