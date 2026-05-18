import { InlineRetry, type PsalmSlot, PsalmodyBlock } from '@/components'
import type { PsalmRef } from '@/lib/liturgical'
import { useProducer } from '@/producers'
import type { PsalmodySlot as PsalmodyProducerSlot } from '@/producers/psalmody'

export function PsalmodySlot({ psalms }: { psalms: PsalmRef[] }) {
  const { data, isError, retry } = useProducer('producer/psalmody', { psalms })
  if (psalms.length === 0) return undefined
  if (isError) return <InlineRetry onRetry={retry} />
  const result = data?.payload as { data: PsalmodyProducerSlot[] } | undefined
  const slots: PsalmSlot[] = result?.data
    ? result.data.map(({ ref, verses }) => ({ ref, verses }))
    : psalms.map((ref) => ({ ref }))
  return <PsalmodyBlock slots={slots} />
}
