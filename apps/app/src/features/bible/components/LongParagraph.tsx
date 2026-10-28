import { ReadingParagraph } from '@/components/ReadingParagraph'
import type { StyledSegment } from '@/lib/typography/justifyText'

/** A paragraph of commentary or of a cited document, set as the reader's own text is. */
export function LongParagraph({
  source,
  language,
}: {
  source: StyledSegment[]
  language?: string
}) {
  return <ReadingParagraph source={source} language={language} />
}
