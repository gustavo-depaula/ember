// The archive's HTML to blocks. The HTML is a Word export cleaned once
// already: its tags say how a run looks, and its classes mark what is a
// rubric and what is a title. Structure is read from those two alone.

import type { Block, Line, Mark, Seg } from '../../packages/loth/src/text'

interface Style {
  rubric?: boolean
  title?: boolean
  bold?: boolean
  italic?: boolean
  sup?: boolean
  link?: string
}

const blockTags = new Set(['div', 'p', 'center', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'table', 'tr', 'td'])
const entities: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  apos: "'",
}

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name: string) => {
    if (name in entities) return entities[name]
    if (name.startsWith('#x')) return String.fromCodePoint(Number.parseInt(name.slice(2), 16))
    if (name.startsWith('#')) return String.fromCodePoint(Number(name.slice(1)))
    return whole
  })
}

function markOf(style: Style, text: string): Mark | undefined {
  if (style.link) return 'link'
  if (style.rubric && style.sup) return /^\s*\d+[a-z]?\s*$/.test(text) ? 'num' : 'note'
  if (style.rubric) return 'rubric'
  if (style.sup) return 'note'
  if (style.bold) return 'bold'
  if (style.italic) return 'italic'
  return undefined
}

interface Run {
  text: string
  style: Style
}

type Token = { run: Run } | { br: true } | { open: true } | { close: true } | { blank: true }

function tokenize(html: string): Token[] {
  const tokens: Token[] = []
  const stack: { tag: string; style: Style }[] = []
  const current = (): Style => stack[stack.length - 1]?.style ?? {}
  const re = /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+)/g
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (m[3] !== undefined) {
      // A blank line in the source matters only where it meets the edge of a
      // block: there it is the gap between two stanzas.
      const raw = m[3]
      if (/^\s*\n\s*\n/.test(raw)) tokens.push({ blank: true })
      if (raw.trim()) tokens.push({ run: { text: decode(raw), style: current() } })
      else tokens.push({ run: { text: ' ', style: current() } })
      if (raw.trim() && /\n\s*\n\s*$/.test(raw)) tokens.push({ blank: true })
      continue
    }
    if (!m[1]) continue
    const tag = m[1].toLowerCase()
    const closing = m[0].startsWith('</')
    if (tag === 'br') {
      tokens.push({ br: true })
      continue
    }
    if (closing) {
      const at = stack.map((s) => s.tag).lastIndexOf(tag)
      if (at >= 0) stack.length = at
      if (blockTags.has(tag)) tokens.push({ close: true })
      continue
    }
    if (blockTags.has(tag)) tokens.push({ open: true })
    const attrs = m[2]
    const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? ''
    const style: Style = { ...current() }
    if (/\brubrica\b/.test(cls)) style.rubric = true
    if (/\btitulo\b/.test(cls)) style.title = true
    if (tag === 'b' || tag === 'strong') style.bold = true
    if (tag === 'i' || tag === 'em') style.italic = true
    if (tag === 'sup') style.sup = true
    if (tag === 'a') style.link = /data-url="([^"]*)"/.exec(attrs)?.[1] ?? style.link
    if (!m[0].endsWith('/>')) stack.push({ tag, style })
  }
  return tokens
}

function pushSeg(line: Line, text: string, mark: Mark | undefined, to?: string) {
  if (!text) return
  const last = line[line.length - 1]
  if (mark === undefined) {
    if (typeof last === 'string') line[line.length - 1] = last + text
    else line.push(text)
    return
  }
  if (last && typeof last !== 'string' && last.m === mark && last.to === to) last.t += text
  else line.push(to ? { m: mark, t: text, to } : { m: mark, t: text })
}

const textOf = (seg: Seg) => (typeof seg === 'string' ? seg : seg.t)
const withText = (seg: Seg, t: string): Seg => (typeof seg === 'string' ? t : { ...seg, t })

// Spaces are collapsed across runs, so a space that closes one run and opens
// the next is one space, and a line neither starts nor ends with one.
function tidy(line: Line): Line {
  const out: Line = []
  let pendingSpace = false
  for (const seg of line) {
    let t = textOf(seg).replace(/\s+/g, ' ')
    if (!t) continue
    if (t === ' ') {
      pendingSpace = out.length > 0
      continue
    }
    const lead = t.startsWith(' ')
    const trail = t.endsWith(' ')
    t = t.trim()
    if ((lead || pendingSpace) && out.length > 0) {
      const prev = out[out.length - 1]
      // The space goes in the plain run when one of the two is plain.
      if (typeof seg === 'string') t = ` ${t}`
      else out[out.length - 1] = withText(prev, `${textOf(prev)} `)
    }
    pendingSpace = trail
    const prev = out[out.length - 1]
    if (typeof seg === 'string' && typeof prev === 'string') out[out.length - 1] = prev + t
    else if (
      prev &&
      typeof seg !== 'string' &&
      typeof prev !== 'string' &&
      prev.m === seg.m &&
      prev.to === seg.to
    )
      prev.t += t
    else out.push(withText(seg, t))
  }
  const last = out[out.length - 1]
  if (last) out[out.length - 1] = withText(last, textOf(last).trimEnd())
  return out.filter((seg) => textOf(seg) !== '')
}

export function normalize(html: string): Block[] {
  const blocks: Block[] = []
  let lines: Line[] = []
  let line: Line = []
  let lineIsTitle = true
  let lineHasText = false

  const endParagraph = () => {
    if (lines.length > 0) blocks.push({ k: 'p', lines })
    lines = []
  }
  const endLine = (): boolean => {
    const done = tidy(line)
    const title = lineIsTitle && lineHasText
    line = []
    lineIsTitle = true
    lineHasText = false
    if (done.length === 0) return false
    if (title) {
      endParagraph()
      blocks.push({ k: 'title', lines: [done.map((seg) => textOf(seg)).join('').trim()].map((t) => [t]) })
      return true
    }
    lines.push(done)
    return true
  }

  // What the last break was: a `<br>` right after another, or right after a
  // block opens, is an empty line, and an empty line closes a stanza.
  let last: 'text' | 'br' | 'open' | 'close' = 'open'
  let blank = false
  for (const token of tokenize(html)) {
    if ('run' in token) {
      const { text, style } = token.run
      if (text.trim()) {
        lineHasText = true
        if (!style.title) lineIsTitle = false
        last = 'text'
        blank = false
      }
      pushSeg(line, text, markOf(style, text), style.link)
      continue
    }
    if ('blank' in token) {
      blank = true
      continue
    }
    endLine()
    if ('br' in token) {
      if (last !== 'text') endParagraph()
      last = 'br'
      continue
    }
    if (blank) endParagraph()
    last = 'open' in token ? 'open' : 'close'
  }
  endLine()
  endParagraph()
  return blocks
}

/** Letters and digits only: what must survive any change of form. */
export function signature(text: string): string {
  return text.normalize('NFC').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
}

export function show(blocks: Block[]): string {
  return blocks
    .map((b) =>
      b.k === 'title'
        ? `## ${textOf(b.lines[0][0])}`
        : b.lines
            .map((l) =>
              l
                .map((s) =>
                  typeof s === 'string'
                    ? s
                    : { rubric: `{${s.t}}`, bold: `**${s.t}**`, italic: `_${s.t}_`, num: `^${s.t}^`, note: `{^${s.t}^}`, link: `[${s.t}](${s.to})` }[s.m],
                )
                .join(''),
            )
            .join('\n'),
    )
    .join('\n\n')
}
