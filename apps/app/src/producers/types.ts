// Producer `kind` matches the consumer:
// - `reader`: HTML + anchor sidecar — rendered via ProducerHtmlBlock.
// - `flow`:   RenderedSection[] inlined into the surrounding flow.

import type { RenderedSection } from '@/content/types'

export type ProducerContext = {
  date: Date
  lang: string
  // Practice-program cursor when the host is a program practice. Drives the
  // cacheKey for program-shaped producers; absent for non-program practices.
  programDay?: number
  params?: Record<string, unknown>
}

export type ReaderProducerResult = {
  html: string
  anchors?: Record<string, unknown>
}

export type FlowProducerResult = {
  sections: RenderedSection[]
}

type Common = {
  id: string
  // Bumped to invalidate persistent caches across app versions.
  version: string
  // Identifies "when does my output change" — composed into the cache key.
  // Static documents return ''. Program-shaped producers return the day
  // number. Calendar-driven producers return a UTC day bucket. Each producer
  // owns the bucket so the call site doesn't guess.
  cacheKey: (ctx: ProducerContext) => string
}

export type ReaderProducer = Common & {
  kind: 'reader'
  produce: (ctx: ProducerContext) => Promise<ReaderProducerResult>
}

export type FlowProducer = Common & {
  kind: 'flow'
  produce: (ctx: ProducerContext) => Promise<FlowProducerResult>
}

export type Producer = ReaderProducer | FlowProducer
export type ProducerResult = ReaderProducerResult | FlowProducerResult
