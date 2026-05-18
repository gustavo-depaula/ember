import type { ReactNode } from 'react'
import { Text } from 'tamagui'
import type { RenderedSection } from '@/content/types'
import { useProducer } from '@/producers'
import { InlineRetry } from '../InlineRetry'
import { ProducerHtmlBlock } from './ProducerHtmlBlock'

type Props = {
  ref: string
  params?: Record<string, unknown>
  onRefPress?: (ref: string) => void
  // Required for flow-kind producers — the host flow renderer recurses
  // through the producer's emitted sections.
  renderSection?: (section: RenderedSection, index: number) => ReactNode
}

export function IncludeBlock({ ref, params, onRefPress, renderSection }: Props) {
  const { producer, data, isError, retry } = useProducer(ref, params)
  if (!producer) return <Text color="$colorDestructive">[Unknown producer: {ref}]</Text>
  if (isError) return <InlineRetry onRetry={retry} />
  if (!data) return undefined

  const payload = data.payload
  if (producer.kind === 'reader' && 'html' in payload) {
    return <ProducerHtmlBlock html={payload.html} onRefPress={onRefPress} />
  }
  if (producer.kind === 'flow' && 'sections' in payload) {
    if (!renderSection) return undefined
    return <>{payload.sections.map(renderSection)}</>
  }
  if (producer.kind === 'data') {
    return <Text color="$colorDestructive">[Producer {ref} is data-kind; use a reading section]</Text>
  }
  return undefined
}
