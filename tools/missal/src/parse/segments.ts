import type { AnyNode, Element } from 'domhandler'
import { isTag, isText } from 'domhandler'
import type { RawInlineType, RawSegment } from './types'

const inlineClassType: Record<string, RawInlineType> = {
  red: 'rubric',
  cap: 'capital',
  cruzroja: 'cross',
  alindcha: 'reference',
  pueblo: 'people',
  ReadingGospelTitle: 'reading_title',
  Summary: 'reading_summary',
  Areadingfrom: 'reading_from',
  'Incipit-oneline': 'reading_incipit',
  TheWordoftheLord: 'reading_acclamation',
  Verse: 'verse',
  PsalmAlleluiaVerse: 'psalm_verse',
}

export function classes(el: Element): string[] {
  const cls = el.attribs?.class
  return cls ? cls.split(/\s+/).filter(Boolean) : []
}

function classifyInline(el: Element): RawInlineType | undefined {
  for (const cls of classes(el)) {
    const t = inlineClassType[cls]
    if (t) return t
  }
  return undefined
}

//   = no-break space,   = narrow no-break space (both common upstream)
export function cleanText(text: string): string {
  return text
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Plain-text rendering of an element subtree (joins with spaces, like bs4's get_text(" ")). */
export function getText(node: AnyNode): string {
  if (isText(node)) return node.data
  if (!isTag(node)) return ''
  return node.children.map(getText).join(' ')
}

/**
 * Recursively walk a hijo block and produce typed segments.
 * Mirrors convert.py's parse_segments so the parity baseline holds.
 */
export function parseSegments(root: Element): RawSegment[] {
  const out: RawSegment[] = []

  function walk(node: AnyNode): void {
    if (isText(node)) {
      const text = node.data
      if (text.trim() || text === ' ') out.push({ type: 'text', value: text })
      return
    }
    if (!isTag(node)) return

    const name = node.name.toLowerCase()

    if (name === 'br') {
      out.push({ type: 'break' })
      return
    }

    const headingLevel = /^h([1-6])$/.exec(name)?.[1]
    if (headingLevel) {
      out.push({ type: 'heading', level: Number(headingLevel), text: cleanText(getText(node)) })
      return
    }

    if (name === 'i' || name === 'em') {
      out.push({ type: 'italic', text: cleanText(getText(node)) })
      return
    }

    if (name === 'b' || name === 'strong') {
      out.push({ type: 'bold', text: cleanText(getText(node)) })
      return
    }

    const inline = classifyInline(node)
    if (inline) {
      out.push({ type: inline, text: cleanText(getText(node)) })
      return
    }

    if (name === 'p') {
      out.push({ type: 'paragraph_start' })
      for (const child of node.children) walk(child)
      out.push({ type: 'paragraph_end' })
      return
    }

    for (const child of node.children) walk(child)
  }

  for (const child of root.children) walk(child)
  return out
}
