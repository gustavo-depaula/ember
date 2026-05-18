import { BibleReadingBlock, CccReadingBlock, InlineRetry } from '@/components'
import type { CccParagraph } from '@/lib/catechism'
import type { ChapterResult } from '@/lib/content'
import type { ReadingReference } from '@/lib/liturgical'
import { useProducer } from '@/producers'

function BibleReadingSlot({
  reference,
}: {
  reference: Extract<ReadingReference, { type: 'bible' }>
}) {
  const { data, isError, retry } = useProducer('producer/bible-chapter', {
    book: reference.book,
    chapter: reference.chapter,
  })
  if (isError) return <InlineRetry onRetry={retry} />
  const result = data?.payload as { data: ChapterResult } | undefined
  return (
    <BibleReadingBlock
      reference={reference}
      verses={result?.data.verses}
      fallback={result?.data.fallback}
    />
  )
}

function CccReadingSlot({
  reference,
}: {
  reference: Extract<ReadingReference, { type: 'catechism' }>
}) {
  const { data, isError, retry } = useProducer('producer/ccc-chapter', {
    start: reference.startParagraph,
    count: reference.count,
  })
  if (isError) return <InlineRetry onRetry={retry} />
  const result = data?.payload as { data: CccParagraph[] } | undefined
  return <CccReadingBlock reference={reference} paragraphs={result?.data} />
}

export function ReadingSlot({ reference }: { reference: ReadingReference }) {
  if (reference.type === 'bible') return <BibleReadingSlot reference={reference} />
  return <CccReadingSlot reference={reference} />
}
