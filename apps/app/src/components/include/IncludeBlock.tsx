import type { ReactNode } from 'react'
import { Text } from 'tamagui'
import type { RenderedSection } from '@/content/types'
import { getProducer } from '@/producers'
import type { ProducerResult } from '@/producers/types'
import { InlineRetry } from '../InlineRetry'
import { ProducerHtmlBlock } from './ProducerHtmlBlock'

type Props = {
  ref: string
  data: ProducerResult | undefined
  retry?: () => void
  onRefPress?: (ref: string) => void
  // Required for flow-kind producers — the host flow renderer recurses
  // through the producer's emitted sections.
  renderSection?: (section: RenderedSection, index: number) => ReactNode
}

export function IncludeBlock({ ref, data, retry, onRefPress, renderSection }: Props) {
  const producer = getProducer(ref)
  if (!producer) return <Text color="$colorDestructive">[Unknown producer: {ref}]</Text>
  if (!data && retry) return <InlineRetry onRetry={retry} />
  if (!data) return undefined

  if (producer.kind === 'reader' && 'html' in data) {
    return <ProducerHtmlBlock html={data.html} onRefPress={onRefPress} />
  }
  if (producer.kind === 'flow' && 'sections' in data) {
    if (!renderSection) return undefined
    return <>{data.sections.map(renderSection)}</>
  }
  // `data`-kind producers feed specialized renderers (BibleReadingBlock,
  // CccReadingBlock); they can't be inlined through `include`.
  if (producer.kind === 'data') {
    return <Text color="$colorDestructive">[Producer {ref} is data-kind; use a reading section]</Text>
  }
  return undefined
}
