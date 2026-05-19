import type { ChildNode, Element } from 'domhandler'
import { parseDocument } from 'htmlparser2'
import { chapterForQuestion, TOTAL_QUESTIONS } from './extract'
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

type HeadingLevel = 'part' | 'chapter' | 'section' | 'article'

type Block =
  | {
      kind: 'paragraph'
      id?: string
      className?: string
      inline: Inline[]
      structural?: boolean
    }
  | { kind: 'question'; id: string; number: string; text: string }
  | { kind: 'heading'; level: HeadingLevel; text: string; structural?: boolean }
  | { kind: 'subheading'; text: string; structural?: boolean }
  | { kind: 'paragraph-number'; text: string; structural?: boolean }
  | { kind: 'blockquote'; children: Block[]; structural?: boolean }

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

// A <b> tag can contain a <br> (the source uses this to stack two heading
// lines like `Section One<br>"I believe" – "We believe"` in one paragraph).
// Naively calling innerText() on the <b> collapses the break and loses the
// visual structure. This walker splits a bold run at internal breaks so
// downstream classification can see each line as its own segment.
function boldChildrenToInlines(el: Element): Inline[] {
  const out: Inline[] = []
  let buffer = ''
  const flush = () => {
    const text = collapseWs(buffer)
    if (text) out.push({ kind: 'bold', text })
    buffer = ''
  }
  for (const c of el.children) {
    if (c.type === 'text') {
      buffer += c.data
      continue
    }
    if (c.type !== 'tag') continue
    if (c.name === 'br') {
      flush()
      out.push({ kind: 'break' })
      continue
    }
    // Any other tag inside <b> (typically <a name="..."> anchors): take its
    // text content but keep accumulating into the current bold run.
    buffer += innerText(c)
  }
  flush()
  return out
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
      out.push(...boldChildrenToInlines(n))
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

// Inlines inside a Compendium blockquote read as a single italic quotation
// by typographic convention (vatican.va styles `<blockquote>` italic via CSS;
// the source HTML carries no `<i>` for the quote body). Promote plain text
// runs to italic at parse time so the convention lives in the cached data,
// not in a renderer global that would italicize blockquotes everywhere.
function italicizeInlines(inlines: Inline[]): Inline[] {
  return inlines.map((i) => (i.kind === 'text' ? { kind: 'italic', text: i.text } : i))
}

function childrenToBlocks(nodes: ChildNode[]): Block[] {
  const out: Block[] = []
  for (const n of nodes) {
    if (n.type !== 'tag') continue
    if (n.name === 'blockquote') {
      const inner = childrenToBlocks(n.children).map((b) =>
        b.kind === 'paragraph' ? { ...b, inline: italicizeInlines(b.inline) } : b,
      )
      out.push({ kind: 'blockquote', children: inner })
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

function inlineToText(inline: Inline[]): string {
  return inline
    .map((i) => ('text' in i ? i.text : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const HEADING_PREFIX_RE = /^(part|chapter|section|article)\b/i
const NUMERIC_LABEL_RE = /^\d+(?:[-–]\d+)?$/

function isAllBoldOrBreak(inline: Inline[]): boolean {
  if (inline.length === 0) return false
  return inline.every((i) => i.kind === 'bold' || i.kind === 'break')
}

// Split a sequence of inlines at break elements, returning groups of the
// in-between inlines (each group is at least one bold inline since we only
// call this on isAllBoldOrBreak input).
function splitInlinesAtBreaks(inline: Inline[]): Inline[][] {
  const out: Inline[][] = []
  let current: Inline[] = []
  for (const i of inline) {
    if (i.kind === 'break') {
      if (current.length) out.push(current)
      current = []
    } else {
      current.push(i)
    }
  }
  if (current.length) out.push(current)
  return out
}

function classifyBoldSegment(text: string): Block {
  const m = text.match(HEADING_PREFIX_RE)
  if (m) {
    return {
      kind: 'heading',
      level: m[1].toLowerCase() as HeadingLevel,
      text,
      structural: true,
    }
  }
  return { kind: 'subheading', text, structural: true }
}

// Promote semantic kinds from raw paragraph blocks. The classifier is
// content-driven (the source HTML doesn't carry semantic markup — `Part One`
// and `CHAPTER ONE` are just bold-styled paragraphs upstream). All
// non-question promoted blocks are flagged `structural: true` so the renderer
// can opt to hide source-document chrome (chapter dividers, intro quotes)
// when the user wants just the Q&As.
function classifyBlocks(blocks: Block[]): Block[] {
  const out: Block[] = []
  let insideQuestion = false

  for (const b of blocks) {
    // Blockquotes inherit "structural" if they sit in interstitial territory
    // (between question N's answer and question N+1's start).
    if (b.kind === 'blockquote') {
      out.push({ ...b, structural: !insideQuestion ? true : undefined })
      continue
    }
    if (b.kind !== 'paragraph') {
      out.push(b)
      continue
    }

    // Question-intro paragraph: <p id="qN"><b>N. Question?</b></p>
    if (b.id && /^q\d+$/.test(b.id)) {
      const text = inlineToText(b.inline)
      const m = text.match(/^(\d+)\.\s*(.+)$/)
      if (m) {
        out.push({ kind: 'question', id: b.id, number: m[1], text: m[2] })
        insideQuestion = true
        continue
      }
    }

    // All-bold paragraph (possibly with internal <br> producing two stacked
    // headings, like `Section One<br>"I believe" – "We believe"`). Each
    // bold segment becomes its own structural block — text starting with
    // PART/CHAPTER/SECTION/ARTICLE is the heading label; everything else is
    // a subheading (the actual title). Length cap rules out the rare case
    // where the answer body wraps in a single oversized <b>.
    if (isAllBoldOrBreak(b.inline)) {
      const segments = splitInlinesAtBreaks(b.inline)
      let emitted = false
      for (const seg of segments) {
        const segText = inlineToText(seg)
        if (!segText || segText.length > 120) continue
        out.push(classifyBoldSegment(segText))
        emitted = true
      }
      if (emitted) {
        insideQuestion = false
        continue
      }
    }

    const text = inlineToText(b.inline)

    // Standalone numeric paragraph (CCC paragraph number marker, e.g. "30").
    if (NUMERIC_LABEL_RE.test(text)) {
      out.push({ kind: 'paragraph-number', text, structural: true })
      insideQuestion = false
      continue
    }

    out.push(b)
  }
  return out
}

function parseHtmlToBlocks(html: string): Block[] {
  // htmlparser2's parseDocument is char-by-char (no shared regex state), so
  // recursion via blockquote is safe and each parse call has its own state.
  const doc = parseDocument(html)
  return classifyBlocks(childrenToBlocks(doc.children))
}

function isStructural(b: Block): boolean {
  if (b.kind === 'heading' || b.kind === 'subheading' || b.kind === 'paragraph-number') return true
  if (b.kind === 'blockquote' && b.structural) return true
  return false
}

// Walk a chapter's parsed+classified blocks and group them per question.
// Pre-content (PART/CHAPTER/SECTION dividers, paragraph numbers, intro
// quotes) belongs to the question it INTRODUCES, not the one it follows —
// matching how the source document reads on the page. So everything before
// each `<p id="qN">` becomes prefix content for Q N.
//
// State machine:
//   - 'pre'      : accumulating prefix content for the next question
//   - 'answering': absorbed a question; non-structural blocks (refs, answer
//                  paragraphs) attach to it; the first structural block we
//                  encounter flips us back to 'pre' for the next question.
function groupBlocksByQuestion(blocks: Block[]): Map<number, Block[]> {
  const groups = new Map<number, Block[]>()
  let prefix: Block[] = []
  let currentGroup: Block[] | null = null
  let mode: 'pre' | 'answering' = 'pre'

  for (const b of blocks) {
    if (b.kind === 'question') {
      currentGroup = [...prefix, b]
      groups.set(Number(b.number), currentGroup)
      prefix = []
      mode = 'answering'
      continue
    }
    if (mode === 'answering') {
      if (isStructural(b)) {
        mode = 'pre'
        prefix.push(b)
      } else if (currentGroup) {
        currentGroup.push(b)
      }
      continue
    }
    // mode === 'pre': everything (structural or not) is prefix for the next Q
    prefix.push(b)
  }
  return groups
}

// Returns the Compendium passage as a `prose` primitive: parsed Block[] is
// cached by SQLite, so the renderer never re-parses HTML at mount time.
// Practices divide the 598 Qs across days via cycle + per-day data files;
// this source is a pure fetch + parse.
export const cccCompendiumSource = {
  id: 'producer/ccc-compendium',
  // Cache key includes version; bump to invalidate all stored payloads when
  // either the fetch/parse pipeline or the block schema changes shape.
  version: '1',
  prefsDeps: ['lang' as const],
  async fetch(ctx: SourceFetchContext): Promise<ProsePrimitive> {
    const lang = narrowLang(ctx.prefs.lang)
    const first = requireQNum(ctx.params, 'first')
    const last = requireQNum(ctx.params, 'last')
    if (first > last) throw new Error(`ccc-compendium: first (${first}) must be <= last (${last})`)

    const raw = await fetchPage(lang)
    // Q ranges can span chapter boundaries (e.g. Q217 closes Part 1, Q218
    // opens Part 2). Parse each chapter we touch exactly once, then group
    // its blocks by question so each Q's prefix content (chapter dividers,
    // intro quotes that appear BEFORE the Q in the source) attaches to that
    // Q. The old approach sliced FROM `<p id="qN">` forward, which trapped
    // the next chapter's intro under the previous question.
    const chaptersTouched = new Set<ChapterId>()
    for (let q = first; q <= last; q++) chaptersTouched.add(chapterForQuestion(q))

    const groupsByChapter = new Map<ChapterId, Map<number, Block[]>>()
    for (const chapter of chaptersTouched) {
      const chapterHtml = parseChapter(raw, chapter, lang).html
      groupsByChapter.set(chapter, groupBlocksByQuestion(parseHtmlToBlocks(chapterHtml)))
    }

    const blocks: Block[] = []
    const anchors: Record<string, { chapter: string }> = {}
    for (let q = first; q <= last; q++) {
      const chapter = chapterForQuestion(q)
      const group = groupsByChapter.get(chapter)?.get(q)
      if (!group) continue
      blocks.push(...group)
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
