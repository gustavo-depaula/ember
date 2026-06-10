import { applyUniversalFixes } from '../fixes/universal'
import { cleanText } from '../parse/segments'
import type { ParsedCorpus, SourceLang } from '../parse/types'
import { sourceLangs } from '../parse/types'
import { applyPatches, type LoadedPatch } from '../patches'
import type { BaselineLang, BaselineMass } from './baseline'
import { isDerivedString } from './derived-patterns'
import type { ProvenanceRef } from './provenance'

/** Parse-stage source langs ↔ old-corpus lang keys. */
const sourceLangOf: Record<BaselineLang, SourceLang> = {
  la: 'latin',
  es: 'cast',
  en: 'engl',
  'pt-BR': 'port',
  it: 'ital',
  fr: 'fran',
  de: 'germ',
}

export type StringBucket =
  | 'matched'
  | 'casing'
  | 'punct'
  | 'spacing'
  | 'cross-file'
  | 'derived'
  | 'composed'
  | 'not-found'
export type MassStatus = 'ok' | 'partial' | 'missing-day' | 'no-provenance'

export interface MassParity {
  massId: string
  status: MassStatus
  total: number
  buckets: Record<StringBucket, number>
  /** Sample of not-found strings for human review (capped). */
  misses: Array<{ lang: BaselineLang; text: string }>
}

export interface ParityReport {
  masses: MassParity[]
  summary: {
    masses: Record<MassStatus, number>
    strings: Record<StringBucket, number>
  }
}

/** Unify typographic quotes/dashes/ellipses so punctuation-only drift is its own bucket. */
/** Letters and digits only, diacritic-insensitive: catches whitespace/
 * punctuation drift across block joins AND refine.py's Latin diacritic
 * restoration ("Domine" -> "Dómine") + ligature normalization. */
function skeleton(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

function normPunct(s: string): string {
  return s
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/\s+([.,;:!?])/g, '$1')
}

interface Pool {
  /** Per old-corpus lang: concatenated cleaned text of every block in scope. */
  byLang: Partial<Record<BaselineLang, { exact: string; folded: string; punct: string; skeleton: string }>>
}

/** Old-corpus lang keys → normalized keys the patch files use. */
const normalizedLangOf: Record<BaselineLang, string> = {
  la: 'la',
  es: 'es',
  en: 'en-US',
  'pt-BR': 'pt-BR',
  it: 'it',
  fr: 'fr',
  de: 'de',
}

function buildPool(texts: Partial<Record<BaselineLang, string[]>>, patches: LoadedPatch[]): Pool {
  const byLang: Pool['byLang'] = {}
  for (const [lang, list] of Object.entries(texts) as Array<[BaselineLang, string[]]>) {
    // The old corpus carries refine.py's text fixes; apply the same fixes to
    // the parsed pool so parity compares refined-vs-refined, not refined-vs-raw.
    // Single-space join: refine concatenated adjacent blocks with one space.
    const fixed = list.map((t) =>
      applyPatches(patches, applyUniversalFixes(t), { lang: normalizedLangOf[lang], id: '' }),
    )
    const exact = fixed.join(' ')
    const folded = exact.toLowerCase()
    byLang[lang] = { exact, folded, punct: normPunct(folded), skeleton: skeleton(exact) }
  }
  return { byLang }
}

export interface Pools {
  byDay: Map<string, Pool>
  byFile: Map<string, Pool>
  /** Whole-corpus pool: refine.py merged readings/ordinario/preface text
   * across source files into each mass, so day-pool misses fall back here. */
  global: Pool
}

/** Index the parsed corpus into text pools keyed by basename + day anchor. */
export function buildPools(corpus: ParsedCorpus, patches: LoadedPatch[] = []): Pools {
  const dayTexts = new Map<string, Partial<Record<BaselineLang, string[]>>>()
  const fileTexts = new Map<string, Partial<Record<BaselineLang, string[]>>>()
  const globalTexts: Partial<Record<BaselineLang, string[]>> = {}

  const baselineLangOf = Object.fromEntries(
    Object.entries(sourceLangOf).map(([bl, sl]) => [sl, bl]),
  ) as Record<SourceLang, BaselineLang>

  for (const file of corpus.files) {
    const fileKey = file.basename
    const fileBucket = fileTexts.get(fileKey) ?? {}
    fileTexts.set(fileKey, fileBucket)

    for (const day of file.days) {
      const dayKey = `${file.basename}#${day.id ?? '_root'}`
      const dayBucket = dayTexts.get(dayKey) ?? {}
      dayTexts.set(dayKey, dayBucket)

      for (const part of day.parts) {
        if (part.kind !== 'slot') continue
        for (const item of part.items) {
          for (const lang of sourceLangs) {
            const content = item.content[lang]
            if (!content?.text) continue
            const bl = baselineLangOf[lang]
            ;(dayBucket[bl] ??= []).push(content.text)
            ;(fileBucket[bl] ??= []).push(content.text)
            ;(globalTexts[bl] ??= []).push(content.text)
          }
        }
      }
    }
  }

  const byDay = new Map<string, Pool>()
  for (const [k, texts] of dayTexts) byDay.set(k, buildPool(texts, patches))
  const byFile = new Map<string, Pool>()
  for (const [k, texts] of fileTexts) byFile.set(k, buildPool(texts, patches))
  return { byDay, byFile, global: buildPool(globalTexts, patches) }
}

