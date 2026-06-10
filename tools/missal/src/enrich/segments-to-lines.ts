import type { Line, Segment } from '@ember/missal-schema'
import { cleanText } from '../parse/segments'
import type { RawSegment } from '../parse/types'

/**
 * Convert parse-stage raw segments into schema Lines: break/paragraph markers
 * become line boundaries; upstream class kinds map onto the semantic segment
 * vocabulary; adjacent text runs merge; empties drop.
 */
const segmentTypeMap: Record<string, Segment['type']> = {
  rubric: 'rubric',
  cross: 'signOfCross',
  reference: 'reference',
  people: 'response',
  italic: 'italic',
  capital: 'dropCap',
  bold: 'text',
  verse: 'text',
  psalm_verse: 'text',
  reading_title: 'text',
  reading_summary: 'italic',
  reading_from: 'text',
  reading_incipit: 'text',
  reading_acclamation: 'response',
  heading: 'text',
}

export function segmentsToLines(raw: RawSegment[]): Line[] {
  const lines: Line[] = []
  let current: Segment[] = []

  function flush(): void {
    const merged: Segment[] = []
    for (const seg of current) {
      const text = cleanText(seg.text)
      if (!text) continue
      const prev = merged[merged.length - 1]
      if (prev && prev.type === seg.type && seg.type === 'text') {
        prev.text = `${prev.text} ${text}`
      } else {
        merged.push({ ...seg, text })
      }
    }
    if (merged.length > 0) lines.push(merged)
    current = []
  }

  for (const seg of raw) {
    if (seg.type === 'break' || seg.type === 'paragraph_start' || seg.type === 'paragraph_end') {
      flush()
      continue
    }
    if (seg.type === 'text') {
      current.push({ type: 'text', text: seg.value })
      continue
    }
    if (seg.type === 'heading') {
      flush()
      current.push({ type: 'text', text: seg.text })
      flush()
      continue
    }
    const mapped = segmentTypeMap[seg.type]
    if (!mapped) continue
    current.push({ type: mapped, text: seg.text })
  }
  flush()

  return lines
}
