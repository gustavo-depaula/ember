import { type PsalmSlot, PsalmodyBlock } from '@/components'
import type { PsalmodySlot as PsalmodyData } from '@/producers/psalmody'

export function PsalmodySlot({ data }: { data: PsalmodyData[] }) {
  if (data.length === 0) return undefined
  const slots: PsalmSlot[] = data.map(({ ref, verses }) => ({ ref, verses }))
  return <PsalmodyBlock slots={slots} />
}
