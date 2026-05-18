import { BibleReadingBlock, CccReadingBlock, InlineRetry } from '@/components'
import type { ReadingReference } from '@/lib/liturgical'
import { useDataProducer } from '@/producers'
import { bibleChapterProducer } from '@/producers/bible-chapter'
import { cccChapterProducer } from '@/producers/ccc-chapter'

function BibleReadingSlot({
  reference,
}: {
  reference: Extract<ReadingReference, { type: 'bible' }>
}) {
  const { data, isError, retry } = useDataProducer(bibleChapterProducer, {
    book: reference.book,
    chapter: reference.chapter,
  })
  if (isError) return <InlineRetry onRetry={retry} />
  return <BibleReadingBlock reference={reference} verses={data?.verses} fallback={data?.fallback} />
}

function CccReadingSlot({
  reference,
}: {
  reference: Extract<ReadingReference, { type: 'catechism' }>
}) {
  const { data, isError, retry } = useDataProducer(cccChapterProducer, {
    start: reference.startParagraph,
    count: reference.count,
  })
  if (isError) return <InlineRetry onRetry={retry} />
  return <CccReadingBlock reference={reference} paragraphs={data} />
}

export function ReadingSlot({ reference }: { reference: ReadingReference }) {
  if (reference.type === 'bible') return <BibleReadingSlot reference={reference} />
  return <CccReadingSlot reference={reference} />
}
