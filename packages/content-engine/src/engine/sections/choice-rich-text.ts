import type {
  BilingualRichText,
  BilingualText,
  FlowSection,
  LocalizedText,
  RenderedSection,
  RichTextLine,
} from '../../types'
import { bilingualOf, type EngineContext, type FlowContext, resolvePath } from '../context'
import {
  type CelebrationLike,
  emberExtraLang,
  emberExtraSecondaryLang,
  ROMAN,
  SOURCE_LABELS,
  type SourceFormulary,
} from '../labels'
import { walkVarPath } from '../vars'

export type ChoiceRichTextSection = Extract<FlowSection, { type: 'choice-rich-text' }>

export type SlotDataShape = {
  body?: {
    lines?: Record<string, RichTextLine[]>
    plain?: Record<string, string>
  }
  alternatives?: SlotDataShape[]
  citation?: string | Record<string, string>
  summary?: Record<string, string>
  introduction?: Record<string, string>
  conclusion?: Record<string, string>
  response?: {
    body?: {
      lines?: Record<string, RichTextLine[]>
      plain?: Record<string, string>
    }
  }
  /**
   * When an alternative carries its own localized label (e.g. each preface
   * after hydration gets a label like "Páscoa I"), it overrides the
   * source-tag-based label ("Tmp", "Snt", …) in the chip toggle.
   */
  label?: Record<string, string>
  /**
   * Optional excerpt — short phrase distinguishing this option from
   * sibling alternatives in a card-style picker (e.g. each preface's
   * subtitle: "O mistério pascal", "A vida nova em Cristo", …). Body
   * incipits aren't enough because most prefaces share the same opening.
   */
  excerpt?: Record<string, string>
}

export type ExtractedSlot = {
  body: BilingualRichText
  citation?: BilingualText
  summary?: BilingualText
  introduction?: BilingualText
  conclusion?: BilingualText
  response?: BilingualRichText
  label?: BilingualText
  excerpt?: BilingualText
}

function extractOneSlotOption(
  slotData: SlotDataShape,
  ec: EngineContext,
): ExtractedSlot | undefined {
  const primaryLang = emberExtraLang(ec.contentLanguage)
  const secondaryLang = emberExtraSecondaryLang(primaryLang)

  const primary = pickRichTextLines(slotData.body, primaryLang)
  if (!primary || primary.length === 0) return undefined
  const secondary = pickRichTextLines(slotData.body, secondaryLang)

  // Citation may be a string (older shape) OR a localized object (ember-extra
  // shape). Use localize for the latter.
  const cit = slotData.citation
  const citation =
    typeof cit === 'string'
      ? bilingualOf(cit)
      : cit && typeof cit === 'object'
        ? ec.localize(cit as LocalizedText)
        : undefined

  const summary = slotData.summary ? ec.localize(slotData.summary as LocalizedText) : undefined
  const introduction = slotData.introduction
    ? ec.localize(slotData.introduction as LocalizedText)
    : undefined
  const conclusion = slotData.conclusion
    ? ec.localize(slotData.conclusion as LocalizedText)
    : undefined

  // Response carries typed segments (e.g. Gospel: ℟. Glória a vós, Senhor.).
  const responsePrimary = pickRichTextLines(slotData.response?.body, primaryLang)
  const responseSecondary = pickRichTextLines(slotData.response?.body, secondaryLang)
  const response = responsePrimary
    ? {
        primary: responsePrimary,
        ...(responseSecondary && responseSecondary.length > 0
          ? { secondary: responseSecondary }
          : {}),
      }
    : undefined

  const label = slotData.label ? ec.localize(slotData.label as LocalizedText) : undefined
  const excerpt = slotData.excerpt ? ec.localize(slotData.excerpt as LocalizedText) : undefined

  return {
    body: {
      primary,
      ...(secondary && secondary.length > 0 ? { secondary } : {}),
    },
    ...(citation ? { citation } : {}),
    ...(summary ? { summary } : {}),
    ...(introduction ? { introduction } : {}),
    ...(conclusion ? { conclusion } : {}),
    ...(response ? { response } : {}),
    ...(label ? { label } : {}),
    ...(excerpt ? { excerpt } : {}),
  }
}

