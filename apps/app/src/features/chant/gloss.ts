import { parseDoInline } from '@/components/prayer/parseDoInline'
import type { Primitive } from '@/content/primitives'

// A proper of the Mass runs to a few lines; a psalm or a hymn to dozens, which
// under a score would be the whole text over again.
const glossLines = 4

/**
 * The words of a text as plain lines, for the gloss under its score: a short
 * text whole, and of a long one only what is marked in it, each mark once —
 * of a psalm, its antiphon.
 */
export function glossOf(body: Primitive[]): string[] {
  const plain = (text: string, markup?: 'do') =>
    (markup === 'do'
      ? parseDoInline(text)
          .filter((run) => run.kind !== 'mark')
          .map((run) => run.text)
          .join('')
      : text.replace(/[*_]/g, '')
    ).trim()
  const marks = new Set<string>()
  const marked = body.flatMap((primitive) =>
    primitive.type === 'verses'
      ? primitive.items
          .filter((item) => item.mark && !marks.has(item.mark) && marks.add(item.mark))
          .map((item) => plain(item.text.primary, primitive.markup))
      : [],
  )
  const lines = body
    .flatMap((primitive) =>
      primitive.type === 'text'
        ? primitive.text.primary.split('\n').map((line) => plain(line, primitive.markup))
        : [],
    )
    .filter(Boolean)
  return [...marked, ...(lines.length <= glossLines ? lines : [])]
}
