import { InlineRetry, type PsalmSlot, PsalmodyBlock } from '@/components'
import type { PsalmRef } from '@/lib/liturgical'
import { useDataProducer } from '@/producers'
import { psalmodyProducer } from '@/producers/psalmody'

export function PsalmodySlot({ psalms }: { psalms: PsalmRef[] }) {
  // Guard before the hook so requireArray doesn't blow up on empty lists.
  if (psalms.length === 0) return undefined
  return <PsalmodySlotInner psalms={psalms} />
}

function PsalmodySlotInner({ psalms }: { psalms: PsalmRef[] }) {
  const { data, isError, retry } = useDataProducer(psalmodyProducer, { psalms })
  if (isError) return <InlineRetry onRetry={retry} />
  const slots: PsalmSlot[] = data
    ? data.map(({ ref, verses }) => ({ ref, verses }))
    : psalms.map((ref) => ({ ref }))
  return <PsalmodyBlock slots={slots} />
}
