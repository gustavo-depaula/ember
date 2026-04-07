import { loadCcc } from '@/lib/catechism'

export type CccSegment = {
  index: number
  section: string
  breadcrumb: string[]
  startParagraph: number
  endParagraph: number
  paragraphCount: number
}

let cachedSegments: CccSegment[] | undefined

export function buildSegments(): CccSegment[] {
  if (cachedSegments) return cachedSegments

  const paragraphs = loadCcc()
  const segments: CccSegment[] = []
  let current: CccSegment | undefined

  for (const p of paragraphs) {
    if (!current || current.section !== p.section) {
      current = {
        index: segments.length,
        section: p.section,
        breadcrumb: p.breadcrumb,
        startParagraph: p.number,
        endParagraph: p.number,
        paragraphCount: 1,
      }
      segments.push(current)
    } else {
      current.endParagraph = p.number
      current.paragraphCount++
    }
  }

  cachedSegments = segments
  return segments
}

export function findSegmentByParagraph(paragraph: number): CccSegment {
  const segments = buildSegments()
  const found = segments.find((s) => paragraph >= s.startParagraph && paragraph <= s.endParagraph)
  return found ?? segments[0]
}

export function getPartLabel(breadcrumb: string[]): string {
  return breadcrumb[0] ?? ''
}
