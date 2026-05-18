// Producer HTML grammar: `<p>` (optional id/class), `<blockquote>`,
// `<a data-ref>`, `<b>`, `<i>`, `<br />`. Anything else collapses to text.
// Input is assumed already cleaned by the producer.

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'italic'; text: string }
  | { kind: 'ref'; ref: string; text: string }
  | { kind: 'break' }

export type Block =
  | { kind: 'paragraph'; id?: string; className?: string; inline: Inline[] }
  | { kind: 'blockquote'; children: Block[] }

const INLINE_TAG_RE =
  /<a\s+data-ref="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<b\b[^>]*>([\s\S]*?)<\/b>|<i\b[^>]*>([\s\S]*?)<\/i>|<br\s*\/?>/gi

export function parseInlineHtml(html: string): Inline[] {
  const out: Inline[] = []
  let lastIdx = 0
  INLINE_TAG_RE.lastIndex = 0
  for (let m = INLINE_TAG_RE.exec(html); m; m = INLINE_TAG_RE.exec(html)) {
    if (m.index > lastIdx) pushText(out, html.slice(lastIdx, m.index))
    if (m[1] !== undefined) out.push({ kind: 'ref', ref: m[1], text: stripTags(m[2]) })
    else if (m[3] !== undefined) out.push({ kind: 'bold', text: stripTags(m[3]) })
    else if (m[4] !== undefined) out.push({ kind: 'italic', text: stripTags(m[4]) })
    else out.push({ kind: 'break' })
    lastIdx = INLINE_TAG_RE.lastIndex
  }
  if (lastIdx < html.length) pushText(out, html.slice(lastIdx))
  return out
}

function pushText(out: Inline[], text: string) {
  const cleaned = stripTags(text)
  if (cleaned) out.push({ kind: 'text', text: cleaned })
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const BLOCK_RE = /<(p|blockquote)\b([^>]*)>([\s\S]*?)<\/\1>/gi

export function htmlToBlocks(html: string): Block[] {
  const out: Block[] = []
  BLOCK_RE.lastIndex = 0
  for (let m = BLOCK_RE.exec(html); m; m = BLOCK_RE.exec(html)) {
    const tag = m[1].toLowerCase()
    if (tag === 'blockquote') {
      out.push({ kind: 'blockquote', children: htmlToBlocks(m[3]) })
      continue
    }
    out.push({
      kind: 'paragraph',
      id: /\sid="([^"]+)"/.exec(m[2])?.[1],
      className: /\sclass="([^"]+)"/.exec(m[2])?.[1],
      inline: parseInlineHtml(m[3]),
    })
  }
  return out
}