/**
 * Old-corpus strings that CONCATENATED multiple upstream blocks (e.g. two
 * alternative collects merged into one plain string): every sentence-piece
 * exists in the parsed corpus, just not contiguously. >=90% of the text (by
 * length) must be accounted for by known pieces.
 */
function isComposedOfKnownPieces(
  cleaned: string,
  globalPool: Pool['byLang'][BaselineLang],
): boolean {
  if (!globalPool) return false
  const pieces = cleaned.split(/(?<=[.!?;:])\s+/).filter((p) => p.trim().length >= 12)
  if (pieces.length < 2) return false
  let foundLen = 0
  let totalLen = 0
  for (const piece of pieces) {
    const bones = skeleton(piece)
    if (!bones) continue
    totalLen += bones.length
    if (globalPool.skeleton.includes(bones)) foundLen += bones.length
  }
  return totalLen > 0 && foundLen / totalLen >= 0.9
}

const minLength = 8
const missSampleCap = 100000

export function classifyMass(
  mass: BaselineMass,
  ref: ProvenanceRef | undefined,
  pools: Pools,
  langs?: Set<BaselineLang>,
): MassParity {
  const buckets: Record<StringBucket, number> = {
    matched: 0,
    casing: 0,
    punct: 0,
    spacing: 0,
    'cross-file': 0,
    derived: 0,
    composed: 0,
    'not-found': 0,
  }
  const misses: MassParity['misses'] = []

  if (!ref) {
    return { massId: mass.id, status: 'no-provenance', total: 0, buckets, misses }
  }

  const pool = ref.anchor
    ? (pools.byDay.get(`${ref.basename}#${ref.anchor}`) ?? pools.byFile.get(ref.basename))
    : pools.byFile.get(ref.basename)

  if (!pool) {
    return { massId: mass.id, status: 'missing-day', total: 0, buckets, misses }
  }

  let total = 0
  for (const { lang, text } of mass.strings) {
    if (langs && !langs.has(lang)) continue
    const cleaned = cleanText(text)
    if (cleaned.length < minLength) continue
    total += 1

    const langPool = pool.byLang[lang]
    const globalPool = pools.global.byLang[lang]
    const folded = cleaned.toLowerCase()
    const punct = normPunct(folded)

    const bones = skeleton(cleaned)
    if (langPool?.exact.includes(cleaned)) buckets.matched += 1
    else if (langPool?.folded.includes(folded)) buckets.casing += 1
    else if (langPool?.punct.includes(punct)) buckets.punct += 1
    else if (bones && langPool?.skeleton.includes(bones)) buckets.spacing += 1
    else if (globalPool?.punct.includes(punct)) buckets['cross-file'] += 1
    else if (bones && globalPool?.skeleton.includes(bones)) buckets['cross-file'] += 1
    else if (isDerivedString(cleaned)) buckets.derived += 1
    else if (cleaned.length > 120 && isComposedOfKnownPieces(cleaned, globalPool)) {
      buckets.composed += 1
    } else {
      buckets['not-found'] += 1
      if (misses.length < missSampleCap) misses.push({ lang, text: cleaned })
    }
  }

  const status: MassStatus = buckets['not-found'] === 0 ? 'ok' : 'partial'
  return { massId: mass.id, status, total, buckets, misses }
}

export function buildReport(masses: MassParity[]): ParityReport {
  const summary: ParityReport['summary'] = {
    masses: { ok: 0, partial: 0, 'missing-day': 0, 'no-provenance': 0 },
    strings: { matched: 0, casing: 0, punct: 0, spacing: 0, 'cross-file': 0, derived: 0, composed: 0, 'not-found': 0 },
  }
  for (const m of masses) {
    summary.masses[m.status] += 1
    for (const bucket of Object.keys(m.buckets) as StringBucket[]) {
      summary.strings[bucket] += m.buckets[bucket]
    }
  }
  return { masses, summary }
}
