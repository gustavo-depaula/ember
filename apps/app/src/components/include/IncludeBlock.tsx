import type { ReactNode } from 'react'
import { Text } from 'tamagui'
import type { ResolvedSection } from '@/content/resolvedTypes'
import { getProducer } from '@/producers'
import type { ProducerResult } from '@/producers/types'
import { ProducerHtmlBlock } from './ProducerHtmlBlock'

type Props = {
  ref: string
  data: ProducerResult
  resolvedSections?: ResolvedSection[]
  onRefPress?: (ref: string) => void
  // Required for flow-kind producers — the host walks the producer's emitted
  // (and now pre-resolved) sections.
  renderSection?: (section: ResolvedSection, index: number) => ReactNode
}

export function IncludeBlock({ ref, data, resolvedSections, onRefPress, renderSection }: Props) {
  const producer = getProducer(ref)
  if (!producer) return <Text color="$colorDestructive">[Unknown producer: {ref}]</Text>

  if (producer.kind === 'reader' && 'html' in data) {
    return <ProducerHtmlBlock html={data.html} onRefPress={onRefPress} />
  }
  if (producer.kind === 'flow' && resolvedSections && renderSection) {
    return <>{resolvedSections.map(renderSection)}</>
  }
  if (producer.kind === 'data') {
    return <Text color="$colorDestructive">[Producer {ref} is data-kind; use a reading section]</Text>
  }
  return undefined
}
