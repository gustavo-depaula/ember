import type { ContentBlock, Lang, Localized, RichText, SpecialPart } from '@ember/missal-schema'
import { type EnrichCtx, langMap, toLocalized } from './localized'
import { toRichText } from './richtext'

/** A Localized object → a single-line-per-language RichText. */
function localizedToRichText(loc: Localized): RichText {
  const lines: RichText['lines'] = {}
  for (const [lang, text] of Object.entries(loc) as Array<[Lang, string]>) {
    if (text) lines[lang] = [[{ type: 'text', text }]]
  }
  return { lines }
}

/** Recursively map a baseline content tree (block | section) → ContentBlock[]. */
function mapContent(nodes: unknown, ctx: EnrichCtx): ContentBlock[] {
  if (!Array.isArray(nodes)) return []
  const out: ContentBlock[] = []
  for (const n of nodes) {
    if (!n || typeof n !== 'object') continue
    const node = n as { type?: string; body?: unknown; heading?: unknown; content?: unknown }
    if (node.type === 'section') {
      const heading = toLocalized(node.heading, ctx) ?? {}
      out.push({ kind: 'section', heading, content: mapContent(node.content, ctx) })
    } else {
      const body = toRichText(node.body, ctx)
      if (body) out.push({ kind: 'richtext', body })
    }
  }
  return out
}

/** Build a content section from a heading + ordered localized lines. */
function section(heading: Localized, lines: Array<Localized | undefined>, ctx: EnrichCtx): ContentBlock {
  const content: ContentBlock[] = []
  for (const loc of lines) {
    if (loc && Object.keys(loc).length > 0) content.push({ kind: 'richtext', body: localizedToRichText(loc) })
  }
  return { kind: 'section', heading, content }
}

/**
 * Fold typed special-rite arrays (Good Friday intercessions, Easter Vigil OT
 * readings + baptismal renewal) into appended content sections. Lossless and
 * schema-valid; PR 3 can promote these to typed fields when the renderer needs
 * structured access.
 */
function appendTyped(part: Record<string, unknown>, content: ContentBlock[], ctx: EnrichCtx): void {
  const intercessions = part.solemnIntercessions
  if (Array.isArray(intercessions)) {
    for (const i of intercessions as Array<Record<string, unknown>>) {
      const forWhom = toLocalized(i.forWhom, ctx) ?? { 'pt-BR': `Intercessão ${String(i.ordinal ?? '')}` }
      content.push(
        section(
          forWhom,
          [toLocalized(i.invitation, ctx), toLocalized(i.silenceRubric, ctx), toLocalized(i.collect, ctx), toLocalized(i.response, ctx)],
          ctx,
        ),
      )
    }
  }
  const otReadings = part.oldTestamentReadings
  if (Array.isArray(otReadings)) {
    for (const r of otReadings as Array<Record<string, unknown>>) {
      const heading = toLocalized(r.rubric, ctx) ?? { 'pt-BR': `Leitura ${String(r.ordinal ?? '')}` }
      const collect = toRichText(r.collect, ctx)
      const altCollect = toRichText(r.alternativeCollect, ctx)
      const blocks: ContentBlock[] = []
      if (collect) blocks.push({ kind: 'richtext', body: collect })
      if (altCollect) blocks.push({ kind: 'richtext', body: altCollect })
      content.push({ kind: 'section', heading, content: blocks })
    }
  }
  const renewal = part.renewalOfBaptismalPromises as { questions?: Record<string, Array<{ role?: string; text?: string }>> } | undefined
  if (renewal?.questions) {
    const lines: RichText['lines'] = {}
    for (const [k, lang] of Object.entries(langMap)) {
      const qa = renewal.questions[k]
      if (!Array.isArray(qa)) continue
      lines[lang as Lang] = qa
        .filter((x) => x.text)
        .map((x) => [{ type: x.role ? ('rubric' as const) : ('text' as const), text: x.role ? `${x.role}:` : '' }, { type: 'text' as const, text: x.text ?? '' }].filter((s) => s.text))
    }
    if (Object.keys(lines).length > 0) {
      content.push({ kind: 'section', heading: { 'pt-BR': 'Renovação das Promessas Batismais', 'en-US': 'Renewal of Baptismal Promises' }, content: [{ kind: 'richtext', body: { lines } }] })
    }
  }
}

export function toParts(rawParts: unknown, ctx: EnrichCtx): Record<string, SpecialPart> | undefined {
  if (!rawParts || typeof rawParts !== 'object') return undefined
  const out: Record<string, SpecialPart> = {}
  for (const [key, raw] of Object.entries(rawParts as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue
    const part = raw as Record<string, unknown>
    const heading = toLocalized(part.heading, ctx) ?? { 'pt-BR': key }
    const content = mapContent(part.content, ctx)
    appendTyped(part, content, ctx)
    out[key] = { heading, content }
  }
  return Object.keys(out).length > 0 ? out : undefined
}
