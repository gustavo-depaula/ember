import type { ChildNode, Element } from 'domhandler'
import { parseDocument } from 'htmlparser2'
import { chapterForQuestion, extractQuestion, TOTAL_QUESTIONS } from './extract'
import { fetchPage } from './fetchPage'
import { parseChapter } from './parse'
import type { ChapterId, Lang } from './types'

// Structural-only typing — the package doesn't depend on the app's Primitive
// union, but the shape it returns must satisfy `ProsePrimitive` over there.
type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'ref'; ref: string; text: string }
  | { kind: 'break' }

type Block =
  | { kind: 'paragraph'; id?: string; className?: string; inline: Inline[] }
  | { kind: 'blockquote'; children: Block[] }

type ProsePrimitive = {
  type: 'prose'
  blocks: Block[]
  anchors?: Record<string, { chapter: string }>
}

type SourceFetchContext = {
  date: Date
  prefs: { lang: string; translation: string }
  programDay?: number
  params: Record<string, unknown>
  sources: unknown
}

function narrowLang(lang: string): Lang {
  return lang === 'pt-BR' ? 'pt-BR' : 'en-US'
}

function requireQNum(params: Record<string, unknown>, key: string): number {
  const raw = params[key]
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isInteger(n) || n < 1 || n > TOTAL_QUESTIONS)
    throw new Error(
      `ccc-compendium: param "${key}" must be 1..${TOTAL_QUESTIONS} (got ${String(raw)})`,
    )
  return n
}

const collapseWs = (s: string): string => s.replace(/\s+/g, ' ').trim()

function innerText(el: Element): string {
  let s = ''
  for (const c of el.children) {
    if (c.type === 'text') s += c.data
    else if (c.type === 'tag') s += innerText(c)
  }
  return collapseWs(s)
}

function childrenToInline(nodes: ChildNode[]): Inline[] {
  const out: Inline[] = []
  for (const n of nodes) {
    if (n.type === 'text') {
      const text = collapseWs(n.data)
      if (text) out.push({ kind: 'text', text })
      continue
    }
    if (n.type !== 'tag') continue
    if (n.name === 'br') {
      out.push({ kind: 'break' })
      continue
    }
    if (n.name === 'b' || n.name === 'strong') {
      const text = innerText(n)
      if (text) out.push({ kind: 'bold', text })
      continue
    }
    if (n.name === 'i' || n.name === 'em') {
      const text = innerText(n)
      if (text) out.push({ kind: 'italic', text })
      continue
    }
    if (n.name === 'a' && n.attribs['data-ref']) {
      const text = innerText(n)
      out.push({ kind: 'ref', ref: n.attribs['data-ref'], text })
    }
    // Other inline tags (unknown after cleanup) are silently skipped — the
    // SAX-style walker only emits what we know how to render.
  }
  return out
}

function childrenToBlocks(nodes: ChildNode[]): Block[] {
  const out: Block[] = []
  for (const n of nodes) {
    if (n.type !== 'tag') continue
    if (n.name === 'blockquote') {
      out.push({ kind: 'blockquote', children: childrenToBlocks(n.children) })
      continue
    }
    if (n.name === 'p') {
      out.push({
        kind: 'paragraph',
        ...(n.attribs.id ? { id: n.attribs.id } : {}),
        ...(n.attribs.class ? { className: n.attribs.class } : {}),
        inline: childrenToInline(n.children),
      })
    }
  }
  return out
}

function parseHtmlToBlocks(html: string): Block[] {
  // htmlparser2's parseDocument is char-by-char (no shared regex state), so
  // recursion via blockquote is safe and each parse call has its own state.
  const doc = parseDocument(html)
  return childrenToBlocks(doc.children)
}

// Returns the Compendium passage as a `prose` primitive: parsed Block[] is
// cached by SQLite, so the renderer never re-parses HTML at mount time.
// Practices divide the 598 Qs across days via cycle + per-day data files;
// this source is a pure fetch + parse.
export const cccCompendiumSource = {
  id: 'producer/ccc-compendium',
  // Bumped repeatedly while debugging Hermes-side regressions:
  //   '2': TextDecoder('iso-8859-1') unsupported on Hermes — empty html cached.
  //   '3'/'4': flushed prior broken caches.
  //   '5': payload shape changed from `html: string` to `blocks: Block[]` —
  //        old cache entries are no longer renderable.
  // The cache key includes version, so each bump invalidates every entry
  // written by the prior path.
  version: '5',
  prefsDeps: ['lang' as const],
  async fetch(ctx: SourceFetchContext): Promise<ProsePrimitive> {
    const lang = narrowLang(ctx.prefs.lang)
    const first = requireQNum(ctx.params, 'first')
    const last = requireQNum(ctx.params, 'last')
    if (first > last) throw new Error(`ccc-compendium: first (${first}) must be <= last (${last})`)

    const raw = await fetchPage(lang)
    // Q ranges can span chapter boundaries (e.g. Q217 closes Part 1, Q218
    // opens Part 2). Parse each chapter we touch exactly once.
    const chaptersTouched = new Set<ChapterId>()
    for (let q = first; q <= last; q++) chaptersTouched.add(chapterForQuestion(q))

    const parsedByChapter = new Map<ChapterId, string>()
    for (const chapter of chaptersTouched) {
      parsedByChapter.set(chapter, parseChapter(raw, chapter, lang).html)
    }

    const blocks: Block[] = []
    const anchors: Record<string, { chapter: string }> = {}
    for (let q = first; q <= last; q++) {
      const chapter = chapterForQuestion(q)
      const chapterHtml = parsedByChapter.get(chapter)
      if (!chapterHtml) continue
      blocks.push(...parseHtmlToBlocks(extractQuestion(chapterHtml, q)))
      anchors[String(q)] = { chapter }
    }

    // Refuse to return (and cache) an empty result — a downstream parse bug
    // or partial decode failure shouldn't poison external_content with a
    // permanently-loading shell. Throwing surfaces the failure as
    // contentQuery.isError and lets the user retry.
    if (blocks.length === 0) {
      throw new Error(
        `ccc-compendium: produced no blocks for Q${first}-${last} ` +
          `(${lang}, raw=${raw.length}b, chapters=${chaptersTouched.size})`,
      )
    }

    return { type: 'prose', blocks, anchors }
  },
}
