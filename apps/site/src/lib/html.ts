import { parseDoInline } from '@/components/prayer/parseDoInline'
import { parseInline } from '@/components/prayer/parseMarkdown'

const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => entities[c])
}

/** The corpus' inline emphasis (`*x*`, `**x**`, `***x***`) as HTML. */
export function inlineHtml(text: string): string {
  return parseInline(text)
    .map((node) => {
      const body = escapeHtml(node.text)
      if (node.type === 'bold') return `<strong>${body}</strong>`
      if (node.type === 'italic') return `<em>${body}</em>`
      if (node.type === 'bolditalic') return `<strong><em>${body}</em></strong>`
      return body
    })
    .join('')
}

const doClass = {
  mark: 'do-mark',
  point: 'do-point',
  mediant: 'do-mediant',
  smallcaps: 'do-sc',
} as const

/** Divinum Officium's inline markup (verse numbers, mediant, crosses, small caps) as HTML. */
export function doInlineHtml(text: string): string {
  return parseDoInline(text)
    .map((run) =>
      run.kind === 'body'
        ? escapeHtml(run.text)
        : `<span class="${doClass[run.kind]}">${escapeHtml(run.text)}</span>`,
    )
    .join('')
}

export function linesHtml(text: string, markup?: 'do'): string {
  const render = markup === 'do' ? doInlineHtml : inlineHtml
  return text
    .split('\n')
    .map((line) => (line.trim() ? `<p>${render(line)}</p>` : ''))
    .join('')
}

/** Plain text for a meta description: markup stripped, whitespace collapsed, cut at a word. */
export function plainExcerpt(text: string, max = 158): string {
  const plain = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\^\d+\]/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}
