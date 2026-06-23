// Text → XHTML helpers. We reuse the app's own markdown parsers
// (`parseInline` / `parseMarkdown`) so prayer text renders on the reader the
// same way it parses in the app, then map the parsed nodes to well-formed
// XHTML (self-closed voids, escaped entities) that an e-ink EPUB engine accepts.

import type { RichTextLine } from '@ember/content-engine'
import { type InlineNode, parseInline, parseMarkdown } from '@/components/prayer/parseMarkdown'

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function inlineNodeToXhtml(node: InlineNode): string {
  const text = xmlEscape(node.text)
  switch (node.type) {
    case 'bold':
      return `<strong>${text}</strong>`
    case 'italic':
      return `<em>${text}</em>`
    case 'bolditalic':
      return `<strong><em>${text}</em></strong>`
    case 'text':
      return text
  }
}

// A single line of inline markdown (no block structure). Used per prayer line.
export function inlineToXhtml(line: string): string {
  return parseInline(line).map(inlineNodeToXhtml).join('')
}

// Prayer/text body: each newline is a visual line break (mirrors PrayerLines,
// which splits on \n). Kept inside one <p> so stanzas stay a single block.
export function prayerToXhtml(text: string): string {
  const lines = text.split('\n').map((l) => (l.trim() === '' ? '' : inlineToXhtml(l)))
  return `<p class="prayer">${lines.join('<br/>')}</p>`
}

// Full markdown block structure (paragraphs, headings, lists, blockquotes,
// images). Used for prose primitives, which carry richer markdown than a prayer.
export function markdownToXhtml(text: string): string {
  return parseMarkdown(text)
    .map((node) => {
      switch (node.type) {
        case 'heading': {
          const level = Math.min(Math.max(node.level, 1), 6)
          return `<h${level}>${inlineToXhtml(node.text)}</h${level}>`
        }
        case 'paragraph':
          return `<p>${node.children.map(inlineNodeToXhtml).join('')}</p>`
        case 'blockquote':
          return `<blockquote><p>${node.children.map(inlineNodeToXhtml).join('')}</p></blockquote>`
        case 'list': {
          const tag = node.ordered ? 'ol' : 'ul'
          const items = node.items
            .map((item) => `<li>${item.map(inlineNodeToXhtml).join('')}</li>`)
            .join('')
          return `<${tag}>${items}</${tag}>`
        }
        case 'image':
          return `<p><img src="${xmlEscape(node.src)}" alt="${xmlEscape(node.alt)}"/></p>`
        default:
          return ''
      }
    })
    .join('\n')
}

// Choice-rich-text body: RichTextLine[] where each segment carries a role.
// Rubric/reference get muted styling; everything else is plain prose.
export function richTextToXhtml(lines: RichTextLine[]): string {
  return lines
    .map((segments) => {
      const inner = segments
        .map((seg) => {
          const text = xmlEscape(seg.text)
          switch (seg.type) {
            case 'rubric':
              return `<span class="rubric">${text}</span>`
            case 'reference':
              return `<span class="reference">${text}</span>`
            case 'italic':
              return `<em>${text}</em>`
            case 'response':
              return `<span class="response">${text}</span>`
            default:
              return text
          }
        })
        .join('')
      return `<p>${inner}</p>`
    })
    .join('\n')
}
