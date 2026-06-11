import type { Lang, Line, RichText, Segment } from '@ember/missal-schema'
import { applyUniversalFixes } from '../fixes/universal'
import { type EnrichCtx } from './localized'
import { applyPatches } from '../patches'
import { langMap, toLocalized } from './localized'

const segmentTypes = new Set<Segment['type']>([
  'text',
  'rubric',
  'reference',
  'italic',
  'response',
  'signOfCross',
])

/**
 * A drop-cap is just the first letter of the next word (or a one-letter word),
 * never special. Merge each into the following text as plain text: glue a
 * continuation ("P"+"ai" → "Pai"), space a new capitalized word ("O"+"Senhor"
 * → "O Senhor"). The baseline already trimmed the boundary space, so the
 * next-char case is the only signal left.
 */
function mergeDropCaps(line: unknown[]): unknown[] {
  const out: unknown[] = []
  for (let i = 0; i < line.length; i++) {
    const seg = line[i] as { type?: string; text?: string } | null
    if (seg && seg.type === 'dropCap' && typeof seg.text === 'string') {
      const next = line[i + 1] as { type?: string; text?: string } | undefined
      if (next?.type === 'text' && typeof next.text === 'string') {
        const nt = next.text
        const sep = !/^\s/.test(nt) && /^[A-ZÀ-Þ]/.test(nt) ? ' ' : ''
        out.push({ type: 'text', text: `${seg.text}${sep}${nt}` })
        i += 1
      } else {
        out.push({ type: 'text', text: seg.text })
      }
      continue
    }
    out.push(seg)
  }
  return out
}

function cleanSegments(line: unknown, lang: Lang, ctx: EnrichCtx): Line | undefined {
  if (!Array.isArray(line)) return undefined
  const out: Line = []
  for (const seg of mergeDropCaps(line)) {
    if (!seg || typeof seg !== 'object') continue
    const type = (seg as { type?: string }).type
    const text = (seg as { text?: string }).text
    if (!type || typeof text !== 'string') continue
    if (!segmentTypes.has(type as Segment['type'])) continue
    const fixed = applyPatches(ctx.patches, applyUniversalFixes(text), { lang, id: ctx.id })
    out.push({ type: type as Segment['type'], text: fixed })
  }
  return out.length > 0 ? out : undefined
}

/**
 * Baseline body `{ plain, lines }` → new `RichText { lines, citation }`.
 * `plain` is dropped (no reader); `lines` is the canonical text. When a
 * language has no `lines` but has `plain`, synthesize a single-line block so
 * no text is lost.
 */
export function toRichText(rawBody: unknown, ctx: EnrichCtx, citationRaw?: unknown): RichText | undefined {
  if (!rawBody || typeof rawBody !== 'object') return undefined
  const body = rawBody as { plain?: Record<string, string>; lines?: Record<string, unknown[]> }
  const lines: RichText['lines'] = {}

  for (const [k, lang] of Object.entries(langMap)) {
    const rawLines = body.lines?.[k]
    if (Array.isArray(rawLines)) {
      const built = rawLines.map((l) => cleanSegments(l, lang, ctx)).filter((l): l is Line => Boolean(l))
      if (built.length > 0) {
        lines[lang] = built
        continue
      }
    }
    const plain = body.plain?.[k]
    if (typeof plain === 'string' && plain.trim()) {
      const fixed = applyPatches(ctx.patches, applyUniversalFixes(plain), { lang, id: ctx.id })
      lines[lang] = [[{ type: 'text', text: fixed.trim() }]]
    }
  }

  if (Object.keys(lines).length === 0) return undefined
  const citation = toLocalized(citationRaw, ctx)
  return citation ? { lines, citation } : { lines }
}
