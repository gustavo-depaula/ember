import type { ChildNode, Element } from 'domhandler'
import { parseDocument } from 'htmlparser2'
import type { ProseBlock, ProseInline } from '@/content/primitives'
import { findElement, findElementInList, hasClass, isTag } from '../dom'
import { commentaryLabel, type Lang } from './url'

const collapseWs = (s: string): string => s.replace(/\s+/g, ' ').trim()
// Footnote markers ride inline as bracketed numbers in a <sup> ("[1]"); their
// definitions sit in trailing <p>s opened by an <a id="_ftnN"> anchor.
const isFootnoteRef = (s: string): boolean => /^\[\d+\]$/.test(s)

function innerText(el: Element): string {
  let s = ''
  for (const c of el.children) {
    if (c.type === 'text') s += c.data
    else if (c.type === 'tag') s += innerText(c)
  }
  return collapseWs(s)
}

// A trailing footnote-definition paragraph: <p><a id="_ftn1">[1]</a> source…</p>.
// (Body references carry id="_ftnrefN" instead, so they don't match.)
function isFootnoteDefinition(el: Element): boolean {
  const first = el.children.find(isTag)
  return !!first && first.name === 'a' && /^_ftn\d+$/.test(first.attribs.id ?? '')
}

// Drop a leading space on the first run and a trailing space on the last, so a
// paragraph never opens or closes with stray whitespace.
function trimEdges(runs: ProseInline[]): ProseInline[] {
  const first = runs[0]
  if (first?.kind === 'text') first.text = first.text.replace(/^\s+/, '')
  const last = runs[runs.length - 1]
  if (last?.kind === 'text') last.text = last.text.replace(/\s+$/, '')
  return runs.filter((r) => r.kind !== 'text' || r.text !== '')
}

// opusdei.org wraps each <p>'s runs in <em> (scripture), <a> (footnote/cross
// links), <br>. We keep text + line breaks + emphasis. Crucially we collapse but
// do NOT trim each text node, so the spaces around inline <em>/<a> runs survive
// (trimming them mashes "behaviour, the" → "behaviour,the").
function childrenToInline(nodes: ChildNode[]): ProseInline[] {
  const out: ProseInline[] = []
  for (const n of nodes) {
    if (n.type === 'text') {
      const text = n.data.replace(/\s+/g, ' ')
      if (text) out.push({ kind: 'text', text })
      continue
    }
    if (!isTag(n)) continue
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
    // Footnote-reference markers (<a><sup>[n]</sup></a>) — drop; other inline
    // links keep their text.
    const text = innerText(n)
    if (text && !isFootnoteRef(text)) out.push({ kind: 'text', text })
  }
  return trimEdges(out)
}

function paragraph(el: Element): ProseBlock {
  return { kind: 'paragraph', inline: childrenToInline(el.children) }
}

function blockText(block: ProseBlock): string {
  if (block.kind !== 'paragraph') return ''
  return collapseWs(block.inline.map((i) => ('text' in i ? i.text : ' ')).join(''))
}

// Scope every lookup to <main> so the page's header logo (which carries its own
// hidden <h1>Opus Dei) and the sidebar/related modules never leak in.
function mainRegion(html: string): Element {
  const doc = parseDocument(html, { decodeEntities: true })
  const main = findElementInList(doc.children, (el) => el.name === 'main')
  if (!main) throw new Error('opus-dei: <main> not found')
  return main
}

function articleBody(main: Element): Element {
  const body = findElement(main, (el) => el.name === 'div' && hasClass(el, 'imperavi-body'))
  if (!body) throw new Error('opus-dei: imperavi-body not found')
  return body
}

// The reflection begins right after the "Commentary"/"Comentário" label
// paragraph; if that's missing, after the <hr> dividing passage from commentary
// (skipping a label paragraph that may sit just past it).
function commentaryStart(kids: Element[], label: string): number {
  const isLabel = (el?: Element) => el?.name === 'p' && innerText(el).toLowerCase() === label
  const labelIdx = kids.findIndex(isLabel)
  if (labelIdx >= 0) return labelIdx + 1
  const hr = kids.findIndex((el) => el.name === 'hr')
  if (hr < 0) throw new Error('opus-dei: commentary divider not found')
  return isLabel(kids[hr + 1]) ? hr + 2 : hr + 1
}

// Today's Gospel reflection (commentary only — the scripture passage that
// precedes it on the page is already the practice's "Gospel" tab).
export function parseGospelCommentary(html: string, lang: Lang): ProseBlock[] {
  const kids = articleBody(mainRegion(html)).children.filter(isTag)
  const start = commentaryStart(kids, commentaryLabel(lang).toLowerCase())

  const blocks: ProseBlock[] = []
  for (const el of kids.slice(start)) {
    if (el.name !== 'p' || isFootnoteDefinition(el)) continue
    const block = paragraph(el)
    if (blockText(block)) blocks.push(block)
  }
  if (blocks.length === 0) throw new Error('opus-dei: no commentary paragraphs')
  return blocks
}

export type MeditationSection = { heading?: string; blocks: ProseBlock[] }
export type Meditation = { title?: string; lead?: string; sections: MeditationSection[] }

// The daily meditation: a title, a short lead, and three thematic sections. The
// body opens with a <ul> listing the section titles, then each section's prose
// begins at a <p id="id_N"> anchor. We use the list only for the per-section
// headings and group the paragraphs that follow each anchor under them.
export function parseMeditation(html: string, _lang: Lang): Meditation {
  const main = mainRegion(html)
  const titleEl = findElement(main, (el) => el.name === 'h1' && !hasClass(el, 'hidden-label'))
  const title = titleEl ? innerText(titleEl) : undefined
  const descEl = findElement(main, (el) => hasClass(el, 'description'))
  const lead = descEl ? innerText(descEl) : undefined

  const kids = articleBody(main).children.filter(isTag)
  const ul = kids.find((el) => el.name === 'ul')
  const points = ul
    ? ul.children
        .filter(isTag)
        .filter((li) => li.name === 'li')
        .map(innerText)
    : []

  const sections: MeditationSection[] = []
  let current: MeditationSection | undefined
  for (const el of kids) {
    if (el.name !== 'p' || isFootnoteDefinition(el)) continue
    const block = paragraph(el)
    if (!blockText(block)) continue
    const anchor = (el.attribs.id ?? '').match(/^id_(\d+)$/)
    if (anchor) {
      current = { heading: points[Number(anchor[1]) - 1], blocks: [block] }
      sections.push(current)
    } else if (current) {
      current.blocks.push(block)
    } else {
      current = { blocks: [block] }
      sections.push(current)
    }
  }
  if (sections.length === 0) throw new Error('opus-dei: no meditation paragraphs')
  return { title, lead, sections }
}
