import type { ChildNode, Element } from 'domhandler'
import { parseDocument } from 'htmlparser2'
import type { ProseBlock, ProseInline } from '@/content/primitives'
import { findElement, findElementInList, hasClass, isTag } from '../dom'
import { blockHeading, type DayBlock, type Lang } from './url'

const collapseWs = (s: string): string => s.replace(/\s+/g, ' ').trim()

function innerText(el: Element): string {
  let s = ''
  for (const c of el.children) {
    if (c.type === 'text') s += c.data
    else if (c.type === 'tag') s += innerText(c)
  }
  return collapseWs(s)
}

// Vatican News wraps each <p>'s runs in <br>, <em>, <a> etc. We only need
// text + line breaks + light emphasis.
function childrenToInline(nodes: ChildNode[]): ProseInline[] {
  const out: ProseInline[] = []
  for (const n of nodes) {
    if (n.type === 'text') {
      const text = collapseWs(n.data)
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
    // Links / spans / other inline tags: keep their text content as plain text.
    const text = innerText(n)
    if (text) out.push({ kind: 'text', text })
  }
  return out
}

export function paragraphText(block: ProseBlock): string {
  if (block.kind !== 'paragraph') return ''
  return collapseWs(block.inline.map((i) => ('text' in i ? i.text : ' ')).join(''))
}

// Extracts one named block (gospel or pope reflection) from the daily page —
// other blocks on the same page (readings, the block we didn't ask for) are
// ignored. Throws on any structural miss so the failure surfaces uncached.
export function parseSection(html: string, lang: Lang, block: DayBlock): ProseBlock[] {
  const doc = parseDocument(html, { decodeEntities: true })
  const heading = blockHeading(lang, block)

  const section = findElementInList(
    doc.children,
    (el) =>
      el.name === 'section' &&
      !!findElement(el, (h) => h.name === 'h2' && innerText(h) === heading),
  )
  if (!section) throw new Error(`vatican-news: section for heading "${heading}" not found`)

  const content = findElement(
    section,
    (el) => el.name === 'div' && hasClass(el, 'section__content'),
  )
  if (!content) throw new Error('vatican-news: section__content not found')

  const blocks: ProseBlock[] = []
  for (const child of content.children) {
    if (!isTag(child) || child.name !== 'p') continue
    const inline = childrenToInline(child.children)
    const block: ProseBlock = { kind: 'paragraph', inline }
    if (paragraphText(block).length === 0) continue // skip empty <p>&nbsp;</p>
    blocks.push(block)
  }

  if (blocks.length === 0) throw new Error(`vatican-news: no paragraphs for "${heading}"`)
  return blocks
}
