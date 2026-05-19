import { BibleReadingBlock, CccReadingBlock } from '@/components'
import type { ReadingData } from '@/content/resolvedTypes'
import type { CccParagraph } from '@/lib/catechism'
import type { ChapterResult } from '@/lib/content'
import type { ReadingReference } from '@/lib/liturgical'

export function ReadingSlot({
  reference,
  data,
}: {
  reference: ReadingReference
  data: ReadingData
}) {
  if (reference.type === 'bible') {
    const chapter = data as ChapterResult
    return (
      <BibleReadingBlock
        reference={reference}
        verses={chapter.verses}
        fallback={chapter.fallback}
      />
    )
  }
  return <CccReadingBlock reference={reference} paragraphs={data as CccParagraph[]} />
}
