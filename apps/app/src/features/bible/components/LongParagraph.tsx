import { Platform } from 'react-native'

import { ReadingParagraph } from '@/components/ReadingParagraph'
import type { StyledSegment } from '@/lib/typography/justifyText'

// On Android the line model, over paragraphs as long as a Father's or a
// pope's, now and then places a line the platform then wraps when it draws;
// the lines below shift down and the paragraph's last one is never drawn
// (seen in the verse's commentary, API 35). Until that is understood the platform
// breaks these paragraphs there: justified less finely, but whole.
const platformBreaks = Platform.OS === 'android'

/** A paragraph of commentary or of a cited document, set as the reader's own text is. */
export function LongParagraph({
  source,
  language,
}: {
  source: StyledSegment[]
  language?: string
}) {
  return <ReadingParagraph source={source} language={language} platformBreaks={platformBreaks} />
}