/**
 * Walk a formulary's slot path and return one option per renderable
 * alternative. Most slots have a single direct body and yield one option.
 * Reading slots may wrap multiple options in `alternatives[]` — Sundays in
 * OT, solemnities, ferial-vs-festive choices. We expose them all so the
 * renderer can offer an "Alia" chip toggle.
 */
function extractSlotData(
  formulary: SourceFormulary | undefined,
  slot: string,
  ec: EngineContext,
): ExtractedSlot[] {
  if (!formulary) return []
  // Slot may be dotted: 'readings.default.firstReading' walks nested fields.
  const slotData = walkVarPath(formulary as Record<string, unknown>, slot) as
    | SlotDataShape
    | undefined
  if (!slotData) return []

  // Direct body present: one option.
  if (slotData.body) {
    const opt = extractOneSlotOption(slotData, ec)
    return opt ? [opt] : []
  }
  // No direct body but alternatives[] present: each alt becomes one option.
  if (slotData.alternatives?.length) {
    return slotData.alternatives
      .map((alt) => extractOneSlotOption(alt, ec))
      .filter((o): o is ExtractedSlot => o !== undefined)
  }
  return []
}

/**
 * Resolve a body to RichTextLine[] for the given language. Prefers typed
 * segments (`body.lines.{lang}`); falls back to plain text (`body.plain.{lang}`)
 * synthesized into one text-only segment per paragraph. ember-extra ships
 * scripture readings (firstReading, gospel) in plain only.
 */
function pickRichTextLines(
  body: { lines?: Record<string, RichTextLine[]>; plain?: Record<string, string> } | undefined,
  lang: string,
): RichTextLine[] | undefined {
  if (!body) return undefined
  const lines = body.lines?.[lang]
  if (lines && lines.length > 0) return lines
  const plain = body.plain?.[lang]
  if (typeof plain === 'string' && plain.trim().length > 0) {
    return splitPlainIntoLines(plain).map((p) => [{ type: 'text', text: p }])
  }
  return undefined
}

/**
 * Split a plain-text body into renderable lines. Prefer real paragraph
 * breaks (`\n\n` or `\n`); when the source is one long string with no
 * line breaks (ember-extra scripture readings, ~1100+ chars in a single
 * paragraph), fall back to sentence-level chunking. Heuristic: a period
 * (or question-/exclamation-mark, or close-quote) followed by a space
 * and an uppercase / open-quote character starts a new line — but only
 * when the running paragraph is already long enough that sentence
 * splitting won't shred a short prayer into bullet points.
 */
function splitPlainIntoLines(plain: string): string[] {
  const byNewline = plain
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  if (byNewline.length > 1) return byNewline

  const single = byNewline[0] ?? plain.trim()
  if (single.length < 240) return [single]

  // Sentence-end punctuation (including ASCII "..." ellipsis) + space +
  // uppercase / open quote. False positives on abbreviations like
  // "S. Paulo", "Cf. Mt", "Pe. João" do split mid-name — the cost is a
  // few spurious breaks per reading, accepted in exchange for not
  // rendering scripture as one wall of text.
  const pattern = /(?<=[.!?…”"'»]|\.\.\.)\s+(?=[A-ZÀ-ÚÇ"“«¡¿])/u
  const parts = single
    .split(pattern)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return parts.length > 1 ? parts : [single]
}

