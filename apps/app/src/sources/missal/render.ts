// Missal text to renderer primitives. A corpus item is one passage in every
// language; here it becomes bilingual text, a rubric, a heading or a
// versicle/response pair, by the roles and classes the importer kept.

import type { BilingualText } from '@ember/content-engine'
import {
  type Block,
  blocksIn,
  forDay,
  type Item,
  type Lang,
  type Line,
  lineText,
  type Seg,
} from '@ember/missal'
import type { Primitive, VersesPrimitive } from '@/content/primitives'

export interface LangPrefs {
  primary: Lang
  secondary?: Lang
}

export interface RenderContext {
  lang: LangPrefs
  // Conditions that hold today, for words said only on certain days.
  conditions: ReadonlySet<string>
}

const responseMark = /^\s*R\s*\/?\.?\s*$/i
const versicleMark = /^\s*V\s*\/?\.?\s*$/i

// The text renderer knows *italic* and **bold**; a rubric inside a prayer
// ("N.", "he bows") is set in italic like the rest of the app's inline rubrics.
function segMarkdown(seg: Seg): string {
  if (typeof seg === 'string') return seg
  const text = seg.t
  if (!text.trim()) return text
  const wrap = (mark: string) => {
    const lead = text.match(/^\s*/)?.[0] ?? ''
    const trail = text.match(/\s*$/)?.[0] ?? ''
    return `${lead}${mark}${text.trim()}${mark}${trail}`
  }
  switch (seg.m) {
    case 'rubric':
    case 'italic':
      return wrap('*')
    case 'bold':
      return wrap('**')
    case 'cross':
      // Upstream sets the cross tight against the word that follows it.
      return `${text.trim()} `
    default:
      return text
  }
}

const lineMarkdown = (line: Line): string => line.map(segMarkdown).join('').trim()

function isRubricBlock(block: Block): boolean {
  const segs = block.lines.flat()
  return segs.length > 0 && segs.every((s) => typeof s !== 'string' && s.m === 'rubric')
}

type Kind = 'heading' | 'label' | 'rubric' | 'response' | 'versicle' | 'italic' | 'text' | 'divider'

function kindOf(block: Block, item: Item): Kind {
  if (block.k === 'hr') return 'divider'
  if (block.k === 'h1' || block.k === 'h2') return 'heading'
  if (block.k !== 'p' || block.role === 'title') return 'label'
  const first = block.lines[0]?.[0]
  if (first && typeof first !== 'string' && first.m === 'rubric') {
    if (responseMark.test(first.t)) return 'response'
    if (versicleMark.test(first.t)) return 'versicle'
  }
  if (item.role === 'people') return 'response'
  if (item.role === 'rubric' || isRubricBlock(block)) return 'rubric'
  if (block.role === 'summary') return 'italic'
  return 'text'
}

// A V/. or R/. marker is drawn by the renderer; drop it from the text.
function withoutMark(line: Line): Line {
  const first = line[0]
  if (
    first &&
    typeof first !== 'string' &&
    (responseMark.test(first.t) || versicleMark.test(first.t))
  ) {
    return line.slice(1)
  }
  return line
}

function bodyOf(block: Block, kind: Kind): string {
  if (kind === 'rubric' || kind === 'label' || kind === 'heading') {
    const text = block.lines.map(lineText).join(' ').replace(/\s+/g, ' ').trim()
    return block.cite ? `${text} — ${block.cite}` : text
  }
  const lines =
    kind === 'response' || kind === 'versicle' ? block.lines.map(withoutMark) : block.lines
  const text = lines.map(lineMarkdown).filter(Boolean).join('\n')
  return block.cite ? `${text}\n*${block.cite}*` : text
}

function bilingual(primary: string, secondary: string | undefined): BilingualText {
  return secondary ? { primary, secondary } : { primary }
}

function emit(kind: Kind, text: BilingualText, out: Primitive[]) {
  if (kind === 'divider') {
    out.push({ type: 'divider' })
    return
  }
  // A stray full stop left between two blocks upstream is not a passage.
  if (!/[\p{L}\p{N}✠]/u.test(text.primary)) return
  if (kind === 'response' || kind === 'versicle') {
    const entry: VersesPrimitive['items'][number] = { role: kind === 'response' ? 'r' : 'v', text }
    const last = out[out.length - 1]
    if (last?.type === 'verses' && last.style === 'vr') last.items.push(entry)
    else out.push({ type: 'verses', style: 'vr', items: [entry] })
    return
  }
  if (kind === 'heading') out.push({ type: 'heading', text, size: 'h2' })
  else if (kind === 'label' || kind === 'rubric') out.push({ type: 'rubric', text })
  else out.push({ type: 'text', text, ...(kind === 'italic' ? { style: 'italic' as const } : {}) })
}

/** One corpus item as primitives, the secondary language paired block by block where it lines up. */
export function renderItem(item: Item, ctx: RenderContext, out: Primitive[] = []): Primitive[] {
  const primary = forDay(blocksIn(item, ctx.lang.primary) ?? fallbackBlocks(item), ctx.conditions)
  const secondary = ctx.lang.secondary
    ? forDay(blocksIn(item, ctx.lang.secondary) ?? [], ctx.conditions)
    : []
  const paired = secondary.length === primary.length
  // Where the two languages are not set in the same number of paragraphs, the
  // whole of the second rides beside the first paragraph of the first.
  const whole = paired
    ? undefined
    : secondary
        .map((block) => bodyOf(block, kindOf(block, item)))
        .filter(Boolean)
        .join('\n')
  let wholePlaced = false
  primary.forEach((block, i) => {
    const kind = kindOf(block, item)
    const prayed =
      kind === 'text' || kind === 'response' || kind === 'versicle' || kind === 'italic'
    const other = paired
      ? bodyOf(secondary[i], kind)
      : prayed && !wholePlaced && whole
        ? whole
        : undefined
    if (other && !paired) wholePlaced = true
    emit(kind, bilingual(bodyOf(block, kind), other), out)
  })
  return out
}

// A passage upstream lacks in the reader's language is shown in Latin rather
// than dropped. One it has in neither is another language's own insertion (the
// German Sunday Communicantes, Spain's extra prefaces) and is not shown.
function fallbackBlocks(item: Item): Block[] {
  return item.text?.la ?? []
}

export function renderItems(items: Item[], ctx: RenderContext): Primitive[] {
  const out: Primitive[] = []
  for (const item of items) renderItem(item, ctx, out)
  return out
}

/** The label a part carries in the corpus ("Collect", "Coleta"): its first heading line. */
export function labelOf(items: Item[], ctx: RenderContext): BilingualText | undefined {
  for (const item of items) {
    for (const block of blocksIn(item, ctx.lang.primary) ?? fallbackBlocks(item)) {
      if (block.k !== 'p' || block.role === 'title') {
        const text = block.lines.map(lineText).join(' ').replace(/\s+/g, ' ').trim()
        if (text) return { primary: text }
      }
    }
  }
  return undefined
}
