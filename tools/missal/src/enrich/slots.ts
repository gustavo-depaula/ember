import type {
  GospelAcclamation,
  GospelAcclamationOption,
  Lang,
  Prayer,
  Reading,
  ReadingOption,
  Readings,
  ReadingSet,
  ResponsorialPsalm,
  ResponsorialPsalmOption,
  RichText,
} from '@ember/missal-schema'
import { langMap, toLocalized, type EnrichCtx } from './localized'
import { toRichText } from './richtext'

/** Baseline values are either a single object or `{ alternatives: [...] }`. */
function variants<T>(raw: unknown): T[] {
  if (!raw || typeof raw !== 'object') return []
  const alts = (raw as { alternatives?: unknown }).alternatives
  if (Array.isArray(alts)) return alts as T[]
  return [raw as T]
}

/** Prayer-like (antiphon, collect, offering, postcommunion, prayer-over-people). */
export function toPrayer(raw: unknown, ctx: EnrichCtx): Prayer | undefined {
  const options = variants<Record<string, unknown>>(raw)
    .map((v) => {
      const body = toRichText(v.body, ctx, v.citation)
      if (!body) return undefined
      const label = toLocalized(v.label, ctx)
      return label ? { body, label } : { body }
    })
    .filter((o): o is { body: RichText } => Boolean(o))
  return options.length > 0 ? { options } : undefined
}

function toReadingOption(v: Record<string, unknown>, ctx: EnrichCtx): ReadingOption | undefined {
  const body = toRichText(v.body, ctx, v.citation)
  if (!body) return undefined
  const opt: ReadingOption = { body }
  const label = toLocalized(v.label, ctx)
  const intro = toLocalized(v.introduction, ctx)
  const summary = toLocalized(v.summary, ctx)
  const conclusion = toLocalized(v.conclusion, ctx)
  const response = toLocalized(
    typeof v.response === 'object' && v.response && 'body' in v.response ? undefined : v.response,
    ctx,
  )
  if (body.citation) {
    opt.citation = body.citation
    delete (opt.body as RichText).citation
  }
  if (label) opt.label = label
  if (intro) opt.introduction = intro
  if (summary) opt.summary = summary
  if (conclusion) opt.conclusion = conclusion
  if (response) opt.response = response
  return opt
}

export function toReading(raw: unknown, ctx: EnrichCtx): Reading | undefined {
  const options = variants<Record<string, unknown>>(raw)
    .map((v) => toReadingOption(v, ctx))
    .filter((o): o is ReadingOption => Boolean(o))
  return options.length > 0 ? { options } : undefined
}

function toPsalmOption(v: Record<string, unknown>, ctx: EnrichCtx): ResponsorialPsalmOption | undefined {
  const resp = v.responsory as { primary?: unknown; alternatives?: unknown[] } | undefined
  const responses: RichText[] = []
  const pushResp = (linesByLang: unknown) => {
    const rt = toRichText({ lines: linesByLang }, ctx)
    if (rt) responses.push(rt)
  }
  if (resp?.primary) pushResp(resp.primary)
  if (Array.isArray(resp?.alternatives)) for (const alt of resp.alternatives) pushResp(alt)
  if (responses.length === 0) return undefined

  const verses: ResponsorialPsalmOption['verses'] = {}
  const rawVerses = v.verses as Record<string, unknown[][]> | undefined
  if (rawVerses) {
    for (const [k, lang] of Object.entries(langMap)) {
      const vs = rawVerses[k]
      if (!Array.isArray(vs)) continue
      const built = vs
        .map((block) => {
          const rt = toRichText({ lines: { [k]: block } }, ctx)
          return rt?.lines[lang as Lang]
        })
        .filter((b): b is NonNullable<typeof b> => Boolean(b))
      if (built.length > 0) verses[lang as Lang] = built
    }
  }

  const opt: ResponsorialPsalmOption = { responses, verses }
  const citation = toLocalized(v.citation, ctx)
  const label = toLocalized(v.label, ctx)
  if (citation) opt.citation = citation
  if (label) opt.label = label
  return opt
}

export function toPsalm(raw: unknown, ctx: EnrichCtx): ResponsorialPsalm | undefined {
  const options = variants<Record<string, unknown>>(raw)
    .map((v) => toPsalmOption(v, ctx))
    .filter((o): o is ResponsorialPsalmOption => Boolean(o))
  return options.length > 0 ? { options } : undefined
}

function toAcclamationOption(v: Record<string, unknown>, ctx: EnrichCtx): GospelAcclamationOption | undefined {
  const verse = toRichText({ lines: v.verse }, ctx)
  if (!verse) return undefined
  const mode = (v.mode as GospelAcclamationOption['mode']) ?? 'alleluia'
  const acclamation = toRichText({ lines: v.acclamation }, ctx)
  const citation = toLocalized(v.citation, ctx)
  const opt: GospelAcclamationOption = { mode, verse }
  if (acclamation) opt.acclamation = acclamation
  if (citation) opt.citation = citation
  return opt
}

export function toAcclamation(raw: unknown, ctx: EnrichCtx): GospelAcclamation | undefined {
  const options = variants<Record<string, unknown>>(raw)
    .map((v) => toAcclamationOption(v, ctx))
    .filter((o): o is GospelAcclamationOption => Boolean(o))
  return options.length > 0 ? { options } : undefined
}

const cycleKeys = ['A', 'B', 'C', 'I', 'II', 'default'] as const

export function toReadings(raw: unknown, ctx: EnrichCtx): Readings | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const out: Readings = {}
  for (const cycle of cycleKeys) {
    const slots = (raw as Record<string, unknown>)[cycle]
    if (!slots || typeof slots !== 'object') continue
    const s = slots as Record<string, unknown>
    const set: ReadingSet = {}
    const fr = toReading(s.firstReading, ctx)
    const ps = toPsalm(s.responsorialPsalm, ctx)
    const sr = toReading(s.secondReading, ctx)
    const ga = toAcclamation(s.gospelAcclamation, ctx)
    const go = toReading(s.gospel, ctx)
    if (fr) set.firstReading = fr
    if (ps) set.psalm = ps
    if (sr) set.secondReading = sr
    if (ga) set.gospelAcclamation = ga
    if (go) set.gospel = go
    if (Object.keys(set).length > 0) out[cycle] = set
  }
  return Object.keys(out).length > 0 ? out : undefined
}