export function resolveChoiceRichText(
  section: ChoiceRichTextSection,
  context: FlowContext,
  ec: EngineContext,
): RenderedSection[] {
  const celebrationPath = section.celebration ?? 'celebration'
  const celebration = resolvePath(context, celebrationPath) as CelebrationLike | undefined
  if (!celebration || typeof celebration !== 'object') return []

  // The slot path may have already had `{{day.cycle}}` substituted upstream
  // (via deepSubstitute when this section was rendered inside a from-data
  // select body). We still resolve any leftover templates here defensively.
  const slotForExtraction = section.slot.replace(/\{\{([\w.-]+)\}\}/g, (_, key) => {
    const value = resolvePath(context, key)
    return typeof value === 'string' ? value : value !== undefined ? String(value) : ''
  })

  // Cycle fallback: many ferials only ship `readings.default.*`; the cycle
  // template would resolve to `readings.II.gospel` and find nothing. Build
  // a fallback path that replaces the second segment of `readings.<X>.<Y>`
  // with `default`.
  const cycleFallbackSlot = (() => {
    const parts = slotForExtraction.split('.')
    if (parts.length < 3 || parts[0] !== 'readings' || parts[1] === 'default') {
      return undefined
    }
    return ['readings', 'default', ...parts.slice(2)].join('.')
  })()

  const formularies: { tag: string; formulary: SourceFormulary }[] = []
  if (celebration.primary) {
    formularies.push({
      tag: celebration.primary.source ?? 'primary',
      formulary: celebration.primary,
    })
  }
  for (const alt of celebration.alternates ?? []) {
    formularies.push({
      tag: alt.source ?? `alt-${formularies.length}`,
      formulary: alt,
    })
  }

  const options = formularies.flatMap(({ tag, formulary }) => {
    let slotOptions = extractSlotData(formulary, slotForExtraction, ec)
    if (slotOptions.length === 0 && cycleFallbackSlot) {
      slotOptions = extractSlotData(formulary, cycleFallbackSlot, ec)
    }
    return slotOptions.map((data, idx) => {
      // Prefer the per-option `label` when the data carries one (e.g. each
      // hydrated preface has its own "Páscoa I" / "Páscoa II" label).
      // Fall back to the source tag (Tmp / Snt / Com); when multiple
      // alternatives share a single source tag, append a Roman numeral.
      const baseLabel = SOURCE_LABELS[tag] ?? { 'en-US': tag, 'pt-BR': tag }
      const fallbackLabel: BilingualText =
        slotOptions.length > 1
          ? ec.localize({
              'en-US': `${baseLabel['en-US']} ${ROMAN[idx] ?? idx + 1}`,
              'pt-BR': `${baseLabel['pt-BR']} ${ROMAN[idx] ?? idx + 1}`,
            })
          : ec.localize(baseLabel)
      const optionLabel = data.label ?? fallbackLabel
      const id = slotOptions.length > 1 ? `${tag}-${idx}` : tag
      return {
        id,
        label: optionLabel,
        body: data.body,
        ...(data.citation ? { citation: data.citation } : {}),
        ...(data.summary ? { summary: data.summary } : {}),
        ...(data.introduction ? { introduction: data.introduction } : {}),
        ...(data.conclusion ? { conclusion: data.conclusion } : {}),
        ...(data.response ? { response: data.response } : {}),
        ...(data.excerpt ? { excerpt: data.excerpt } : {}),
      }
    })
  })

  if (options.length === 0) return []

  const overrideKey = `${celebrationPath}.${section.slot}`
  const overrideId = context.selectOverrides?.[overrideKey]
  const defaultId = section.defaultBlank ? undefined : (section.default ?? options[0]?.id)
  const selectedId = overrideId && options.some((o) => o.id === overrideId) ? overrideId : defaultId

  return [
    {
      type: 'choice-rich-text',
      label: ec.localize(section.label),
      overrideKey,
      selectedId,
      ...(section.pickerStyle ? { pickerStyle: section.pickerStyle } : {}),
      ...(section.hideLabel ? { hideLabel: true } : {}),
      ...(section.precedingResponse
        ? { precedingResponse: ec.localize(section.precedingResponse) }
        : {}),
      options,
    },
  ]
}
